import type { AppStore, Booking, TimeSlot } from "./types";

export function hasApprovedBooking(
  bookings: Booking[],
  slotId: string,
  date: string
): boolean {
  return bookings.some(
    (b) => b.slotId === slotId && b.date === date && b.status === "approved"
  );
}

export function hasPendingBooking(
  bookings: Booking[],
  slotId: string,
  date: string
): boolean {
  return bookings.some(
    (b) => b.slotId === slotId && b.date === date && b.status === "pending"
  );
}

export function isSlotAvailableForUser(
  slot: TimeSlot,
  date: string,
  bookings: Booking[]
): boolean {
  if (!slot.available) return false;
  if (slot.date && slot.date !== date) return false;
  return !hasApprovedBooking(bookings, slot.id, date);
}

export function getSlotsForDate(
  store: AppStore,
  date: string
): (TimeSlot & { underReview?: boolean })[] {
  const templates = store.slots.filter((s) => !s.date || s.date === date);

  return templates
    .filter((s) => isSlotAvailableForUser(s, date, store.bookings))
    .map((s) => ({
      ...s,
      underReview: hasPendingBooking(store.bookings, s.id, date),
    }));
}

export function getAdminSlotStatus(
  slot: TimeSlot,
  date: string,
  bookings: Booking[]
): "available" | "booked" | "under_review" | "blocked" {
  if (!slot.available) return "blocked";
  if (hasApprovedBooking(bookings, slot.id, date)) return "booked";
  if (hasPendingBooking(bookings, slot.id, date)) return "under_review";
  return "available";
}
