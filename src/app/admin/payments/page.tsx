"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Card } from "@/components/ui/Card";
import { fetchAdminStore } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import type { AppStore } from "@/lib/types";
import { Calendar, CheckCircle, Clock, IndianRupee, Package, Loader2 } from "lucide-react";

export default function AdminReportsPage() {
  const [store, setStore] = useState<AppStore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStore()
      .then(({ store: s }) => setStore(s))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !store) {
    return (
      <AdminShell title="Reports">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      </AdminShell>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const total = store.bookings.length;
  const approved = store.bookings.filter((b) => b.status === "approved").length;
  const pending = store.bookings.filter((b) => b.status === "pending").length;
  const todayCount = store.bookings.filter((b) => b.date === today).length;
  const revenue = store.bookings.reduce((s, b) => s + b.advancePaid, 0);
  const received = store.bookings.filter((b) => b.paymentStatus === "received" || b.paymentStatus === "paid").reduce((s, b) => s + b.advancePaid, 0);
  const ballStock =
    store.ballPurchases.reduce((s, p) => s + p.quantity, 0) - store.ballUsage.reduce((s, u) => s + u.quantity, 0);

  return (
    <AdminShell title="Reports & Analytics">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-8">
        <StatCard label="Total Bookings" value={total} icon={Calendar} color="#F7931E" />
        <StatCard label="Approved" value={approved} icon={CheckCircle} color="#39B54A" />
        <StatCard label="Pending" value={pending} icon={Clock} color="#ED1C24" />
        <StatCard label="Today's Bookings" value={todayCount} icon={Calendar} color="#FBB03B" />
        <StatCard label="Advance Revenue" value={formatCurrency(revenue)} icon={IndianRupee} color="#8CC63F" />
        <StatCard label="Payments Received" value={formatCurrency(received)} icon={IndianRupee} color="#39B54A" />
        <StatCard label="Ball Stock Remaining" value={ballStock} icon={Package} color="#F7931E" trend="units" />
      </div>

      <Card>
        <h2 className="font-semibold text-white mb-4">Revenue by Booking</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-white/10">
                <th className="pb-3 font-medium">ID</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Advance</th>
                <th className="pb-3 font-medium">Payment</th>
              </tr>
            </thead>
            <tbody>
              {store.bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">No bookings yet</td>
                </tr>
              ) : (
                store.bookings.map((b) => (
                  <tr key={b.id} className="border-b border-white/5">
                    <td className="py-3 text-slate-300">{b.id}</td>
                    <td className="py-3 text-white">{b.customerName}</td>
                    <td className="py-3 capitalize text-slate-400">{b.status}</td>
                    <td className="py-3 text-[#FBB03B]">{formatCurrency(b.advancePaid)}</td>
                    <td className="py-3 capitalize text-slate-500">{b.paymentStatus}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminShell>
  );
}
