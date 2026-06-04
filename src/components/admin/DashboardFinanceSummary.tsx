"use client";

import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import type { getFinanceSummary } from "@/lib/finance";
import { Sun, Moon, TrendingDown, TrendingUp, IndianRupee, Fuel, Package, Receipt } from "lucide-react";

export function DashboardFinanceSummary({
  finance,
}: {
  finance: ReturnType<typeof getFinanceSummary>;
}) {
  const u = finance.udhari;

  return (
    <Card className="!p-5 mb-8 border-2 border-[var(--brand-red)]/15 bg-gradient-to-br from-white to-slate-50">
      <h2 className="font-semibold text-[var(--navy)] mb-4 flex items-center gap-2 text-lg">
        <IndianRupee className="h-6 w-6 text-[#F7931E]" />
        Stadium money summary (all time)
      </h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4">
        <div className="p-4 rounded-xl bg-green-50 border border-green-200">
          <p className="text-xs text-green-800 font-semibold uppercase tracking-wide flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            Cash income (received)
          </p>
          <p className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(finance.totalIncome)}</p>
          <p className="text-[10px] text-green-700/80 mt-1">Bookings ₹{finance.bookingCashIncome.toLocaleString("en-IN")} + other</p>
        </div>
        <div className="p-4 rounded-xl bg-red-50 border border-red-200">
          <p className="text-xs text-red-800 font-semibold uppercase tracking-wide flex items-center gap-1">
            <TrendingDown className="h-3.5 w-3.5" />
            Total expenses
          </p>
          <p className="text-2xl font-bold text-red-700 mt-1">{formatCurrency(finance.totalExpense)}</p>
        </div>
        <div
          className={`p-4 rounded-xl border ${
            finance.netProfit >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-300"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--navy)]">Net profit</p>
          <p
            className={`text-2xl font-bold mt-1 ${
              finance.netProfit >= 0 ? "text-green-700" : "text-red-700"
            }`}
          >
            {formatCurrency(finance.netProfit)}
          </p>
          <p className="text-[10px] text-slate-600 mt-1">Income received − all expenses</p>
        </div>
        <div className="p-4 rounded-xl admin-subtle border border-[var(--border)]">
          <p className="text-xs text-slate-600 font-semibold uppercase">Session billing</p>
          <p className="text-sm mt-2">
            <span className="text-slate-500">Total billed </span>
            <strong className="text-[var(--navy)]">{formatCurrency(u.totalBilled)}</strong>
          </p>
          <p className="text-sm">
            <span className="text-slate-500">Received </span>
            <strong className="text-green-700">{formatCurrency(u.totalReceived)}</strong>
          </p>
          <p className="text-sm">
            <span className="text-slate-500">Udhari </span>
            <strong className="text-red-600">{formatCurrency(u.totalUdhari)}</strong>
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4">
        <div className="p-3 rounded-xl admin-subtle flex items-center gap-3">
          <Sun className="h-5 w-5 text-amber-500 shrink-0" />
          <div>
            <p className="text-xs text-slate-500">Day income (cash)</p>
            <p className="font-bold text-green-600">{formatCurrency(finance.dayIncome)}</p>
          </div>
        </div>
        <div className="p-3 rounded-xl admin-subtle flex items-center gap-3">
          <Moon className="h-5 w-5 text-indigo-500 shrink-0" />
          <div>
            <p className="text-xs text-slate-500">Night income (cash)</p>
            <p className="font-bold text-green-600">{formatCurrency(finance.nightIncome)}</p>
          </div>
        </div>
        <div className="p-3 rounded-xl admin-subtle flex items-center gap-3">
          <Sun className="h-5 w-5 text-amber-500 shrink-0" />
          <div>
            <p className="text-xs text-slate-500">Day expenses</p>
            <p className="font-bold text-red-600">{formatCurrency(finance.dayExpense)}</p>
          </div>
        </div>
        <div className="p-3 rounded-xl admin-subtle flex items-center gap-3">
          <Moon className="h-5 w-5 text-indigo-500 shrink-0" />
          <div>
            <p className="text-xs text-slate-500">Night expenses</p>
            <p className="font-bold text-red-600">{formatCurrency(finance.nightExpense)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="p-3 rounded-xl border border-orange-200 bg-orange-50/50 flex items-center gap-2">
          <Package className="h-4 w-4 text-orange-600" />
          <div>
            <p className="text-xs text-slate-600">Ball purchase expense</p>
            <p className="font-bold text-red-700">{formatCurrency(finance.ballPurchaseTotal)}</p>
          </div>
        </div>
        <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center gap-2">
          <Fuel className="h-4 w-4 text-amber-700" />
          <div>
            <p className="text-xs text-slate-600">Diesel expense</p>
            <p className="font-bold text-red-700">{formatCurrency(finance.dieselTotal)}</p>
          </div>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2">
          <Receipt className="h-4 w-4 text-slate-600" />
          <div>
            <p className="text-xs text-slate-600">Other ground expenses</p>
            <p className="font-bold text-red-700">{formatCurrency(finance.otherExpenseTotal)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
