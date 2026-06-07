"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { DashboardFinanceSummary } from "@/components/admin/DashboardFinanceSummary";
import { FinanceAllTimeStrip, FinancePeriodPanel } from "@/components/admin/FinancePeriodPanel";
import { Card } from "@/components/ui/Card";
import { fetchAdminStore } from "@/lib/api-client";
import { getFinanceSummary } from "@/lib/finance";
import { formatCurrency } from "@/lib/utils";
import type { AppStore } from "@/lib/types";
import { Loader2, Sun, Moon } from "lucide-react";

export default function AdminDetailedFinancePage() {
  const [store, setStore] = useState<AppStore | null>(null);
  const [finance, setFinance] = useState<ReturnType<typeof getFinanceSummary> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStore()
      .then(({ store: s, finance: f }) => {
        setStore(s);
        setFinance(f ?? getFinanceSummary(s));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !store || !finance) {
    return (
      <AdminShell title="Detailed Finance">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-red)]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Detailed Finance">
      <p className="text-sm text-slate-600 mb-6 max-w-2xl">
        Full income & expense breakdown — by month, day/night shift, owner, and category.
        For PDF/Excel download go to <strong>Profit &amp; Loss</strong>.
      </p>

      <DashboardFinanceSummary finance={finance} />

      <div className="space-y-6 mb-8 mt-8">
        <FinancePeriodPanel period={finance.lastMonth} highlight />
        <FinancePeriodPanel period={finance.thisMonth} />
      </div>

      <FinanceAllTimeStrip
        income={finance.totalIncome}
        expense={finance.totalExpense}
        net={finance.netProfit}
        walkIn={finance.allTimeWalkInIncome}
        online={finance.allTimeOnlineIncome}
        diesel={finance.dieselTotal}
        balls={finance.ballPurchaseTotal}
        other={finance.otherExpenseTotal}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="!p-4">
          <p className="text-xs text-slate-500">This month income</p>
          <p className="text-lg font-bold text-green-600 mt-1">
            {formatCurrency(finance.thisMonth.income.total)}
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-slate-500">This month expense</p>
          <p className="text-lg font-bold text-red-600 mt-1">
            {formatCurrency(finance.thisMonth.expense.total)}
          </p>
        </Card>
        <Card className="!p-4 border-l-4 border-l-amber-400">
          <div className="flex items-center gap-2 mb-1">
            <Sun className="h-4 w-4 text-amber-500" />
            <p className="text-xs text-slate-500">Day shift P/L (all time)</p>
          </div>
          <p
            className={`text-lg font-bold ${finance.dayNetProfit >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formatCurrency(finance.dayNetProfit)}
          </p>
        </Card>
        <Card className="!p-4 border-l-4 border-l-indigo-500">
          <div className="flex items-center gap-2 mb-1">
            <Moon className="h-4 w-4 text-indigo-500" />
            <p className="text-xs text-slate-500">Night shift P/L (all time)</p>
          </div>
          <p
            className={`text-lg font-bold ${finance.nightNetProfit >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formatCurrency(finance.nightNetProfit)}
          </p>
        </Card>
      </div>
    </AdminShell>
  );
}
