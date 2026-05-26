import { NextRequest, NextResponse } from "next/server";
import { readStore, updateStore, generateId } from "@/lib/db";
import { isAdminRequest, unauthorized } from "@/lib/auth";
import { sendEmail, bookingReceivedEmail } from "@/lib/email";
import type { Booking, MatchType } from "@/lib/types";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  const store = await readStore();
  const status = req.nextUrl.searchParams.get("status");
  const date = req.nextUrl.searchParams.get("date");
  let bookings = [...store.bookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  if (status && status !== "all") bookings = bookings.filter((b) => b.status === status);
  if (date) bookings = bookings.filter((b) => b.date === date);
  return NextResponse.json({ bookings });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const store = await readStore();

    const slot = store.slots.find((s) => s.id === body.slotId);
    if (!slot || !slot.available) {
      return NextResponse.json({ error: "Selected slot is not available" }, { status: 400 });
    }
    if (store.blockedDates.includes(body.date)) {
      return NextResponse.json({ error: "Selected date is blocked" }, { status: 400 });
    }

    const pct = slot.advancePercentage ?? store.advancePercentage;
    const total = slot.price;
    const advancePaid = Math.round((total * pct) / 100);

    const booking: Booking = {
      id: generateId("BK"),
      customerName: body.customerName?.trim(),
      email: body.email?.trim(),
      phone: body.phone?.trim(),
      address: body.address?.trim(),
      date: body.date,
      slotId: body.slotId,
      slotLabel: slot.label,
      playersOrTeam: body.playersOrTeam?.trim() ?? "",
      matchType: (body.matchType as MatchType) ?? "friendly",
      specialRequest: body.specialRequest?.trim(),
      totalAmount: total,
      advancePaid,
      advancePercentage: pct,
      paymentStatus: body.paymentStatus === "paid" ? "paid" : "pending",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    if (!booking.customerName || !booking.email || !booking.phone || !booking.address || !booking.date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await updateStore((s) => ({ ...s, bookings: [booking, ...s.bookings] }));

    const { subject, body: emailBody } = bookingReceivedEmail(
      booking.customerName,
      booking.id,
      booking.date,
      booking.slotLabel
    );
    await sendEmail(booking.email, subject, emailBody);

    return NextResponse.json({ booking, message: "Booking request received" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
