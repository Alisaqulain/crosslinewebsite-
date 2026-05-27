"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { fetchAdminStore } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AppStore } from "@/lib/types";
import { Calendar, Users, Package, IndianRupee, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [store, setStore] = useState<AppStore | null>(null);
  const [finance, setFinance] = useState<{
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    totalBallsRemaining: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStore()
      .then(({ store: s, finance: f }) => {
        setStore(s);
        setFinance(f);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !store) {
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

  const quickLinks = [
    { href: "/admin/bookings", label: "Approve pending bookings", color: "#e31837" },
    { href: "/admin/slots", label: "Manage slots & pricing", color: "#1f8a3c" },
    { href: "/admin/matches", label: "Add upcoming matches", color: "#1e3d73" },
    { href: "/admin/finance", label: "View income & expenses", color: "#e31837" },
    { href: "/admin/content", label: "Update website content", color: "#1f8a3c" },
  ];

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard label="Pending Bookings" value={pending} icon={Calendar} color="#e31837" trend={pending > 0 ? "Needs review" : undefined} />
        <StatCard label="Approved" value={approved} icon={Users} color="#1f8a3c" />
        <StatCard label="Today's Bookings" value={todayBookings} icon={Calendar} color="#1e3d73" />
        <StatCard label="Net Profit" value={formatCurrency(finance?.netProfit ?? 0)} icon={IndianRupee} color="#1f8a3c" />
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
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge status={b.status} theme="light" />
                    <p className="text-xs font-semibold text-[var(--brand-red)] mt-1">{formatCurrency(b.slotPrice)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-[var(--navy)] font-[family-name:var(--font-sora)] mb-5 flex items-center gap-2">
            <Package className="h-5 w-5 text-[var(--cricket-green)]" />
            Ball Stock: {finance?.totalBallsRemaining ?? 0} remaining
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
