import type { DieselExpense } from "./types";

/** Rupee amount — supports legacy liters × rate entries */
export function dieselAmount(d: DieselExpense): number {
  if (typeof d.amount === "number" && d.amount > 0) return d.amount;
  if (typeof d.totalCost === "number" && d.totalCost > 0) return d.totalCost;
  if (d.liters && d.pricePerLiter) return d.liters * d.pricePerLiter;
  return d.amount ?? 0;
}
