import { NextRequest, NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/db";
import { isAdminRequest, unauthorized } from "@/lib/auth";
import {
  sendEmail,
  bookingApprovedEmail,
  bookingRejectedEmail,
} from "@/lib/email";
import { hasApprovedBooking, isSlotTakenForDate } from "@/lib/slots";
import {
  normalizeBallQuality,
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

  const approving = body.status === "approved";
  const rejecting = body.status === "rejected" || body.status === "cancelled";
  const assigningBalls =
    body.assignBalls === true ||
    (current.status === "approved" &&
      !body.status &&
      (body.ballsUsed !== undefined || body.ballQuality !== undefined));

  const recordingPayment = body.recordPayment === true || body.amountReceived !== undefined;

  if (recordingPayment) {
    const status = (body.status ?? current.status) as BookingStatus;
    if (status !== "approved" && body.status !== "approved") {
      return NextResponse.json(
        { error: "Payment can only be recorded for approved bookings" },
        { status: 400 }
      );
    }
    const received = Number(body.amountReceived);
    if (Number.isNaN(received) || received < 0) {
      return NextResponse.json({ error: "Invalid amount received" }, { status: 400 });
    }
    if (received > current.slotPrice) {
      return NextResponse.json(
        { error: `Amount cannot exceed session price (${current.slotPrice})` },
        { status: 400 }
      );
    }
  }

  if (approving) {
    if (
      hasApprovedBooking(
        existing.bookings,
        current.slotId,
        current.date,
        id
      )
    ) {
      return NextResponse.json(
        { error: "This session already has an approved booking for this date" },
        { status: 400 }
      );
    }
    if (
      isSlotTakenForDate(
        existing.bookings.filter((b) => b.id !== id && b.status !== "pending"),
        current.slotId,
        current.date
      )
    ) {
      return NextResponse.json(
        { error: "Another booking already holds this session" },
        { status: 400 }
      );
    }
  }

  if (assigningBalls && current.status !== "approved" && body.status !== "approved") {
    return NextResponse.json(
      { error: "Approve the booking first, then assign balls after the match" },
      { status: 400 }
    );
  }

  const clearingBalls = body.ballQuality === null || body.ballsUsed === 0;
  const ballsUsed = clearingBalls
    ? 0
    : body.ballsUsed !== undefined
      ? Number(body.ballsUsed) || 0
      : Number(current.ballsUsed) || 0;
  const ballQuality = clearingBalls
    ? undefined
    : normalizeBallQuality(
        String(body.ballQuality ?? current.ballQuality ?? "")
      ) || undefined;

  if (assigningBalls && ballsUsed > 0 && !ballQuality) {
    return NextResponse.json(
      { error: "Select ball quality when assigning balls" },
      { status: 400 }
    );
  }

  if (assigningBalls && ballsUsed > 0 && ballQuality) {
    const { error } = upsertBallUsageForBooking(
      existing,
      { ...current, status: "approved" },
      ballQuality,
      ballsUsed
    );
    if (error) return NextResponse.json({ error }, { status: 400 });
  }

  const competingPending =
    approving
      ? existing.bookings.filter(
          (b) =>
            b.id !== id &&
            b.status === "pending" &&
            b.slotId === current.slotId &&
            b.date === current.date
        )
      : [];

  const store = await updateStore((s) => {
    const idx = s.bookings.findIndex((b) => b.id === id);
    if (idx === -1) return s;

    const booking = { ...s.bookings[idx] };
    let ballUsage = s.ballUsage;
    let bookings = [...s.bookings];

    if (body.status) booking.status = body.status as BookingStatus;

    if (booking.status === "rejected" || booking.status === "cancelled") {
      ballUsage = removeBallUsageForBooking(s, id);
      delete booking.ballQuality;
      delete booking.ballsUsed;
      delete booking.amountReceived;
    } else if (booking.status === "approved") {
      if (recordingPayment) {
        booking.amountReceived = Number(body.amountReceived) || 0;
      }
      if (approving) {
        bookings = bookings.map((b) => {
          if (
            b.id !== id &&
            b.status === "pending" &&
            b.slotId === booking.slotId &&
            b.date === booking.date
          ) {
            return { ...b, status: "rejected" as BookingStatus };
          }
          return b;
        });
      }

      if (assigningBalls) {
        if (ballsUsed > 0 && ballQuality) {
          const result = upsertBallUsageForBooking(s, booking, ballQuality, ballsUsed);
          if (result.error) return s;
          ballUsage = result.ballUsage;
          booking.ballQuality = ballQuality;
          booking.ballsUsed = ballsUsed;
        } else if (clearingBalls) {
          ballUsage = removeBallUsageForBooking(s, id);
          delete booking.ballQuality;
          delete booking.ballsUsed;
        }
      }
    }

    bookings[idx] = booking;
    return { ...s, bookings, ballUsage };
  });

  const booking = store.bookings.find((b) => b.id === id)!;

  if (approving && booking.email && !booking.walkIn) {
    const email = bookingApprovedEmail(
      booking.customerName,
      booking.id,
      booking.date,
      booking.slotLabel,
      booking.slotPrice
    );
    await sendEmail(booking.email, email);
  } else if (rejecting && booking.email && !booking.walkIn) {
    const email = bookingRejectedEmail(
      booking.customerName,
      booking.id,
      booking.date,
      booking.slotLabel
    );
    await sendEmail(booking.email, email);
  }

  for (const b of competingPending) {
    if (b.email && !b.walkIn) {
      const email = bookingRejectedEmail(
        b.customerName,
        b.id,
        b.date,
        b.slotLabel
      );
      await sendEmail(b.email, email);
    }
  }

  return NextResponse.json({ booking });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) return unauthorized();
  const { id } = await params;

  const existing = await readStore();
  if (!existing.bookings.some((b) => b.id === id)) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  await updateStore((s) => ({
    ...s,
    bookings: s.bookings.filter((b) => b.id !== id),
    ballUsage: removeBallUsageForBooking(s, id),
  }));

  return NextResponse.json({ ok: true, message: "Booking deleted" });
}
