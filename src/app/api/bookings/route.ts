import { NextRequest, NextResponse } from "next/server";
import { readStore, updateStore, generateId } from "@/lib/db";
import { isAdminRequest, unauthorized } from "@/lib/auth";
import { sendEmail, bookingReceivedEmail } from "@/lib/email";
import { isSlotAvailableForUser } from "@/lib/slots";
import type { BallQuality, Booking, MatchType } from "@/lib/types";
import { normalizeBallQuality, upsertBallUsageForBooking } from "@/lib/ball-stock";

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
    const walkIn = Boolean(body.walkIn);

    if (walkIn && !isAdminRequest(req)) return unauthorized();

    const slot = store.slots.find((s) => s.id === body.slotId);
    if (!slot) {
      return NextResponse.json({ error: "Selected slot not found" }, { status: 400 });
    }
    if (store.blockedDates.includes(body.date)) {
      return NextResponse.json({ error: "Selected date is blocked" }, { status: 400 });
    }
    if (!isSlotAvailableForUser(slot, body.date, store.bookings)) {
      return NextResponse.json({ error: "Selected slot is not available" }, { status: 400 });
    }
    const ballsUsed = Number(body.ballsUsed) || 0;
    const ballQualityRaw = body.ballQuality as string | undefined;
    const ballQuality = ballQualityRaw ? normalizeBallQuality(ballQualityRaw) : undefined;
    const amountReceivedRaw = body.amountReceived;
    let amountReceived: number | undefined;
    if (walkIn && amountReceivedRaw !== undefined && amountReceivedRaw !== "") {
      amountReceived = Number(amountReceivedRaw);
      if (Number.isNaN(amountReceived) || amountReceived < 0) {
        return NextResponse.json({ error: "Invalid amount received" }, { status: 400 });
      }
    }

    const udhariRaw = body.udhariAmount;
    let udhariAmount: number | undefined;
    if (walkIn && udhariRaw !== undefined && udhariRaw !== "") {
      udhariAmount = Number(udhariRaw);
      if (Number.isNaN(udhariAmount) || udhariAmount < 0) {
        return NextResponse.json({ error: "Invalid udhari amount" }, { status: 400 });
      }
    }

    const booking: Booking = {
      id: generateId("BK"),
      customerName: body.customerName?.trim(),
      email: (body.email?.trim() || (walkIn ? "walkin@crossline.local" : "")),
      phone: body.phone?.trim() || "",
      address: body.address?.trim() || (walkIn ? "Walk-in" : ""),
      date: body.date,
      slotId: body.slotId,
      slotLabel: slot.label,
      slotPrice: slot.price,
      matchType: (body.matchType as MatchType) ?? "friendly",
      specialRequest: body.specialRequest?.trim(),
      status: walkIn ? "approved" : "pending",
      createdAt: new Date().toISOString(),
      walkIn: walkIn || undefined,
      ballQuality: walkIn && ballsUsed > 0 ? ballQuality : undefined,
      ballsUsed: walkIn && ballsUsed > 0 ? ballsUsed : undefined,
      amountReceived: walkIn ? amountReceived : undefined,
      udhariAmount: walkIn ? udhariAmount : undefined,
      receivedByOwnerId:
        walkIn && body.receivedByOwnerId
          ? String(body.receivedByOwnerId).trim() || undefined
          : undefined,
    };

    if (walkIn) {
      if (!booking.customerName || !booking.date) {
        return NextResponse.json({ error: "Name and date are required" }, { status: 400 });
      }
      if (ballsUsed > 0 && !ballQuality) {
        return NextResponse.json({ error: "Select ball quality" }, { status: 400 });
      }
      if (ballsUsed > 0 && ballQuality) {
        const { error } = upsertBallUsageForBooking(store, booking, ballQuality, ballsUsed);
        if (error) return NextResponse.json({ error }, { status: 400 });
      }
    } else if (
      !booking.customerName ||
      !booking.email ||
      !booking.address ||
      !booking.date
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await updateStore((s) => {
      let ballUsage = s.ballUsage;
      if (walkIn && ballsUsed > 0 && ballQuality) {
        const result = upsertBallUsageForBooking(s, booking, ballQuality, ballsUsed);
        if (!result.error) ballUsage = result.ballUsage;
      }
      return { ...s, bookings: [booking, ...s.bookings], ballUsage };
    });

    if (!walkIn) {
      const email = bookingReceivedEmail(
        booking.customerName,
        booking.id,
        booking.date,
        booking.slotLabel
      );
      await sendEmail(booking.email, email);
    }

    return NextResponse.json(
      { booking, message: walkIn ? "Walk-in booking saved" : "Booking request received" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
