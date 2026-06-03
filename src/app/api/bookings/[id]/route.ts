import { NextRequest, NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/db";
import { isAdminRequest, unauthorized } from "@/lib/auth";
import {
  sendEmail,
  bookingApprovedEmail,
  bookingRejectedEmail,
} from "@/lib/email";
import { hasApprovedBooking } from "@/lib/slots";
import {
  removeBallUsageForBooking,
  upsertBallUsageForBooking,
} from "@/lib/ball-stock";
import type { BallQuality, BookingStatus } from "@/lib/types";

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

  const nextStatus = (body.status ?? current.status) as BookingStatus;

  if (nextStatus === "approved" && body.status === "approved") {
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

  const clearingBalls = body.ballQuality === null || body.ballsUsed === 0;
  const ballsUsed = clearingBalls
    ? 0
    : body.ballsUsed !== undefined
      ? Number(body.ballsUsed) || 0
      : Number(current.ballsUsed) || 0;
  const ballQuality = clearingBalls
    ? undefined
    : ((body.ballQuality ?? current.ballQuality) as BallQuality | undefined);

  if (ballsUsed > 0 && !ballQuality) {
    return NextResponse.json({ error: "Select ball quality when assigning balls" }, { status: 400 });
  }

  if (nextStatus === "approved" && ballsUsed > 0 && ballQuality) {
    const { error } = upsertBallUsageForBooking(existing, current, ballQuality, ballsUsed);
    if (error) return NextResponse.json({ error }, { status: 400 });
  }

  const store = await updateStore((s) => {
    const idx = s.bookings.findIndex((b) => b.id === id);
    if (idx === -1) return s;

    const booking = { ...s.bookings[idx] };
    if (body.status) booking.status = body.status as BookingStatus;

    let ballUsage = s.ballUsage;

    if (booking.status === "rejected" || booking.status === "cancelled") {
      ballUsage = removeBallUsageForBooking(s, id);
      delete booking.ballQuality;
      delete booking.ballsUsed;
    } else if (booking.status === "approved") {
      if (ballsUsed > 0 && ballQuality) {
        const result = upsertBallUsageForBooking(s, booking, ballQuality, ballsUsed);
        if (result.error) return s;
        ballUsage = result.ballUsage;
        booking.ballQuality = ballQuality;
        booking.ballsUsed = ballsUsed;
      } else {
        ballUsage = removeBallUsageForBooking(s, id);
        delete booking.ballQuality;
        delete booking.ballsUsed;
      }
    }

    const bookings = [...s.bookings];
    bookings[idx] = booking;
    return { ...s, bookings, ballUsage };
  });

  const booking = store.bookings.find((b) => b.id === id)!;

  if (body.status === "approved" && booking.email && !booking.walkIn) {
    const email = bookingApprovedEmail(
      booking.customerName,
      booking.id,
      booking.date,
      booking.slotLabel,
      booking.slotPrice
    );
    await sendEmail(booking.email, email);
  } else if (body.status === "rejected" && booking.email && !booking.walkIn) {
    const email = bookingRejectedEmail(
      booking.customerName,
      booking.id,
      booking.date,
      booking.slotLabel
    );
    await sendEmail(booking.email, email);
  }

  return NextResponse.json({ booking });
}
