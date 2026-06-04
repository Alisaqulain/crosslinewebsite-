import type { AppStore, Booking, BookingSlotView, TimeSlot } from "./types";

export function isSessionActiveOnDate(slot: TimeSlot, date: string): boolean {
  const validity = slot.validity ?? (slot.date ? "date_range" : "lifetime");

  if (validity === "lifetime") {
    if (slot.date && slot.date !== date) return false;
    return true;
  }

  const from = slot.validFrom ?? slot.date ?? "";
  const to = slot.validTo ?? slot.date ?? from;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export function formatSessionValidity(slot: TimeSlot): string {
  const validity = slot.validity ?? (slot.date ? "date_range" : "lifetime");
  if (validity === "lifetime") return "Lifetime";
  const from = slot.validFrom ?? slot.date;
  const to = slot.validTo ?? slot.date ?? from;
  if (!from) return "Date range (set dates)";
  if (!to || to === from) return `From ${from}`;
  return `${from} → ${to}`;
}

export function hasApprovedBooking(
  bookings: Booking[],
  slotId: string,
  date: string,
  excludeBookingId?: string
): boolean {
  return bookings.some(
    (b) =>
      b.id !== excludeBookingId &&
      b.slotId === slotId &&
      b.date === date &&
      b.status === "approved"
  );
}

export function hasPendingBooking(
  bookings: Booking[],
  slotId: string,
  date: string,
  excludeBookingId?: string
): boolean {
  return bookings.some(
    (b) =>
      b.id !== excludeBookingId &&
      b.slotId === slotId &&
      b.date === date &&
      b.status === "pending"
  );
}

/** One session per date — pending or approved blocks the slot */
export function isSlotTakenForDate(
  bookings: Booking[],
  slotId: string,
  date: string,
  excludeBookingId?: string
): boolean {
  return (
    hasApprovedBooking(bookings, slotId, date, excludeBookingId) ||
    hasPendingBooking(bookings, slotId, date, excludeBookingId)
  );
}

export function isSlotAvailableForUser(
  slot: TimeSlot,
  date: string,
  bookings: Booking[]
): boolean {
  if (!slot.available) return false;
  if (!isSessionActiveOnDate(slot, date)) return false;
  return !isSlotTakenForDate(bookings, slot.id, date);
}

export function getBookingSlotsForDate(store: AppStore, date: string): BookingSlotView[] {
  return store.slots
    .filter((s) => isSessionActiveOnDate(s, date))
    .map((s) => {
      const underReview = hasPendingBooking(store.bookings, s.id, date);
      const booked = hasApprovedBooking(store.bookings, s.id, date);
      let statusLabel: string | undefined;
      if (!s.available) statusLabel = "Closed — not open for booking";
      else if (booked) statusLabel = "Session already booked";
      else if (underReview) statusLabel = "Under review — slot held until admin decides";

      return {
        ...s,
        bookable: isSlotAvailableForUser(s, date, store.bookings),
        statusLabel,
        underReview,
      };
    });
}

/** @deprecated Use getBookingSlotsForDate */
export function getSlotsForDate(store: AppStore, date: string): BookingSlotView[] {
  return getBookingSlotsForDate(store, date).filter((s) => s.bookable);
}

export function getAdminSlotStatus(
  slot: TimeSlot,
  date: string,
  bookings: Booking[]
): "available" | "booked" | "under_review" | "blocked" {
  if (!slot.available || !isSessionActiveOnDate(slot, date)) return "blocked";
  if (hasApprovedBooking(bookings, slot.id, date)) return "booked";
  if (hasPendingBooking(bookings, slot.id, date)) return "under_review";
  return "available";
}
