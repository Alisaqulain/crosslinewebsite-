"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { fetchAdminStore } from "@/lib/api-client";
import { getFinanceSummary } from "@/lib/finance";
import { getOwnerName } from "@/lib/owners";
import { getQualityLabel } from "@/lib/qualities";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AppStore } from "@/lib/types";
import {
  Calendar,
  IndianRupee,
  Loader2,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [store, setStore] = useState<AppStore | null>(null);
  const [finance, setFinance] = useState<ReturnType<typeof getFinanceSummary> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStore()
      .then(({ store: s }) => {
        setStore(s);
        setFinance(getFinanceSummary(s));
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
  const todayBookings = store.bookings.filter((b) => b.date === today && b.status === "approved").length;
  const recent = [...store.bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const udhari = finance.udhari;
  const ownerStats = finance.ownerStats.filter((o) => o.incomeTotal > 0 || o.expenseTotal > 0);
  const ballPurchasesByOwner = [...store.ballPurchases]
    .sort((a, b) => b.date.localeCompare(a.date))
    .reduce<
      {
        ownerId: string;
        ownerName: string;
        purchases: typeof store.ballPurchases;
        total: number;
        totalBalls: number;
      }[]
    >((groups, purchase) => {
      const ownerId = purchase.ownerId ?? "";
      let group = groups.find((g) => g.ownerId === ownerId);
      if (!group) {
        group = {
          ownerId,
          ownerName: ownerId ? getOwnerName(store, ownerId) : "Not assigned",
          purchases: [],
          total: 0,
          totalBalls: 0,
        };
        groups.push(group);
      }
      group.purchases.push(purchase);
      group.total += purchase.purchasePrice;
      group.totalBalls += purchase.quantity;
      return groups;
    }, [])
    .sort((a, b) => b.total - a.total);
  const manualIncomeAll = store.financeEntries
    .filter((e) => e.type === "income")
    .reduce((s, e) => s + e.amount, 0);

  return (
    <AdminShell title="Dashboard">
      {pending > 0 && (
        <Card className="mb-6 !p-4 border-amber-300/60 bg-amber-50/80 flex flex-wrap items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          <p className="flex-1 text-sm text-amber-900">
            {pending} booking(s) waiting for approval
          </p>
          <Link href="/admin/bookings">
            <Button size="sm">Review bookings</Button>
          </Link>
        </Card>
      )}

      {/* Overall money */}
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Overall</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard
          label="Total income"
          value={formatCurrency(finance.totalIncome)}
          icon={TrendingUp}
          color="#1f8a3c"
        />
        <StatCard
          label="Total expenses"
          value={formatCurrency(finance.totalExpense)}
          icon={TrendingDown}
          color="#e31837"
        />
        <StatCard
          label="Net profit"
          value={formatCurrency(finance.netProfit)}
          icon={IndianRupee}
          color={finance.netProfit >= 0 ? "#1f8a3c" : "#e31837"}
          trend={finance.netProfit >= 0 ? "In profit" : "In loss"}
        />
        <StatCard
          label="Total udhari pending"
          value={formatCurrency(udhari.totalUdhari)}
          icon={IndianRupee}
          color="#e31837"
          trend={udhari.countWithUdhari > 0 ? `${udhari.countWithUdhari} unpaid` : "All clear"}
        />
      </div>

      {/* This month + bookings */}
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">This month</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard
          label="Month income"
          value={formatCurrency(finance.thisMonth.income.total)}
          icon={TrendingUp}
          color="#1f8a3c"
        />
        <StatCard
          label="Month expenses"
          value={formatCurrency(finance.thisMonth.expense.total)}
          icon={TrendingDown}
          color="#e31837"
        />
        <StatCard
          label="Month net"
          value={formatCurrency(finance.thisMonth.netProfit)}
          icon={IndianRupee}
          color={finance.thisMonth.netProfit >= 0 ? "#1e3d73" : "#e31837"}
        />
        <StatCard
          label="Today's matches"
          value={todayBookings}
          icon={Calendar}
          color="#1e3d73"
          trend={`${pending} pending · ${approved} approved`}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Income breakdown */}
        <Card>
          <h2 className="font-semibold text-[var(--navy)] font-[family-name:var(--font-sora)] mb-4">
            Income breakdown (all time)
          </h2>
          <div className="space-y-2">
            {[
              { label: "Online bookings (received)", amount: finance.allTimeOnlineIncome },
              { label: "Walk-in bookings (received)", amount: finance.allTimeWalkInIncome },
              { label: "Old sessions (received)", amount: finance.oldSessionIncomeTotal },
              { label: "Other income", amount: finance.otherIncomeTotal },
              { label: "Manual income entries", amount: manualIncomeAll },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between p-3 rounded-xl admin-subtle text-sm"
              >
                <span className="text-slate-600">{row.label}</span>
                <span className="font-semibold text-green-700">{formatCurrency(row.amount)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-200 text-sm font-bold">
              <span className="text-green-900">Cash received total</span>
              <span className="text-green-700">{formatCurrency(finance.totalIncome)}</span>
            </div>
          </div>
          <Link href="/admin/finance" className="inline-block mt-4">
            <Button variant="ghost" size="sm">
              Full P&L <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </Card>

        {/* Expense breakdown */}
        <Card>
          <h2 className="font-semibold text-[var(--navy)] font-[family-name:var(--font-sora)] mb-4">
            Expenses breakdown (all time)
          </h2>
          <div className="space-y-2">
            {[
              { label: "Diesel", amount: finance.dieselTotal },
              { label: "Ball purchases", amount: finance.ballPurchaseTotal },
              { label: "Other expenses", amount: finance.otherExpenseTotal },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between p-3 rounded-xl admin-subtle text-sm"
              >
                <span className="text-slate-600">{row.label}</span>
                <span className="font-semibold text-red-600">{formatCurrency(row.amount)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200 text-sm font-bold">
              <span className="text-red-900">Total expenses</span>
              <span className="text-red-600">{formatCurrency(finance.totalExpense)}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5" />
            Ball stock left: <strong>{finance.totalBallsRemaining}</strong> balls
          </p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Udhari — who owes how much */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--navy)] font-[family-name:var(--font-sora)]">
              Udhari — who owes how much
            </h2>
            <Link href="/admin/udhari">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          {udhari.accounts.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No pending udhari — all paid</p>
          ) : (
            <div className="space-y-2">
              {udhari.accounts.slice(0, 8).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3 rounded-xl admin-subtle"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--navy)] truncate">{a.customerName}</p>
                    <p className="text-xs text-slate-500">
                      {formatDate(a.date)} · {a.slotLabel}
                      {a.source === "walk-in"
                        ? " · Walk-in"
                        : a.source === "old-session"
                          ? " · Old session"
                          : " · Online"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Received {formatCurrency(a.received)} of {formatCurrency(a.sessionPrice)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-red-600 shrink-0 ml-3">
                    {formatCurrency(a.udhari)}
                  </p>
                </div>
              ))}
              {udhari.accounts.length > 8 && (
                <p className="text-xs text-center text-slate-500 pt-1">
                  +{udhari.accounts.length - 8} more
                </p>
              )}
              <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200 mt-2">
                <span className="text-sm font-semibold text-red-900">Total udhari</span>
                <span className="text-sm font-bold text-red-600">{formatCurrency(udhari.totalUdhari)}</span>
              </div>
            </div>
          )}
        </Card>

        {/* Owner income */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--navy)] font-[family-name:var(--font-sora)] flex items-center gap-2">
              <Users className="h-5 w-5 text-[var(--cricket-green)]" />
              Income by owner
            </h2>
            <Link href="/admin/owners">
              <Button variant="ghost" size="sm">Owners</Button>
            </Link>
          </div>
          {ownerStats.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No owner income recorded yet</p>
          ) : (
            <div className="space-y-2">
              {ownerStats.map((o) => (
                <div key={o.ownerId} className="p-3 rounded-xl admin-subtle">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-[var(--navy)]">{o.name}</p>
                    <p className="text-sm font-bold text-green-700">{formatCurrency(o.incomeTotal)}</p>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-500">
                    <span>Bookings {formatCurrency(o.bookingIncome)}</span>
                    <span>Old {formatCurrency(o.oldSessionIncome)}</span>
                    <span>Other {formatCurrency(o.otherIncome)}</span>
                    {o.expenseTotal > 0 && (
                      <span className="text-red-500">Exp {formatCurrency(o.expenseTotal)}</span>
                    )}
                  </div>
                  {o.ballPurchaseExpense > 0 && (
                    <p className="text-[10px] text-red-600 mt-1">
                      Ball purchases {formatCurrency(o.ballPurchaseExpense)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Ball purchases by owner */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--navy)] font-[family-name:var(--font-sora)] flex items-center gap-2">
            <Package className="h-5 w-5 text-[#F7931E]" />
            Ball purchases by owner
          </h2>
          <Link href="/admin/inventory">
            <Button variant="ghost" size="sm">Ball Stock</Button>
          </Link>
        </div>
        {ballPurchasesByOwner.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No ball purchases recorded yet</p>
        ) : (
          <div className="space-y-4">
            {ballPurchasesByOwner.map((group) => (
              <div key={group.ownerId || "__none__"} className="rounded-xl admin-subtle overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-white/60 border-b border-[var(--border)]">
                  <div>
                    <p className="text-sm font-semibold text-[var(--navy)]">{group.ownerName}</p>
                    <p className="text-[10px] text-slate-500">
                      {group.purchases.length} purchase(s) · {group.totalBalls} balls
                    </p>
                  </div>
                  <p className="text-sm font-bold text-red-600">{formatCurrency(group.total)}</p>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {group.purchases.map((p) => {
                    const pricePerBall =
                      p.quantity > 0 ? Math.round(p.purchasePrice / p.quantity) : 0;
                    return (
                      <div key={p.id} className="flex items-start justify-between gap-3 p-3 text-sm">
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--navy)]">
                            {getQualityLabel(store, p.quality)} × {p.quantity}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formatDate(p.date)}
                            {p.supplier ? ` · ${p.supplier}` : ""}
                            {p.notes ? ` · ${p.notes}` : ""}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-red-600">{formatCurrency(p.purchasePrice)}</p>
                          {pricePerBall > 0 && (
                            <p className="text-[10px] text-slate-500">₹{pricePerBall}/ball</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200 text-sm font-bold">
              <span className="text-red-900">All ball purchases</span>
              <span className="text-red-600">{formatCurrency(finance.ballPurchaseTotal)}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Recent bookings */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--navy)] font-[family-name:var(--font-sora)]">
            Recent bookings
          </h2>
          <Link href="/admin/bookings">
            <Button variant="ghost" size="sm">All bookings</Button>
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No bookings yet</p>
        ) : (
          <div className="space-y-2">
            {recent.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-3 rounded-xl admin-subtle"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--navy)]">{b.customerName}</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(b.date)} · {b.slotLabel}
                    {b.walkIn ? " · Walk-in" : " · Online"}
                  </p>
                </div>
                <div className="text-right">
                  <Badge status={b.status} theme="light" />
                  <p className="text-xs font-semibold text-[var(--brand-red)] mt-1">
                    {formatCurrency(b.slotPrice)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </AdminShell>
  );
}
