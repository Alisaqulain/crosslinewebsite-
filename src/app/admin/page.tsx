"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { DashboardFinanceSummary } from "@/components/admin/DashboardFinanceSummary";
import { FinanceAllTimeStrip, FinancePeriodPanel } from "@/components/admin/FinancePeriodPanel";
import { StatCard } from "@/components/admin/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { fetchAdminStore } from "@/lib/api-client";
import { getFinanceSummary } from "@/lib/finance";
import { bookingUdhari, getUdhariSummary } from "@/lib/udhari";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AppStore } from "@/lib/types";
import {
  Calendar,
  Users,
  Package,
  IndianRupee,
  Loader2,
  ArrowRight,
  Sun,
  Moon,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [store, setStore] = useState<AppStore | null>(null);
  const [finance, setFinance] = useState<ReturnType<typeof getFinanceSummary> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStore()
      .then(({ store: s, finance: f }) => {
        setStore(s);
        setFinance(f);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !store || !finance) {
    return (
      <AdminShell title="Dashboard">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-red)]" />
        </div>
      </AdminShell>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const pending = store.bookings.filter((b) => b.status === "pending").length;
  const approved = store.bookings.filter((b) => b.status === "approved").length;
  const todayBookings = store.bookings.filter((b) => b.date === today).length;
  const recent = [...store.bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const udhari = getUdhariSummary(store.bookings);

  const quickLinks = [
    { href: "/admin/bookings", label: "Approve pending bookings" },
    { href: "/admin/udhari", label: "Udhari — who owes how much" },
    { href: "/admin/inventory", label: "Ball stock & purchases" },
    { href: "/admin/diesel", label: "Diesel expenses" },
    { href: "/admin/finance", label: "Full profit & loss" },
  ];

  return (
    <AdminShell title="Dashboard">
      <DashboardFinanceSummary finance={finance} />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <p className="text-sm text-[var(--text-muted)] flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Income & expense analysis by month
        </p>
        <Link href="/admin/finance">
          <Button variant="outline" size="sm">
            Detailed finance
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatCard label="Pending Bookings" value={pending} icon={Calendar} color="#e31837" trend={pending > 0 ? "Needs review" : undefined} />
        <StatCard label="Approved Bookings" value={approved} icon={Users} color="#1f8a3c" />
        <StatCard label="Today's Matches" value={todayBookings} icon={Calendar} color="#1e3d73" />
        <StatCard
          label="Total Udhari Pending"
          value={formatCurrency(udhari.totalUdhari)}
          icon={IndianRupee}
          color="#e31837"
          trend={udhari.countWithUdhari > 0 ? `${udhari.countWithUdhari} unpaid` : "All clear"}
        />
      </div>

      <div className="space-y-6 mb-8">
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
          <p className="text-lg font-bold text-green-600 mt-1">{formatCurrency(finance.thisMonth.income.total)}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-slate-500">This month expense</p>
          <p className="text-lg font-bold text-red-600 mt-1">{formatCurrency(finance.thisMonth.expense.total)}</p>
        </Card>
        <Card className="!p-4 border-l-4 border-l-amber-400">
          <div className="flex items-center gap-2 mb-1">
            <Sun className="h-4 w-4 text-amber-500" />
            <p className="text-xs text-slate-500">Day shift P/L (all time)</p>
          </div>
          <p className={`text-lg font-bold ${finance.dayNetProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(finance.dayNetProfit)}
          </p>
        </Card>
        <Card className="!p-4 border-l-4 border-l-indigo-500">
          <div className="flex items-center gap-2 mb-1">
            <Moon className="h-4 w-4 text-indigo-500" />
            <p className="text-xs text-slate-500">Night shift P/L (all time)</p>
          </div>
          <p className={`text-lg font-bold ${finance.nightNetProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(finance.nightNetProfit)}
          </p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[var(--navy)] font-[family-name:var(--font-sora)]">Recent Bookings</h2>
            <Link href="/admin/bookings">
              <Button variant="ghost" size="sm" className="btn-ghost-admin text-[var(--text-muted)]">
                View all
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {recent.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] py-4 text-center">No bookings yet</p>
            ) : (
              recent.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-3.5 rounded-xl admin-subtle hover:shadow-sm transition-shadow"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--navy)]">{b.customerName}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {formatDate(b.date)} · {b.slotLabel}
                      {b.walkIn ? " · Walk-in" : " · Online"}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge status={b.status} theme="light" />
                    <p className="text-xs font-semibold text-[var(--brand-red)] mt-1">{formatCurrency(b.slotPrice)}</p>
                    {b.status === "approved" && bookingUdhari(b) > 0 && (
                      <p className="text-[10px] text-amber-700 font-semibold">
                        Udhari {formatCurrency(bookingUdhari(b))}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-[var(--navy)] font-[family-name:var(--font-sora)] mb-5 flex items-center gap-2">
            <Package className="h-5 w-5 text-[var(--cricket-green)]" />
            Ball stock: {finance.totalBallsRemaining} left
          </h2>
          <div className="grid gap-2">
            {quickLinks.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center justify-between p-3.5 rounded-xl admin-subtle hover:border-[var(--cricket-green)]/30 hover:shadow-sm transition-all"
              >
                <span className="text-sm font-medium text-[var(--navy)] group-hover:text-[var(--brand-red)] transition-colors">
                  {action.label}
                </span>
                <ArrowRight className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--brand-red)] group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
