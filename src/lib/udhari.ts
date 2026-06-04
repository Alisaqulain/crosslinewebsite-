import type { Booking } from "./types";

export function bookingAmountReceived(b: Booking): number {
  return typeof b.amountReceived === "number" ? b.amountReceived : 0;
}

/** Remaining balance (udhari) for approved bookings */
export function bookingUdhari(b: Booking): number {
  if (b.status !== "approved") return 0;
  return Math.max(0, b.slotPrice - bookingAmountReceived(b));
}

export interface UdhariAccount {
  booking: Booking;
  received: number;
  udhari: number;
  source: "walk-in" | "online";
}

export interface UdhariSummary {
  totalUdhari: number;
  totalReceived: number;
  totalBilled: number;
  countWithUdhari: number;
  approvedCount: number;
  accounts: UdhariAccount[];
}

export function getUdhariSummary(bookings: Booking[]): UdhariSummary {
  const approved = bookings.filter((b) => b.status === "approved");
  const accounts: UdhariAccount[] = approved
    .map((booking) => ({
      booking,
      received: bookingAmountReceived(booking),
      udhari: bookingUdhari(booking),
      source: booking.walkIn ? ("walk-in" as const) : ("online" as const),
    }))
    .filter((a) => a.udhari > 0)
    .sort((a, b) => b.udhari - a.udhari);

  return {
    totalUdhari: accounts.reduce((s, a) => s + a.udhari, 0),
    totalReceived: approved.reduce((s, b) => s + bookingAmountReceived(b), 0),
    totalBilled: approved.reduce((s, b) => s + b.slotPrice, 0),
    countWithUdhari: accounts.length,
    approvedCount: approved.length,
    accounts,
  };
}
