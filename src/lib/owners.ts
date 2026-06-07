import type { AppStore, StadiumOwner } from "./types";
import { bookingAmountReceived } from "./udhari";
import { matchAmountReceived } from "./matches";

export function resolveOwners(store: AppStore): StadiumOwner[] {
  return (store.owners ?? []).filter((o) => o.id && o.name);
}

export function getOwnerName(store: AppStore, ownerId?: string): string {
  if (!ownerId) return "—";
  return resolveOwners(store).find((o) => o.id === ownerId)?.name ?? ownerId;
}

export interface OwnerFinanceStat {
  ownerId: string;
  name: string;
  incomeTotal: number;
  expenseTotal: number;
  bookingIncome: number;
  oldSessionIncome: number;
  otherIncome: number;
  dieselExpense: number;
  otherExpense: number;
  incomeCount: number;
  expenseCount: number;
  net: number;
}

export function getOwnerFinanceStats(store: AppStore): OwnerFinanceStat[] {
  return resolveOwners(store).map((owner) => {
    const bookingRows = store.bookings.filter(
      (b) => b.status === "approved" && b.receivedByOwnerId === owner.id
    );
    const bookingIncome = bookingRows.reduce((s, b) => s + bookingAmountReceived(b), 0);

    const oldSessionRows = (store.matches ?? []).filter(
      (m) => m.status === "completed" && m.receivedByOwnerId === owner.id
    );
    const oldSessionIncome = oldSessionRows.reduce((s, m) => s + matchAmountReceived(m), 0);

    const otherIncomeRows = (store.otherIncomes ?? []).filter((i) => i.ownerId === owner.id);
    const otherIncome = otherIncomeRows.reduce((s, i) => s + i.amount, 0);

    const dieselRows = store.dieselExpenses.filter((d) => d.ownerId === owner.id);
    const dieselExpense = dieselRows.reduce((s, d) => s + d.totalCost, 0);

    const otherExpenseRows = (store.otherExpenses ?? []).filter((o) => o.ownerId === owner.id);
    const otherExpense = otherExpenseRows.reduce((s, o) => s + o.amount, 0);

    const incomeTotal = bookingIncome + oldSessionIncome + otherIncome;
    const expenseTotal = dieselExpense + otherExpense;

    return {
      ownerId: owner.id,
      name: owner.name,
      incomeTotal,
      expenseTotal,
      bookingIncome,
      oldSessionIncome,
      otherIncome,
      dieselExpense,
      otherExpense,
      incomeCount:
        bookingRows.filter((b) => bookingAmountReceived(b) > 0).length +
        oldSessionRows.filter((m) => matchAmountReceived(m) > 0).length +
        otherIncomeRows.length,
      expenseCount: dieselRows.length + otherExpenseRows.length,
      net: incomeTotal - expenseTotal,
    };
  });
}
