"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { OwnerSelect } from "@/components/admin/OwnerSelect";
import { ResponsiveTable } from "@/components/admin/ResponsiveTable";
import { fetchAdminStore, patchBooking } from "@/lib/api-client";
import { getOwnerName } from "@/lib/owners";
import { bookingAmountReceived, bookingUdhari, getUdhariSummary } from "@/lib/udhari";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AppStore, Booking, StadiumOwner } from "@/lib/types";
import { IndianRupee, Loader2, Save } from "lucide-react";

export default function AdminUdhariPage() {
  const { toast } = useToast();
  const [store, setStore] = useState<AppStore | null>(null);
  const [owners, setOwners] = useState<StadiumOwner[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [payTarget, setPayTarget] = useState<Booking | null>(null);
  const [paymentOwnerId, setPaymentOwnerId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { store: s } = await fetchAdminStore();
      setStore(s);
      setOwners(s.owners ?? []);
      setBookings(s.bookings);
    } catch {
      toast("Failed to load", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = getUdhariSummary(bookings);

  const [amountInput, setAmountInput] = useState("");

  const openPayment = (b: Booking) => {
    setPayTarget(b);
    setAmountInput(String(bookingAmountReceived(b) || ""));
    setPaymentOwnerId(b.receivedByOwnerId ?? "");
  };

  const savePayment = async () => {
    if (!payTarget) return;
    const received = Number(amountInput);
    if (Number.isNaN(received) || received < 0) {
      toast("Enter a valid amount", "error");
      return;
    }
    if (received > payTarget.slotPrice) {
      toast(`Cannot exceed ${formatCurrency(payTarget.slotPrice)}`, "error");
      return;
    }
    if (received > 0 && !paymentOwnerId) {
      toast("Select who received the money", "error");
      return;
    }
    setActionId(payTarget.id);
    try {
      await patchBooking(payTarget.id, {
        recordPayment: true,
        amountReceived: received,
        receivedByOwnerId: paymentOwnerId || null,
      });
      const udhari = payTarget.slotPrice - received;
      toast(
        udhari > 0
          ? `Saved — ${formatCurrency(udhari)} udhari remaining`
          : "Full payment recorded",
        "success"
      );
      setPayTarget(null);
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <AdminShell title="Udhari (Credit)">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      </AdminShell>
    );
  }

  const payUdhari =
    payTarget && !Number.isNaN(Number(amountInput))
      ? Math.max(0, payTarget.slotPrice - Number(amountInput))
      : 0;

  return (
    <AdminShell title="Udhari — Who Owes How Much">
      <p className="text-sm text-slate-600 mb-6 max-w-2xl">
        Track money received vs session price for approved bookings (website and walk-in).
        Example: ₹5,000 session, ₹4,000 received → ₹1,000 udhari.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="!p-4 border-l-4 border-l-red-500">
          <p className="text-xs text-slate-500">Total udhari pending</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {formatCurrency(summary.totalUdhari)}
          </p>
          <p className="text-xs text-slate-500 mt-1">{summary.countWithUdhari} customers</p>
        </Card>
        <Card className="!p-4 border-l-4 border-l-green-500">
          <p className="text-xs text-slate-500">Cash received (approved)</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(summary.totalReceived)}
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-slate-500">Total billed (approved)</p>
          <p className="text-2xl font-bold text-[var(--navy)] mt-1">
            {formatCurrency(summary.totalBilled)}
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-slate-500">Approved bookings</p>
          <p className="text-2xl font-bold text-[var(--navy)] mt-1">{summary.approvedCount}</p>
        </Card>
      </div>

      <Card className="p-0 md:p-6">
        <h2 className="font-semibold text-[var(--navy)] mb-4 px-4 pt-4 md:px-0 md:pt-0 flex items-center gap-2">
          <IndianRupee className="h-5 w-5 text-amber-600" />
          Outstanding udhari
        </h2>
        <ResponsiveTable
          data={summary.accounts}
          rowKey={(a) => a.booking.id}
          emptyMessage="No pending udhari — all approved bookings are fully paid"
          columns={[
            {
              key: "customer",
              header: "Customer",
              render: (a) => (
                <div>
                  <p className="font-semibold text-[var(--navy)]">{a.booking.customerName}</p>
                  <p className="text-xs text-slate-500">{a.booking.phone}</p>
                </div>
              ),
            },
            {
              key: "match",
              header: "Match / Date",
              render: (a) => (
                <span className="text-sm">
                  {a.booking.teamName}
                  <br />
                  <span className="text-xs text-slate-500">
                    {formatDate(a.booking.date)} · {a.booking.slotLabel}
                  </span>
                </span>
              ),
            },
            {
              key: "source",
              header: "Type",
              render: (a) => (
                <span
                  className={
                    a.source === "walk-in"
                      ? "text-xs font-semibold text-amber-700"
                      : "text-xs font-semibold text-slate-600"
                  }
                >
                  {a.source === "walk-in" ? "Walk-in" : "Website"}
                </span>
              ),
            },
            {
              key: "total",
              header: "Session price",
              render: (a) => formatCurrency(a.booking.slotPrice),
            },
            {
              key: "received",
              header: "Received",
              render: (a) => (
                <span className="text-green-700 font-medium">{formatCurrency(a.received)}</span>
              ),
            },
            {
              key: "udhari",
              header: "Udhari",
              render: (a) => (
                <span className="text-red-600 font-bold">{formatCurrency(a.udhari)}</span>
              ),
            },
            {
              key: "actions",
              header: "",
              render: (a) => (
                <Button size="sm" variant="outline" onClick={() => openPayment(a.booking)}>
                  Update payment
                </Button>
              ),
            },
          ]}
        />
      </Card>

      <Card className="mt-8 p-0 md:p-6">
        <h2 className="font-semibold text-[var(--navy)] mb-4 px-4 pt-4 md:px-0 md:pt-0">
          All approved bookings — payment status
        </h2>
        <ResponsiveTable
          data={bookings.filter((b) => b.status === "approved")}
          rowKey={(b) => b.id}
          emptyMessage="No approved bookings"
          columns={[
            {
              key: "customer",
              header: "Customer",
              render: (b) => b.customerName,
            },
            {
              key: "date",
              header: "Date",
              render: (b) => formatDate(b.date),
            },
            {
              key: "type",
              header: "Type",
              render: (b) => (b.walkIn ? "Walk-in" : "Website"),
            },
            {
              key: "price",
              header: "Price",
              render: (b) => formatCurrency(b.slotPrice),
            },
            {
              key: "received",
              header: "Received",
              render: (b) => formatCurrency(bookingAmountReceived(b)),
            },
            {
              key: "owner",
              header: "Received by",
              render: (b) =>
                b.receivedByOwnerId && store
                  ? getOwnerName(store, b.receivedByOwnerId)
                  : "—",
            },
            {
              key: "udhari",
              header: "Udhari",
              render: (b) => {
                const u = bookingUdhari(b);
                return u > 0 ? (
                  <span className="text-red-600 font-semibold">{formatCurrency(u)}</span>
                ) : (
                  <span className="text-green-600 text-xs">Paid</span>
                );
              },
            },
            {
              key: "actions",
              header: "",
              render: (b) => (
                <Button size="sm" variant="ghost" className="text-xs" onClick={() => openPayment(b)}>
                  Amount received
                </Button>
              ),
            },
          ]}
        />
      </Card>

      {payTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-md space-y-4 shadow-xl">
            <h3 className="font-semibold text-[var(--navy)]">Record amount received</h3>
            <p className="text-sm text-slate-600">
              {payTarget.customerName} · {payTarget.teamName}
              <br />
              {formatDate(payTarget.date)} · {payTarget.slotLabel}
              {payTarget.walkIn ? " · Walk-in" : " · Website"}
            </p>
            <div className="rounded-xl admin-subtle p-3 text-sm space-y-1">
              <p>
                Session price: <strong>{formatCurrency(payTarget.slotPrice)}</strong>
              </p>
              <p>
                Udhari after save:{" "}
                <strong className={payUdhari > 0 ? "text-red-600" : "text-green-600"}>
                  {formatCurrency(payUdhari)}
                </strong>
              </p>
            </div>
            <div>
              <Label>Amount received (₹)</Label>
              <Input
                type="number"
                min={0}
                max={payTarget.slotPrice}
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder={`0 – ${payTarget.slotPrice}`}
                className="mt-1"
              />
            </div>
            <OwnerSelect
              owners={owners}
              value={paymentOwnerId}
              onChange={setPaymentOwnerId}
              label="Received by (owner)"
              required={Number(amountInput) > 0}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setPayTarget(null)}>
                Cancel
              </Button>
              <Button onClick={savePayment} disabled={actionId === payTarget.id}>
                <Save className="h-4 w-4" /> Save
              </Button>
            </div>
          </Card>
        </div>
      )}
    </AdminShell>
  );
}
