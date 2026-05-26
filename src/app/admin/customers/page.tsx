"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { fetchBookings } from "@/lib/api-client";
import type { Booking } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function AdminCustomersPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings()
      .then(({ bookings: b }) => setBookings(b))
      .finally(() => setLoading(false));
  }, []);

  const customers = useMemo(() => {
    const map = new Map<string, { name: string; email: string; phone: string; count: number; last: string }>();
    for (const b of bookings) {
      const key = b.email.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        if (b.createdAt > existing.last) existing.last = b.createdAt;
      } else {
        map.set(key, { name: b.customerName, email: b.email, phone: b.phone, count: 1, last: b.createdAt });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [bookings]);

  return (
    <AdminShell title="Customers">
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-slate-400">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Phone</th>
                <th className="p-4 font-medium">Bookings</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">No customers yet</td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.email} className="border-b border-white/5">
                    <td className="p-4 text-white font-medium">{c.name}</td>
                    <td className="p-4 text-slate-300">{c.email}</td>
                    <td className="p-4 text-slate-300">{c.phone}</td>
                    <td className="p-4 text-[#FBB03B] font-semibold">{c.count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      )}
    </AdminShell>
  );
}
