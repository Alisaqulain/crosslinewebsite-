import type { AppStore, BallQuality, BallUsage, Booking, OtherIncome } from "./types";
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
  excludeUsageId?: string,
  excludeOtherIncomeId?: string
): number {
  const key = normalizeBallQuality(quality);
  if (!key) return 0;
  const stock = getBallStock(store);
  let available = stock.find((s) => s.quality === key)?.remaining ?? 0;
  if (excludeBookingId) {
    const linked = store.ballUsage.find((u) => u.bookingId === excludeBookingId);
    if (linked && normalizeBallQuality(linked.quality) === key) available += linked.quantity;
  }
  if (excludeOtherIncomeId) {
    const linked = store.ballUsage.find((u) => u.otherIncomeId === excludeOtherIncomeId);
    if (linked && normalizeBallQuality(linked.quality) === key) available += linked.quantity;
  }
  if (excludeUsageId) {
    const editing = store.ballUsage.find((u) => u.id === excludeUsageId);
    if (editing && normalizeBallQuality(editing.quality) === key) available += editing.quantity;
  }
  return available;
}

export function bookingMatchLabel(booking: Booking): string {
  if (booking.teamName?.trim()) return booking.teamName.trim();
  return booking.customerName;
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

export function isBallSaleIncome(income: OtherIncome): boolean {
  return income.category === "Ball sale" && (income.ballsSold ?? 0) > 0;
}

/** Keep ball stock in sync when other income includes ball sales */
export function syncBallUsageFromOtherIncomes(
  store: AppStore,
  incomes: OtherIncome[]
): { ballUsage: BallUsage[]; error?: string } {
  const saleIds = new Set(incomes.filter(isBallSaleIncome).map((i) => i.id));
  let ballUsage = store.ballUsage.filter(
    (u) => !u.otherIncomeId || saleIds.has(u.otherIncomeId)
  );

  for (const income of incomes) {
    if (!isBallSaleIncome(income)) {
      ballUsage = ballUsage.filter((u) => u.otherIncomeId !== income.id);
      continue;
    }
    const q = normalizeBallQuality(income.ballQuality ?? "");
    if (!q) {
      return { ballUsage: store.ballUsage, error: `Enter ball quality for "${income.title}"` };
    }
    const quantity = income.ballsSold ?? 0;
    const tempStore = { ...store, ballUsage };
    const available = getAvailableBalls(tempStore, q, undefined, undefined, income.id);
    if (quantity > available) {
      return {
        ballUsage: store.ballUsage,
        error: `Only ${available} "${q}" ball(s) available for "${income.title}"`,
      };
    }
    const existing = ballUsage.find((u) => u.otherIncomeId === income.id);
    const entry: BallUsage = {
      id: existing?.id ?? generateId("BU"),
      otherIncomeId: income.id,
      matchName: income.title,
      quality: q,
      quantity,
      date: income.date,
      notes: `Ball sale — ${income.title}`,
    };
    ballUsage = [entry, ...ballUsage.filter((u) => u.otherIncomeId !== income.id)];
  }

  ballUsage = ballUsage.filter((u) => !u.otherIncomeId || saleIds.has(u.otherIncomeId));
  return { ballUsage };
}
