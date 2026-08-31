"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminHeader";
import { AdminQuickLinks } from "@/components/admin/AdminQuickLinks";
import { AdminSectionTitle } from "@/components/admin/AdminSectionTitle";
import { StatCard } from "@/components/admin/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { fetchAdminStore } from "@/lib/api-client";
import { getFinanceSummary } from "@/lib/finance";
import { getOwnerName } from "@/lib/owners";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AppStore } from "@/lib/types";
import {
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
      <AdminQuickLinks />

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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 mb-3">
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
          trend={finance.netProfit >= 0 ? "All time" : "All time — in loss"}
        />
        <StatCard
          label="Udhari pending"
          value={formatCurrency(udhari.totalUdhari)}
          icon={IndianRupee}
          color="#e31837"
          trend={
            udhari.countWithUdhari > 0
              ? `${udhari.countWithUdhari} unpaid · Today ${todayBookings} matches`
              : `All clear · Today ${todayBookings} matches`
          }
        />
      </div>
      <p className="text-sm text-slate-600 mb-8 admin-page-intro">
        This month: income {formatCurrency(finance.thisMonth.income.total)} · expenses{" "}
        {formatCurrency(finance.thisMonth.expense.total)} · net{" "}
        <span className={finance.thisMonth.netProfit >= 0 ? "text-green-700 font-semibold" : "text-red-600 font-semibold"}>
          {formatCurrency(finance.thisMonth.netProfit)}
        </span>
        {pending > 0 || approved > 0 ? ` · ${pending} pending, ${approved} approved bookings` : ""}
      </p>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Income breakdown */}
        <Card>
          <AdminSectionTitle
            action={
              <Link href="/admin/finance">
                <Button variant="ghost" size="sm">
                  Full P&L <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            }
          >
            Income breakdown
          </AdminSectionTitle>
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
        </Card>

        {/* Expense breakdown */}
        <Card>
          <AdminSectionTitle>Expenses breakdown</AdminSectionTitle>
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
          <AdminSectionTitle
            action={
              <Link href="/admin/udhari">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            }
          >
            Udhari — who owes
          </AdminSectionTitle>
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
          <AdminSectionTitle
            action={
              <Link href="/admin/owners">
                <Button variant="ghost" size="sm">Owners</Button>
              </Link>
            }
          >
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[var(--cricket-green)]" />
              Income by owner
            </span>
          </AdminSectionTitle>
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

      {/* Ball purchases by owner — summary only */}
      <Card className="mb-8">
        <AdminSectionTitle
          action={
            <Link href="/admin/inventory">
              <Button variant="ghost" size="sm">Ball stock</Button>
            </Link>
          }
        >
          <span className="flex items-center gap-2">
            <Package className="h-5 w-5 text-[#F7931E]" />
            Ball purchases by owner
          </span>
        </AdminSectionTitle>
        {ballPurchasesByOwner.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No ball purchases recorded yet</p>
        ) : (
          <div className="space-y-2">
            {ballPurchasesByOwner.map((group) => (
              <div
                key={group.ownerId || "__none__"}
                className="admin-list-row admin-subtle text-sm"
              >
                <div>
                  <p className="font-semibold text-[var(--navy)]">{group.ownerName}</p>
                  <p className="text-xs text-slate-500">
                    {group.purchases.length} purchase(s) · {group.totalBalls} balls
                  </p>
                </div>
                <p className="font-bold text-red-600 shrink-0">{formatCurrency(group.total)}</p>
              </div>
            ))}
            <div className="admin-list-row bg-red-50 border border-red-200 text-sm font-bold mt-2">
              <span className="text-red-900">All ball purchases</span>
              <span className="text-red-600">{formatCurrency(finance.ballPurchaseTotal)}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Recent bookings */}
      <Card>
        <AdminSectionTitle
          action={
            <Link href="/admin/bookings">
              <Button variant="ghost" size="sm">All bookings</Button>
            </Link>
          }
        >
          Recent bookings
        </AdminSectionTitle>
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
