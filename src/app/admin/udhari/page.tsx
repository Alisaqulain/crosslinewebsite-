"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AmountInput, parseAmount } from "@/components/ui/AmountInput";
import { Label } from "@/components/ui/Input";
import { OwnerSelect } from "@/components/admin/OwnerSelect";
import { ResponsiveTable } from "@/components/admin/ResponsiveTable";
import { fetchAdminStore, patchAdmin, patchBooking } from "@/lib/api-client";
import { getOwnerName } from "@/lib/owners";
import { matchAmountReceived, normalizeMatch } from "@/lib/matches";
import { bookingAmountReceived, getStoreUdhariSummary, type UdhariAccount } from "@/lib/udhari";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AppStore, Booking, StadiumMatch, StadiumOwner } from "@/lib/types";
import { IndianRupee, Loader2, Save } from "lucide-react";

type PayTarget =
  | { kind: "booking"; data: Booking }
  | { kind: "old-session"; data: StadiumMatch };

export default function AdminUdhariPage() {
  const { toast } = useToast();
  const [store, setStore] = useState<AppStore | null>(null);
  const [owners, setOwners] = useState<StadiumOwner[]>([]);
  const [matches, setMatches] = useState<StadiumMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [payTarget, setPayTarget] = useState<PayTarget | null>(null);
  const [paymentOwnerId, setPaymentOwnerId] = useState("");
  const [amountInput, setAmountInput] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { store: s } = await fetchAdminStore();
      setStore(s);
      setOwners(s.owners ?? []);
      const cleaned = (s.matches ?? [])
        .map((m: unknown) => normalizeMatch(m as Record<string, unknown>))
        .filter((m: StadiumMatch | null): m is StadiumMatch => m !== null);
      setMatches(cleaned);
    } catch {
      toast("Failed to load", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = useMemo(
    () => (store ? getStoreUdhariSummary(store) : null),
    [store]
  );

  const openPayment = (account: UdhariAccount) => {
    if (account.kind === "booking" && account.booking) {
      setPayTarget({ kind: "booking", data: account.booking });
      setAmountInput(String(bookingAmountReceived(account.booking) || ""));
      setPaymentOwnerId(account.booking.receivedByOwnerId ?? "");
    } else if (account.kind === "old-session" && account.oldSession) {
      setPayTarget({ kind: "old-session", data: account.oldSession });
      setAmountInput(String(matchAmountReceived(account.oldSession) || ""));
      setPaymentOwnerId(account.oldSession.receivedByOwnerId ?? "");
    }
  };

  const paySessionPrice = payTarget?.data.slotPrice ?? 0;

  const payUdhari =
    payTarget && !Number.isNaN(parseAmount(amountInput))
      ? Math.max(0, paySessionPrice - parseAmount(amountInput))
      : 0;

  const payLabel =
    payTarget?.kind === "old-session"
      ? "Old session"
      : payTarget?.kind === "booking" && payTarget.data.walkIn
        ? "Walk-in"
        : "Website";

  const savePayment = async () => {
    if (!payTarget || !store) return;
    const received = parseAmount(amountInput);
    if (Number.isNaN(received) || received < 0) {
      toast("Enter a valid amount", "error");
      return;
    }
    if (received > paySessionPrice) {
      toast(`Cannot exceed ${formatCurrency(paySessionPrice)}`, "error");
      return;
    }
    if (received > 0 && !(paymentOwnerId || store.owners?.[0]?.id)) {
      toast("Select who received the money", "error");
      return;
    }

    const ownerId = paymentOwnerId || store.owners?.[0]?.id || null;
    setActionId(payTarget.data.id);

    try {
      if (payTarget.kind === "booking") {
        await patchBooking(payTarget.data.id, {
          recordPayment: true,
          amountReceived: received,
          receivedByOwnerId: ownerId,
        });
      } else {
        const updated = matches.map((m) =>
          m.id === payTarget.data.id
            ? { ...m, amountReceived: received, receivedByOwnerId: ownerId ?? undefined }
            : m
        );
        await patchAdmin("matches", updated);
      }

      const udhari = paySessionPrice - received;
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

  if (loading || !store || !summary) {
    return (
      <AdminShell title="Udhari (Credit)">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Udhari — Who Owes How Much">
      <p className="text-sm text-slate-600 mb-6 max-w-2xl">
        Only customers with pending balance (udhari) are listed here.
        Example: session ₹3,000, received ₹2,000 → ₹1,000 udhari.
        To add old sessions go to <strong>Old Sessions</strong>.
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
          <p className="text-xs text-slate-500">Cash received</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(summary.totalReceived)}
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-slate-500">Total billed</p>
          <p className="text-2xl font-bold text-[var(--navy)] mt-1">
            {formatCurrency(summary.totalBilled)}
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-slate-500">Sessions tracked</p>
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
          rowKey={(a) => a.id}
          emptyMessage="No pending udhari — all sessions are fully paid"
          columns={[
            {
              key: "customer",
              header: "Customer",
              render: (a) => (
                <div>
                  <p className="font-semibold text-[var(--navy)]">{a.customerName}</p>
                  {a.phone ? <p className="text-xs text-slate-500">{a.phone}</p> : null}
                </div>
              ),
            },
            {
              key: "date",
              header: "Date / Slot",
              render: (a) => (
                <span className="text-sm">
                  {formatDate(a.date)} · {a.slotLabel}
                </span>
              ),
            },
            {
              key: "source",
              header: "Type",
              render: (a) => (
                <span
                  className={
                    a.source === "old-session"
                      ? "text-xs font-semibold text-blue-700"
                      : a.source === "walk-in"
                        ? "text-xs font-semibold text-amber-700"
                        : "text-xs font-semibold text-slate-600"
                  }
                >
                  {a.source === "old-session"
                    ? "Old session"
                    : a.source === "walk-in"
                      ? "Walk-in"
                      : "Website"}
                </span>
              ),
            },
            {
              key: "total",
              header: "Session price",
              render: (a) => formatCurrency(a.sessionPrice),
            },
            {
              key: "received",
              header: "Received",
              render: (a) => (
                <span className="text-green-700 font-medium">{formatCurrency(a.received)}</span>
              ),
            },
            {
              key: "owner",
              header: "Received by",
              render: (a) => {
                const ownerId =
                  a.kind === "booking"
                    ? a.booking?.receivedByOwnerId
                    : a.oldSession?.receivedByOwnerId;
                return ownerId ? getOwnerName(store, ownerId) : "—";
              },
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
                <Button size="sm" variant="outline" onClick={() => openPayment(a)}>
                  Update payment
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
              {payTarget.data.customerName}
              <br />
              {formatDate(payTarget.data.date)} · {payTarget.data.slotLabel} · {payLabel}
            </p>
            <div className="rounded-xl admin-subtle p-3 text-sm space-y-1">
              <p>
                Session price: <strong>{formatCurrency(paySessionPrice)}</strong>
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
              <AmountInput
                value={amountInput}
                onChange={setAmountInput}
                placeholder={`Up to ${paySessionPrice}`}
                className="mt-1"
              />
            </div>
            <OwnerSelect
              owners={owners}
              value={paymentOwnerId}
              onChange={setPaymentOwnerId}
              label="Received by (owner)"
              required={parseAmount(amountInput) > 0}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setPayTarget(null)}>
                Cancel
              </Button>
              <Button onClick={savePayment} disabled={actionId === payTarget.data.id}>
                <Save className="h-4 w-4" /> Save
              </Button>
            </div>
          </Card>
        </div>
      )}
    </AdminShell>
  );
}
