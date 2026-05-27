import { NextRequest, NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/db";
import { isAdminRequest, unauthorized } from "@/lib/auth";
import {
  sendEmail,
  bookingApprovedEmail,
  bookingRejectedEmail,
} from "@/lib/email";
import { hasApprovedBooking } from "@/lib/slots";
import type { BookingStatus } from "@/lib/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) return unauthorized();
  const { id } = await params;
  const body = await req.json();

  const existing = await readStore();
  const current = existing.bookings.find((b) => b.id === id);
  if (!current) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (body.status === "approved") {
    if (
      hasApprovedBooking(
        existing.bookings.filter((b) => b.id !== id),
        current.slotId,
        current.date
      )
    ) {
      return NextResponse.json(
        { error: "Slot already has an approved booking for this date" },
        { status: 400 }
      );
    }
  }

  const store = await updateStore((s) => {
    const idx = s.bookings.findIndex((b) => b.id === id);
    if (idx === -1) return s;
    const booking = { ...s.bookings[idx] };
    if (body.status) booking.status = body.status as BookingStatus;
    const bookings = [...s.bookings];
    bookings[idx] = booking;
    return { ...s, bookings };
  });

  const booking = store.bookings.find((b) => b.id === id)!;

  if (body.status === "approved") {
    const { subject, body: emailBody } = bookingApprovedEmail(
      booking.customerName,
      booking.id,
      booking.date,
      booking.slotLabel,
      booking.slotPrice
    );
    await sendEmail(booking.email, subject, emailBody);
  } else if (body.status === "rejected") {
    const { subject, body: emailBody } = bookingRejectedEmail(
      booking.customerName,
      booking.id,
      booking.date,
      booking.slotLabel
    );
    await sendEmail(booking.email, subject, emailBody);
  }

  return NextResponse.json({ booking });
}
