"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { ResponsiveTable } from "@/components/admin/ResponsiveTable";
import { fetchBookings, patchBooking } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/lib/types";
import { Check, X, Loader2 } from "lucide-react";

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
    } catch (err) {
      toast(err instanceof Error ? err.message : "Update failed", "error");
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
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize min-h-[44px] ${
                filter === f ? "bg-[#F7931E]/20 text-[#FBB03B]" : "bg-white/5 text-slate-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div>
          <Label className="text-xs">Filter by date</Label>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="mt-1 w-44"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      ) : (
        <Card className="p-0 md:p-6">
          <ResponsiveTable
            data={bookings}
            rowKey={(b) => b.id}
            emptyMessage="No bookings found"
            columns={[
              {
                key: "id",
                header: "ID",
                render: (b) => <span className="text-slate-300">{b.id}</span>,
              },
              {
                key: "customer",
                header: "Customer",
                render: (b) => (
                  <div>
                    <p className="text-white font-medium">{b.customerName}</p>
                    <p className="text-xs text-slate-500">{b.email}</p>
                    <p className="text-xs text-slate-500">{b.phone}</p>
                  </div>
                ),
              },
              {
                key: "date",
                header: "Date / Slot",
                render: (b) => (
                  <span>
                    {formatDate(b.date)}
                    <br />
                    <span className="text-xs text-slate-500">{b.slotLabel}</span>
                  </span>
                ),
              },
              {
                key: "team",
                header: "Team",
                render: (b) => (
                  <span>
                    {b.teamName} · {b.numberOfPlayers} players
                    <br />
                    <span className="text-xs capitalize">{b.matchType}</span>
                  </span>
                ),
              },
              {
                key: "amount",
                header: "Price",
                render: (b) => formatCurrency(b.slotPrice),
              },
              {
                key: "status",
                header: "Status",
                render: (b) => <Badge status={b.status} />,
              },
              {
                key: "actions",
                header: "Actions",
                render: (b) =>
                  b.status === "pending" ? (
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={actionId === b.id}
                        onClick={() => updateStatus(b.id, "approved")}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={actionId === b.id}
                        onClick={() => updateStatus(b.id, "rejected")}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-slate-500 text-xs">—</span>
                  ),
              },
            ]}
          />
        </Card>
      )}
    </AdminShell>
  );
}
