import type { AppStore, Booking, StadiumMatch } from "./types";
import { completedMatches, matchAmountReceived, matchUdhari } from "./matches";

export function bookingAmountReceived(b: Booking): number {
  return typeof b.amountReceived === "number" ? b.amountReceived : 0;
}

/** @deprecated Legacy hint only — udhari is never auto-applied */
export function suggestedBookingUdhari(b: Booking): number {
  return Math.max(0, b.slotPrice - bookingAmountReceived(b));
}

/** Pending balance — only what admin entered. Blank = ₹0 (no auto calc). */
export function bookingUdhari(b: Booking): number {
  if (b.status !== "approved") return 0;
  if (typeof b.udhariAmount === "number" && !Number.isNaN(b.udhariAmount)) {
    return Math.max(0, b.udhariAmount);
  }
  return 0;
}

export type UdhariSource = "walk-in" | "online" | "old-session";

export interface UdhariAccount {
  id: string;
  kind: "booking" | "old-session";
  customerName: string;
  phone: string;
  date: string;
  slotLabel: string;
  sessionPrice: number;
  received: number;
  udhari: number;
  source: UdhariSource;
  booking?: Booking;
  oldSession?: StadiumMatch;
}

export interface UdhariSummary {
  totalUdhari: number;
  totalReceived: number;
  totalBilled: number;
  countWithUdhari: number;
  approvedCount: number;
  accounts: UdhariAccount[];
}

function bookingAccount(b: Booking): UdhariAccount {
  return {
    id: b.id,
    kind: "booking",
    customerName: b.customerName,
    phone: b.phone,
    date: b.date,
    slotLabel: b.slotLabel,
    sessionPrice: b.slotPrice,
    received: bookingAmountReceived(b),
    udhari: bookingUdhari(b),
    source: b.walkIn ? "walk-in" : "online",
    booking: b,
  };
}

function oldSessionAccount(m: StadiumMatch): UdhariAccount {
  return {
    id: m.id,
    kind: "old-session",
    customerName: m.customerName,
    phone: m.phone ?? "",
    date: m.date,
    slotLabel: m.slotLabel,
    sessionPrice: m.slotPrice,
    received: matchAmountReceived(m),
    udhari: matchUdhari(m),
    source: "old-session",
    oldSession: m,
  };
}

export function getUdhariSummary(bookings: Booking[]): UdhariSummary {
  const approved = bookings.filter((b) => b.status === "approved");
  const accounts = approved
    .map(bookingAccount)
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

/** Bookings + old sessions — full udhari for admin & dashboard */
export function getStoreUdhariSummary(store: AppStore): UdhariSummary {
  const bookingRows = store.bookings.filter((b) => b.status === "approved").map(bookingAccount);
  const sessionRows = completedMatches(store).map(oldSessionAccount);
  const all = [...bookingRows, ...sessionRows];

  const accounts = all.filter((a) => a.udhari > 0).sort((a, b) => b.udhari - a.udhari);

  return {
    totalUdhari: accounts.reduce((s, a) => s + a.udhari, 0),
    totalReceived: all.reduce((s, a) => s + a.received, 0),
    totalBilled: all.reduce((s, a) => s + a.sessionPrice, 0),
    countWithUdhari: accounts.length,
    approvedCount: all.length,
    accounts,
  };
}
