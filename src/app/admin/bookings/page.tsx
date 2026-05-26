"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { fetchBookings, patchBooking } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/lib/types";
import { Check, X, Loader2, IndianRupee } from "lucide-react";

export default function AdminBookingsPage() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { bookings: data } = await fetchBookings({
        status: filter === "all" ? undefined : filter,
        date: dateFilter || undefined,
      });
      setBookings(data);
    } catch {
      toast("Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  }, [filter, dateFilter, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: string, status: BookingStatus) => {
    setActionId(id);
    try {
      await patchBooking(id, { status });
      toast(`Booking ${status}. Email sent to customer.`, "success");
      load();
    } catch {
      toast("Update failed", "error");
    } finally {
      setActionId(null);
    }
  };

  const markPayment = async (id: string) => {
    setActionId(id);
    try {
      await patchBooking(id, { paymentStatus: "received" });
      toast("Payment marked as received", "success");
      load();
    } catch {
      toast("Update failed", "error");
    } finally {
      setActionId(null);
    }
  };

  return (
    <AdminShell title="Booking Management">
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                filter === f ? "bg-[#F7931E]/20 text-[#FBB03B]" : "bg-white/5 text-slate-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div>
          <Label className="text-xs">Filter by date</Label>
          <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="mt-1 w-44" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-white/10 text-left text-slate-400">
                <th className="p-4 font-medium">ID</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Date / Slot</th>
                <th className="p-4 font-medium">Team / Players</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">No bookings found</td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4 text-slate-300">{b.id}</td>
                    <td className="p-4">
                      <p className="text-white font-medium">{b.customerName}</p>
                      <p className="text-xs text-slate-500">{b.email}</p>
                      <p className="text-xs text-slate-500">{b.phone}</p>
                      <p className="text-xs text-slate-600 mt-1 max-w-[180px] truncate" title={b.address}>{b.address}</p>
                    </td>
                    <td className="p-4 text-slate-300">
                      {formatDate(b.date)}
                      <br />
                      <span className="text-xs text-slate-500">{b.slotLabel}</span>
                    </td>
                    <td className="p-4 text-slate-400 text-xs">
                      <span className="text-white font-medium">{b.teamName || b.playersOrTeam}</span>
                      <br />
                      {b.numberOfPlayers ? `${b.numberOfPlayers} players` : ""} · {b.matchType}
                    </td>
                    <td className="p-4">
                      <p className="text-white">{formatCurrency(b.totalAmount)}</p>
                      <p className="text-xs text-[#FBB03B]">Adv: {formatCurrency(b.advancePaid)}</p>
                      <p className="text-xs text-slate-500 capitalize">{b.paymentStatus}</p>
                    </td>
                    <td className="p-4">
                      <Badge status={b.status} />
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {b.status === "pending" && (
                          <>
                            <Button size="sm" variant="secondary" disabled={actionId === b.id} onClick={() => updateStatus(b.id, "approved")}>
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="danger" disabled={actionId === b.id} onClick={() => updateStatus(b.id, "rejected")}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        {b.paymentStatus !== "received" && (
                          <Button size="sm" variant="outline" disabled={actionId === b.id} onClick={() => markPayment(b.id)}>
                            <IndianRupee className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
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
