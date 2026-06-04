import type { AppStore, BallQuality, BallUsage, Booking } from "./types";
import { getQualityLabel } from "./qualities";
import { getBallStock } from "./finance";
import { generateId } from "./id";
export function normalizeBallQuality(quality: string): string {
  return quality.trim();
}

export function getAvailableBalls(
  store: AppStore,
  quality: BallQuality,
  excludeBookingId?: string,
  excludeUsageId?: string
): number {
  const key = normalizeBallQuality(quality);
  if (!key) return 0;
  const stock = getBallStock(store);
  let available = stock.find((s) => s.quality === key)?.remaining ?? 0;
  if (excludeBookingId) {
    const linked = store.ballUsage.find((u) => u.bookingId === excludeBookingId);
    if (linked && normalizeBallQuality(linked.quality) === key) available += linked.quantity;
  }
  if (excludeUsageId) {
    const editing = store.ballUsage.find((u) => u.id === excludeUsageId);
    if (editing && normalizeBallQuality(editing.quality) === key) available += editing.quantity;
  }
  return available;
}

export function bookingMatchLabel(booking: Booking): string {
  if (booking.teamName.includes(" vs ")) return booking.teamName;
  return booking.teamName;
}

export function upsertBallUsageForBooking(
  store: AppStore,
  booking: Booking,
  quality: BallQuality,
  quantity: number
): { ballUsage: BallUsage[]; error?: string } {
  if (quantity < 0) return { ballUsage: store.ballUsage, error: "Invalid quantity" };
  const q = normalizeBallQuality(quality);
  if (!q) return { ballUsage: store.ballUsage, error: "Enter ball quality" };
  const available = getAvailableBalls(store, q, booking.id);
  if (quantity > available) {
    return {
      ballUsage: store.ballUsage,
      error: `Only ${available} "${q}" ball(s) available`,
    };
  }

  const without = store.ballUsage.filter((u) => u.bookingId !== booking.id);
  if (quantity === 0) {
    return { ballUsage: without };
  }

  const entry: BallUsage = {
    id: store.ballUsage.find((u) => u.bookingId === booking.id)?.id ?? generateId("BU"),
    bookingId: booking.id,
    matchName: bookingMatchLabel(booking),
    quality: q,
    quantity,
    date: booking.date,
    notes: `Booking ${booking.id}`,
  };

  return { ballUsage: [entry, ...without] };
}

export function removeBallUsageForBooking(store: AppStore, bookingId: string): BallUsage[] {
  return store.ballUsage.filter((u) => u.bookingId !== bookingId);
}
