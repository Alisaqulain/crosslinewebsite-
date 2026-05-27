import type { AppStore, BallQuality, FinanceEntry } from "./types";
import { BALL_QUALITY_LABELS } from "./types";

export interface BallStockSummary {
  quality: BallQuality;
  label: string;
  remaining: number;
  purchased: number;
  used: number;
}

export function getBallStock(store: AppStore): BallStockSummary[] {
  const qualities: BallQuality[] = ["low", "medium", "high"];

  return qualities.map((quality) => {
    const purchased = store.ballPurchases
      .filter((p) => p.quality === quality)
      .reduce((s, p) => s + p.quantity, 0);
    const used = store.ballUsage
      .filter((u) => u.quality === quality)
      .reduce((s, u) => s + u.quantity, 0);
    return {
      quality,
      label: BALL_QUALITY_LABELS[quality],
      remaining: purchased - used,
      purchased,
      used,
    };
  });
}

export function getFinanceSummary(store: AppStore) {
  const today = new Date().toISOString().split("T")[0];
  const month = today.slice(0, 7);

  const bookingIncome = store.bookings
    .filter((b) => b.status === "approved")
    .reduce((s, b) => s + b.slotPrice, 0);

  const dieselTotal = store.dieselExpenses.reduce((s, d) => s + d.totalCost, 0);
  const ballPurchaseTotal = store.ballPurchases.reduce((s, p) => s + p.purchasePrice, 0);

  const manualIncome = store.financeEntries
    .filter((e) => e.type === "income")
    .reduce((s, e) => s + e.amount, 0);
  const manualExpense = store.financeEntries
    .filter((e) => e.type === "expense")
    .reduce((s, e) => s + e.amount, 0);

  const totalIncome = bookingIncome + manualIncome;
  const totalExpense = dieselTotal + ballPurchaseTotal + manualExpense;

  const sumBy = (entries: FinanceEntry[], pred: (e: FinanceEntry) => boolean) =>
    entries.filter(pred).reduce((s, e) => s + e.amount, 0);

  const dayIncome = sumBy(
    store.financeEntries,
    (e) => e.type === "income" && e.shift === "day"
  );
  const nightIncome = sumBy(
    store.financeEntries,
    (e) => e.type === "income" && e.shift === "night"
  );
  const dayExpense = sumBy(
    store.financeEntries,
    (e) => e.type === "expense" && e.shift === "day"
  );
  const nightExpense = sumBy(
    store.financeEntries,
    (e) => e.type === "expense" && e.shift === "night"
  );

  const todayIncome = store.financeEntries
    .filter((e) => e.date === today && e.type === "income")
    .reduce((s, e) => s + e.amount, 0);
  const todayExpense = store.financeEntries
    .filter((e) => e.date === today && e.type === "expense")
    .reduce((s, e) => s + e.amount, 0);

  const monthlyIncome = store.financeEntries
    .filter((e) => e.date.startsWith(month) && e.type === "income")
    .reduce((s, e) => s + e.amount, 0);
  const monthlyExpense = store.financeEntries
    .filter((e) => e.date.startsWith(month) && e.type === "expense")
    .reduce((s, e) => s + e.amount, 0);

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
    ...store.bookings
      .filter((b) => b.status === "approved")
      .map((b) => ({
        id: b.id,
        date: b.date,
        type: "income" as const,
        category: "booking" as const,
        amount: b.slotPrice,
        note: `${b.teamName} — ${b.slotLabel}`,
        shift: "day" as const,
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
    dieselTotal,
    ballPurchaseTotal,
    bookingIncome,
    monthlyIncome,
    monthlyExpense,
    recentTransactions,
    ballStock: getBallStock(store),
    totalBallsRemaining: getBallStock(store).reduce((s, b) => s + b.remaining, 0),
  };
}
