import type { AppStore, BallQuality, BallUsage, Booking } from "./types";
import { BALL_QUALITY_LABELS } from "./types";
import { getBallStock } from "./finance";
import { generateId } from "./id";

export function getAvailableBalls(
  store: AppStore,
  quality: BallQuality,
  excludeBookingId?: string,
  excludeUsageId?: string
): number {
  const stock = getBallStock(store);
  let available = stock.find((s) => s.quality === quality)?.remaining ?? 0;
  if (excludeBookingId) {
    const linked = store.ballUsage.find((u) => u.bookingId === excludeBookingId);
    if (linked?.quality === quality) available += linked.quantity;
  }
  if (excludeUsageId) {
    const editing = store.ballUsage.find((u) => u.id === excludeUsageId);
    if (editing?.quality === quality) available += editing.quantity;
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
  const available = getAvailableBalls(store, quality, booking.id);
  if (quantity > available) {
    return {
      ballUsage: store.ballUsage,
      error: `Only ${available} ${BALL_QUALITY_LABELS[quality]} ball(s) available`,
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
    quality,
    quantity,
    date: booking.date,
    notes: `Booking ${booking.id}`,
  };

  return { ballUsage: [entry, ...without] };
}

export function removeBallUsageForBooking(store: AppStore, bookingId: string): BallUsage[] {
  return store.ballUsage.filter((u) => u.bookingId !== bookingId);
}

const ALL_QUALITIES: BallQuality[] = ["low", "medium", "high"];

export function getBallQualityOptions(
  store: AppStore,
  excludeBookingId?: string,
  excludeUsageId?: string
): { value: BallQuality; label: string; available: number; disabled: boolean }[] {
  return ALL_QUALITIES.map((quality) => {
    const available = getAvailableBalls(store, quality, excludeBookingId, excludeUsageId);
    return {
      value: quality,
      label: BALL_QUALITY_LABELS[quality],
      available,
      disabled: available === 0,
    };
  });
}

export function firstAvailableQuality(
  store: AppStore,
  excludeBookingId?: string,
  prefer?: BallQuality,
  excludeUsageId?: string
): BallQuality | null {
  const options = getBallQualityOptions(store, excludeBookingId, excludeUsageId);
  if (prefer) {
    const pref = options.find((o) => o.value === prefer && !o.disabled);
    if (pref) return pref.value;
  }
  return options.find((o) => !o.disabled)?.value ?? null;
}
