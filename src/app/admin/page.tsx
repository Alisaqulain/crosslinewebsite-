"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { fetchAdminStore } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AppStore } from "@/lib/types";
import { Calendar, Users, Package, IndianRupee, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AdminDashboardPage() {
  const [store, setStore] = useState<AppStore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStore()
      .then(({ store: s }) => setStore(s))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !store) {
    return (
      <AdminShell title="Dashboard">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      </AdminShell>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const pending = store.bookings.filter((b) => b.status === "pending").length;
  const approved = store.bookings.filter((b) => b.status === "approved").length;
  const todayBookings = store.bookings.filter((b) => b.date === today).length;
  const revenue = store.bookings.reduce((s, b) => s + (b.paymentStatus !== "pending" ? b.advancePaid : 0), 0);
  const ballStock = store.ballPurchases.reduce((s, p) => s + p.quantity, 0) - store.ballUsage.reduce((s, u) => s + u.quantity, 0);
  const recent = [...store.bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard label="Pending Bookings" value={pending} icon={Calendar} color="#ED1C24" trend="Needs review" />
        <StatCard label="Approved" value={approved} icon={Users} color="#F7931E" />
        <StatCard label="Today's Bookings" value={todayBookings} icon={Calendar} color="#FBB03B" />
        <StatCard label="Advance Collected" value={formatCurrency(revenue)} icon={IndianRupee} color="#39B54A" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Bookings</h2>
            <Link href="/admin/bookings">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recent.length === 0 ? (
              <p className="text-sm text-slate-500">No bookings yet</p>
            ) : (
              recent.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-[#0b1219]">
                  <div>
                    <p className="text-sm font-medium text-white">{b.customerName}</p>
                    <p className="text-xs text-slate-500">{formatDate(b.date)} · {b.slotLabel}</p>
                  </div>
                  <div className="text-right">
                    <Badge status={b.status} />
                    <p className="text-xs text-slate-400 mt-1">{formatCurrency(b.advancePaid)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-[#39B54A]" />
            Ball Stock: {ballStock} units
          </h2>
          <div className="grid gap-2">
            {[
              { href: "/admin/bookings", label: "Approve pending bookings" },
              { href: "/admin/slots", label: "Manage slots & pricing" },
              { href: "/admin/scoring", label: "Update live score" },
              { href: "/admin/stream", label: "Set live stream URL" },
              { href: "/admin/content", label: "Update website content" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="block p-3 rounded-xl bg-[#0b1219] text-sm text-slate-300 hover:bg-white/5 hover:text-[#FBB03B] transition-colors"
              >
                → {action.label}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
