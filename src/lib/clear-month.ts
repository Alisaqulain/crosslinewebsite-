import type { AppStore } from "./types";
import { getCalendarMonthRange, getDateRangeLabel } from "./finance-export";

function inRange(date: string, from: string, to: string): boolean {
  return date >= from && date <= to;
}

export interface ClearPeriodPreview {
  label: string;
  from: string;
  to: string;
  bookings: number;
  oldSessions: number;
  oldExpenses: number;
  oldIncomes: number;
  oldDiesel: number;
  dieselExpenses: number;
  otherExpenses: number;
  otherIncomes: number;
  financeEntries: number;
  ballPurchases: number;
  ballUsage: number;
  totalRecords: number;
}

/** @deprecated use ClearPeriodPreview */
export type ClearMonthPreview = ClearPeriodPreview;

export function previewClearPeriod(store: AppStore, from: string, to: string): ClearPeriodPreview {
  if (from > to) {
    return {
      label: getDateRangeLabel(from, to),
      from,
      to,
      bookings: 0,
      oldSessions: 0,
      oldExpenses: 0,
      oldIncomes: 0,
      oldDiesel: 0,
      dieselExpenses: 0,
      otherExpenses: 0,
      otherIncomes: 0,
      financeEntries: 0,
      ballPurchases: 0,
      ballUsage: 0,
      totalRecords: 0,
    };
  }

  const inPeriod = (date: string) => inRange(date, from, to);

  const bookings = store.bookings.filter((b) => inPeriod(b.date)).length;
  const oldSessions = (store.matches ?? []).filter((m) => inPeriod(m.date)).length;
  const oldExpenses = (store.oldExpenses ?? []).filter((o) => inPeriod(o.date)).length;
  const oldIncomes = (store.oldIncomes ?? []).filter((i) => inPeriod(i.date)).length;
  const oldDiesel = (store.oldDieselExpenses ?? []).filter((d) => inPeriod(d.date)).length;
  const dieselExpenses = store.dieselExpenses.filter((d) => inPeriod(d.date)).length;
  const otherExpenses = (store.otherExpenses ?? []).filter((o) => inPeriod(o.date)).length;
  const otherIncomes = (store.otherIncomes ?? []).filter((i) => inPeriod(i.date)).length;
  const financeEntries = store.financeEntries.filter((e) => inPeriod(e.date)).length;
  const ballPurchases = store.ballPurchases.filter((p) => inPeriod(p.date)).length;

  const deletedBookingIds = new Set(store.bookings.filter((b) => inPeriod(b.date)).map((b) => b.id));
  const deletedIncomeIds = new Set(
    (store.otherIncomes ?? []).filter((i) => inPeriod(i.date)).map((i) => i.id)
  );
  const ballUsage = store.ballUsage.filter(
    (u) =>
      inPeriod(u.date) ||
      (u.bookingId && deletedBookingIds.has(u.bookingId)) ||
      (u.otherIncomeId && deletedIncomeIds.has(u.otherIncomeId))
  ).length;

  const totalRecords =
    bookings +
    oldSessions +
    oldExpenses +
    oldIncomes +
    oldDiesel +
    dieselExpenses +
    otherExpenses +
    otherIncomes +
    financeEntries +
    ballPurchases +
    ballUsage;

  return {
    label: getDateRangeLabel(from, to),
    from,
    to,
    bookings,
    oldSessions,
    oldExpenses,
    oldIncomes,
    oldDiesel,
    dieselExpenses,
    otherExpenses,
    otherIncomes,
    financeEntries,
    ballPurchases,
    ballUsage,
    totalRecords,
  };
}

export function previewClearMonth(store: AppStore, year: number, month: number): ClearPeriodPreview {
  const { from, to } = getCalendarMonthRange(year, month);
  return previewClearPeriod(store, from, to);
}

/** Remove all records between from and to (inclusive) after PDF/Excel backup */
export function clearPeriodData(store: AppStore, from: string, to: string): AppStore {
  if (from > to) return store;

  const inPeriod = (date: string) => inRange(date, from, to);

  const deletedBookingIds = new Set(
    store.bookings.filter((b) => inPeriod(b.date)).map((b) => b.id)
  );
  const deletedIncomeIds = new Set(
    (store.otherIncomes ?? []).filter((i) => inPeriod(i.date)).map((i) => i.id)
  );

  return {
    ...store,
    bookings: store.bookings.filter((b) => !inPeriod(b.date)),
    matches: (store.matches ?? []).filter((m) => !inPeriod(m.date)),
    oldExpenses: (store.oldExpenses ?? []).filter((o) => !inPeriod(o.date)),
    oldIncomes: (store.oldIncomes ?? []).filter((i) => !inPeriod(i.date)),
    oldDieselExpenses: (store.oldDieselExpenses ?? []).filter((d) => !inPeriod(d.date)),
    dieselExpenses: store.dieselExpenses.filter((d) => !inPeriod(d.date)),
    otherExpenses: (store.otherExpenses ?? []).filter((o) => !inPeriod(o.date)),
    otherIncomes: (store.otherIncomes ?? []).filter((i) => !inPeriod(i.date)),
    financeEntries: store.financeEntries.filter((e) => !inPeriod(e.date)),
    ballPurchases: store.ballPurchases.filter((p) => !inPeriod(p.date)),
    ballUsage: store.ballUsage.filter(
      (u) =>
        !inPeriod(u.date) &&
        !(u.bookingId && deletedBookingIds.has(u.bookingId)) &&
        !(u.otherIncomeId && deletedIncomeIds.has(u.otherIncomeId))
    ),
    savedMonthlyReports: (store.savedMonthlyReports ?? []).filter(
      (r) => !(r.from === from && r.to === to)
    ),
  };
}

export function clearMonthData(store: AppStore, year: number, month: number): AppStore {
  const { from, to } = getCalendarMonthRange(year, month);
  const next = clearPeriodData(store, from, to);
  return {
    ...next,
    savedMonthlyReports: (store.savedMonthlyReports ?? []).filter(
      (r) =>
        !(r.from === from && r.to === to) &&
        !(r.year === year && r.month === month)
    ),
  };
}

export function reportRangeKey(from: string, to: string): string {
  return `${from}|${to}`;
}
