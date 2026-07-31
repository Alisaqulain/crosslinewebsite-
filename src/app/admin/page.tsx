"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { fetchAdminStore } from "@/lib/api-client";
import { getFinanceSummary } from "@/lib/finance";
import { bookingUdhari, getStoreUdhariSummary } from "@/lib/udhari";
import { getEndedSessionsNeedingPayment } from "@/lib/sessions";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AppStore } from "@/lib/types";
import {
  AlertTriangle,
  Calendar,
  Users,
  Package,
  IndianRupee,
  Loader2,
  ArrowRight,
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
        setFinance(f ?? getFinanceSummary(s));
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

  const udhari = getStoreUdhariSummary(store);
  const endedNeedingPayment = getEndedSessionsNeedingPayment(store);
  const todayEnded = endedNeedingPayment.filter((s) => s.date === today);

  const quickLinks = [
    { href: "/admin/bookings", label: "Approve pending bookings" },
    { href: "/admin/udhari", label: "Udhari — who owes how much" },
    { href: "/admin/detailed-finance", label: "Detailed finance breakdown" },
    { href: "/admin/finance", label: "Profit & loss + PDF/Excel" },
    { href: "/admin/inventory", label: "Ball stock & purchases" },
    { href: "/admin/diesel", label: "Diesel expenses" },
  ];

  return (
    <AdminShell title="Dashboard">
      {endedNeedingPayment.length > 0 && (
        <Card className="mb-6 !p-5 border-2 border-amber-400/60 bg-amber-50/80">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-amber-900 font-[family-name:var(--font-sora)]">
                Match ended — clear amount
              </h2>
              <p className="text-sm text-amber-800/90 mt-1">
                {todayEnded.length > 0
                  ? `${todayEnded.length} session(s) ended today. Collect pending payment below.`
                  : `${endedNeedingPayment.length} past session(s) still have pending payment.`}
              </p>
              <div className="mt-4 space-y-2">
                {endedNeedingPayment.slice(0, 8).map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-white/80 border border-amber-200/80"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[var(--navy)]">{s.customerName}</p>
                      <p className="text-xs text-slate-500">
                        {formatDate(s.date)} · {s.slotLabel}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">
                        Total {formatCurrency(s.slotPrice)} · Received {formatCurrency(s.received)}
                      </p>
                      <p className="text-sm font-bold text-amber-800">
                        Clear {formatCurrency(s.udhari)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/admin/bookings" className="inline-block mt-4">
                <Button size="sm">Record payment in Bookings</Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="!p-4 border-l-4 border-l-green-500">
          <p className="text-xs text-slate-500">Cash income (all time)</p>
          <p className="text-lg font-bold text-green-600 mt-1">{formatCurrency(finance.totalIncome)}</p>
        </Card>
        <Card className="!p-4 border-l-4 border-l-red-500">
          <p className="text-xs text-slate-500">Total expenses</p>
          <p className="text-lg font-bold text-red-600 mt-1">{formatCurrency(finance.totalExpense)}</p>
        </Card>
        <Card className="!p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs text-slate-500">Net profit</p>
          <p className={`text-lg font-bold mt-1 ${finance.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(finance.netProfit)}
          </p>
        </Card>
        <Card className="!p-4 border-l-4 border-l-amber-500">
          <p className="text-xs text-slate-500">This month net</p>
          <p
            className={`text-lg font-bold mt-1 ${finance.thisMonth.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formatCurrency(finance.thisMonth.netProfit)}
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
