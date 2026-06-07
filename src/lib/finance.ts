import type { AppStore, BallQuality, Booking, FinanceEntry, ShiftCategory } from "./types";
import { getQualityLabel, resolveBallQualities } from "./qualities";
import { getOwnerFinanceStats } from "./owners";
import { completedMatches, matchAmountReceived } from "./matches";
import { bookingAmountReceived, getStoreUdhariSummary } from "./udhari";

function bookingShift(store: AppStore, slotId: string): ShiftCategory {
  const slot = store.slots.find((s) => s.id === slotId);
  if (!slot) return "day";
  const hour = parseInt(slot.start.split(":")[0] ?? "12", 10);
  return hour >= 18 || slot.id === "night" ? "night" : "day";
}

export interface BallStockSummary {
  quality: BallQuality;
  label: string;
  remaining: number;
  purchased: number;
  used: number;
}

export function getBallStock(store: AppStore): BallStockSummary[] {
  const knownIds = new Set(resolveBallQualities(store).map((q) => q.id));
  for (const p of store.ballPurchases) knownIds.add(p.quality);
  for (const u of store.ballUsage) knownIds.add(u.quality);

  return [...knownIds].map((quality) => {
    const purchased = store.ballPurchases
      .filter((p) => p.quality === quality)
      .reduce((s, p) => s + p.quantity, 0);
    const used = store.ballUsage
      .filter((u) => u.quality === quality)
      .reduce((s, u) => s + u.quantity, 0);
    return {
      quality,
      label: getQualityLabel(store, quality),
      remaining: purchased - used,
      purchased,
      used,
    };
  });
}

export interface PeriodFinance {
  label: string;
  monthKey: string;
  income: {
    total: number;
    onlineBooking: number;
    walkInBooking: number;
    oldSessions: number;
    otherIncome: number;
    manual: number;
  };
  expense: {
    total: number;
    diesel: number;
    ballPurchase: number;
    other: number;
    manual: number;
  };
  netProfit: number;
  approvedBookings: number;
  walkInBookings: number;
  onlineBookings: number;
}

function monthKeyOffset(offsetMonths: number): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(12, 0, 0, 0);
  d.setMonth(d.getMonth() + offsetMonths);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en-IN", { month: "long", year: "numeric" });
}

function inMonth(dateStr: string, monthKey: string): boolean {
  return dateStr.startsWith(monthKey);
}

/** Cash actually received from approved bookings (not full slot price / udhari) */
function bookingCashReceived(bookings: Booking[]) {
  return bookings.reduce((s, b) => s + bookingAmountReceived(b), 0);
}

function filterApproved(store: AppStore, monthKey?: string) {
  let list = store.bookings.filter((b) => b.status === "approved");
  if (monthKey) list = list.filter((b) => inMonth(b.date, monthKey));
  return list;
}

function computePeriodFinance(store: AppStore, monthKey: string, label: string): PeriodFinance {
  const approved = filterApproved(store, monthKey);
  const walkInBooking = approved
    .filter((b) => b.walkIn)
    .reduce((s, b) => s + bookingAmountReceived(b), 0);
  const onlineBooking = approved
    .filter((b) => !b.walkIn)
    .reduce((s, b) => s + bookingAmountReceived(b), 0);
  const manualIncome = store.financeEntries
    .filter((e) => e.type === "income" && inMonth(e.date, monthKey))
    .reduce((s, e) => s + e.amount, 0);
  const diesel = store.dieselExpenses
    .filter((d) => inMonth(d.date, monthKey))
    .reduce((s, d) => s + d.totalCost, 0);
  const ballPurchase = store.ballPurchases
    .filter((p) => inMonth(p.date, monthKey))
    .reduce((s, p) => s + p.purchasePrice, 0);
  const other = (store.otherExpenses ?? [])
    .filter((o) => inMonth(o.date, monthKey))
    .reduce((s, o) => s + o.amount, 0);
  const otherIncome = (store.otherIncomes ?? [])
    .filter((i) => inMonth(i.date, monthKey))
    .reduce((s, i) => s + i.amount, 0);
  const oldSessions = completedMatches(store)
    .filter((m) => inMonth(m.date, monthKey))
    .reduce((s, m) => s + matchAmountReceived(m), 0);
  const manualExpense = store.financeEntries
    .filter((e) => e.type === "expense" && inMonth(e.date, monthKey))
    .reduce((s, e) => s + e.amount, 0);

  const incomeTotal = onlineBooking + walkInBooking + oldSessions + otherIncome + manualIncome;
  const expenseTotal = diesel + ballPurchase + other + manualExpense;

  return {
    label,
    monthKey,
    income: {
      total: incomeTotal,
      onlineBooking,
      walkInBooking,
      oldSessions,
      otherIncome,
      manual: manualIncome,
    },
    expense: {
      total: expenseTotal,
      diesel,
      ballPurchase,
      other,
      manual: manualExpense,
    },
    netProfit: incomeTotal - expenseTotal,
    approvedBookings: approved.length,
    walkInBookings: approved.filter((b) => b.walkIn).length,
    onlineBookings: approved.filter((b) => !b.walkIn).length,
  };
}

export function getFinanceSummary(store: AppStore) {
  const today = new Date().toISOString().split("T")[0];
  const month = monthKeyOffset(0);
  const lastMonth = monthKeyOffset(-1);

  const approvedAll = filterApproved(store);
  const bookingCashIncome = bookingCashReceived(approvedAll);
  const bookingBilledTotal = approvedAll.reduce((s, b) => s + b.slotPrice, 0);

  const dieselTotal = store.dieselExpenses.reduce((s, d) => s + d.totalCost, 0);
  const ballPurchaseTotal = store.ballPurchases.reduce((s, p) => s + p.purchasePrice, 0);
  const otherExpenseTotal = (store.otherExpenses ?? []).reduce((s, o) => s + o.amount, 0);
  const otherIncomeTotal = (store.otherIncomes ?? []).reduce((s, i) => s + i.amount, 0);
  const oldSessionIncomeTotal = completedMatches(store).reduce(
    (s, m) => s + matchAmountReceived(m),
    0
  );

  const manualIncome = store.financeEntries
    .filter((e) => e.type === "income")
    .reduce((s, e) => s + e.amount, 0);
  const manualExpense = store.financeEntries
    .filter((e) => e.type === "expense")
    .reduce((s, e) => s + e.amount, 0);

  const totalIncome = bookingCashIncome + oldSessionIncomeTotal + otherIncomeTotal + manualIncome;
  const totalExpense = dieselTotal + ballPurchaseTotal + otherExpenseTotal + manualExpense;

  const sumBy = (entries: FinanceEntry[], pred: (e: FinanceEntry) => boolean) =>
    entries.filter(pred).reduce((s, e) => s + e.amount, 0);

  const bookingDayIncome = approvedAll
    .filter((b) => bookingShift(store, b.slotId) === "day")
    .reduce((s, b) => s + bookingAmountReceived(b), 0);
  const bookingNightIncome = approvedAll
    .filter((b) => bookingShift(store, b.slotId) === "night")
    .reduce((s, b) => s + bookingAmountReceived(b), 0);

  const dayOtherIncome = (store.otherIncomes ?? [])
    .filter((i) => i.shift === "day")
    .reduce((s, i) => s + i.amount, 0);
  const nightOtherIncome = (store.otherIncomes ?? [])
    .filter((i) => i.shift === "night")
    .reduce((s, i) => s + i.amount, 0);

  const oldSessionDayIncome = completedMatches(store)
    .filter((m) => bookingShift(store, m.slotId) === "day")
    .reduce((s, m) => s + matchAmountReceived(m), 0);
  const oldSessionNightIncome = completedMatches(store)
    .filter((m) => bookingShift(store, m.slotId) === "night")
    .reduce((s, m) => s + matchAmountReceived(m), 0);

  const dayIncome =
    sumBy(store.financeEntries, (e) => e.type === "income" && e.shift === "day") +
    bookingDayIncome +
    dayOtherIncome +
    oldSessionDayIncome;
  const nightIncome =
    sumBy(store.financeEntries, (e) => e.type === "income" && e.shift === "night") +
    bookingNightIncome +
    nightOtherIncome +
    oldSessionNightIncome;

  const dayDiesel = store.dieselExpenses
    .filter((d) => d.shift === "day")
    .reduce((s, d) => s + d.totalCost, 0);
  const nightDiesel = store.dieselExpenses
    .filter((d) => d.shift === "night")
    .reduce((s, d) => s + d.totalCost, 0);

  const dayOther = (store.otherExpenses ?? [])
    .filter((o) => o.shift === "day")
    .reduce((s, o) => s + o.amount, 0);
  const nightOther = (store.otherExpenses ?? [])
    .filter((o) => o.shift === "night")
    .reduce((s, o) => s + o.amount, 0);

  const dayExpense =
    sumBy(store.financeEntries, (e) => e.type === "expense" && e.shift === "day") +
    dayDiesel +
    dayOther;
  const nightExpense =
    sumBy(store.financeEntries, (e) => e.type === "expense" && e.shift === "night") +
    nightDiesel +
    nightOther;

  const dayNetProfit = dayIncome - dayExpense;
  const nightNetProfit = nightIncome - nightExpense;

  const todayIncome = store.financeEntries
    .filter((e) => e.date === today && e.type === "income")
    .reduce((s, e) => s + e.amount, 0);
  const todayExpense = store.financeEntries
    .filter((e) => e.date === today && e.type === "expense")
    .reduce((s, e) => s + e.amount, 0);

  const thisMonth = computePeriodFinance(store, month, monthLabel(month));
  const lastMonthPeriod = computePeriodFinance(store, lastMonth, monthLabel(lastMonth));

  const allTimeWalkInIncome = approvedAll
    .filter((b) => b.walkIn)
    .reduce((s, b) => s + bookingAmountReceived(b), 0);
  const allTimeOnlineIncome = approvedAll
    .filter((b) => !b.walkIn)
    .reduce((s, b) => s + bookingAmountReceived(b), 0);

  const monthlyIncome = thisMonth.income.total;
  const monthlyExpense = thisMonth.expense.total;

  const udhari = getStoreUdhariSummary(store);

  const recentTransactions = [
    ...store.financeEntries.map((e) => ({
      id: e.id,
      date: e.date,
      type: e.type,
      category: e.category,
      amount: e.amount,
      note: e.note,
      shift: e.shift,
    })),
    ...store.dieselExpenses.map((d) => ({
      id: d.id,
      date: d.date,
      type: "expense" as const,
      category: "diesel" as const,
      amount: d.totalCost,
      note: d.purpose,
      shift: d.shift,
    })),
    ...(store.otherIncomes ?? []).map((i) => ({
      id: i.id,
      date: i.date,
      type: "income" as const,
      category: i.category,
      amount: i.amount,
      note: i.title,
      shift: i.shift,
    })),
    ...(store.otherExpenses ?? []).map((o) => ({
      id: o.id,
      date: o.date,
      type: "expense" as const,
      category: o.category,
      amount: o.amount,
      note: o.title,
      shift: o.shift,
    })),
    ...completedMatches(store).map((m) => ({
      id: m.id,
      date: m.date,
      type: "income" as const,
      category: "booking" as const,
      amount: matchAmountReceived(m),
      note: `${m.customerName} — ${m.slotLabel} (old session)`,
      shift: bookingShift(store, m.slotId),
    })),
    ...store.bookings
      .filter((b) => b.status === "approved")
      .map((b) => ({
        id: b.id,
        date: b.date,
        type: "income" as const,
        category: "booking" as const,
        amount: bookingAmountReceived(b),
        note: `${b.customerName} — ${b.slotLabel} (received)`,
        shift: bookingShift(store, b.slotId),
      })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  return {
    totalIncome,
    totalExpense,
    netProfit: totalIncome - totalExpense,
    todayIncome,
    todayExpense,
    dayIncome,
    dayExpense,
    nightIncome,
    nightExpense,
    dayNetProfit,
    nightNetProfit,
    bookingDayIncome,
    bookingNightIncome,
    dieselTotal,
    ballPurchaseTotal,
    otherExpenseTotal,
    otherIncomeTotal,
    oldSessionIncomeTotal,
    ownerStats: getOwnerFinanceStats(store),
    bookingCashIncome,
    bookingBilledTotal,
    allTimeWalkInIncome,
    allTimeOnlineIncome,
    thisMonth,
    lastMonth: lastMonthPeriod,
    monthlyIncome,
    monthlyExpense,
    recentTransactions,
    ballStock: getBallStock(store),
    totalBallsRemaining: getBallStock(store).reduce((s, b) => s + b.remaining, 0),
    udhari,
  };
}
