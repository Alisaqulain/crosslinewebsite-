"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { EntryActions } from "@/components/admin/EntryActions";
import { OwnerSelect } from "@/components/admin/OwnerSelect";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AmountInput, parseAmount } from "@/components/ui/AmountInput";
import { Input, Label, Select } from "@/components/ui/Input";
import { ResponsiveTable } from "@/components/admin/ResponsiveTable";
import { fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { getOwnerName } from "@/lib/owners";
import { matchAmountReceived, matchUdhari, normalizeMatch } from "@/lib/matches";
import { isSessionActiveOnDate } from "@/lib/slots";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AppStore, MatchType, StadiumMatch } from "@/lib/types";
import { Loader2, Plus, Save } from "lucide-react";

const matchTypes: { value: MatchType; label: string }[] = [
  { value: "practice", label: "Practice" },
  { value: "friendly", label: "Friendly" },
  { value: "tournament", label: "Tournament" },
  { value: "corporate", label: "Corporate" },
  { value: "academy", label: "Academy" },
];

type SessionForm = {
  customerName: string;
  phone: string;
  date: string;
  slotId: string;
  slotLabel: string;
  slotPrice: number;
  amountReceived: string | number;
  udhariAmount: string | number;
  receivedByOwnerId: string;
  matchType: MatchType;
  notes: string;
};

function emptyForm(slots: AppStore["slots"]): SessionForm {
  const slot = slots.find((s) => s.available) ?? slots[0];
  return {
    customerName: "",
    phone: "",
    date: new Date().toISOString().split("T")[0],
    slotId: slot?.id ?? "",
    slotLabel: slot?.label ?? "",
    slotPrice: slot?.price ?? 0,
    amountReceived: "",
    udhariAmount: "0",
    receivedByOwnerId: "",
    matchType: "friendly",
    notes: "",
  };
}

function toForm(m: StadiumMatch): SessionForm {
  return {
    customerName: m.customerName,
    phone: m.phone ?? "",
    date: m.date,
    slotId: m.slotId,
    slotLabel: m.slotLabel,
    slotPrice: m.slotPrice,
    amountReceived: m.amountReceived ?? "",
    udhariAmount: typeof m.udhariAmount === "number" ? m.udhariAmount : "0",
    receivedByOwnerId: m.receivedByOwnerId ?? "",
    matchType: m.matchType,
    notes: m.notes ?? "",
  };
}

export default function AdminMatchesPage() {
  const { toast } = useToast();
  const [store, setStore] = useState<AppStore | null>(null);
  const [matches, setMatches] = useState<StadiumMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SessionForm>(() => emptyForm([]));

  useEffect(() => {
    fetchAdminStore().then(async ({ store: s }) => {
      setStore(s);
      const cleaned = (s.matches ?? [])
        .map((m: unknown) => normalizeMatch(m as Record<string, unknown>))
        .filter((m: StadiumMatch | null): m is StadiumMatch => m !== null)
        .sort((a: StadiumMatch, b: StadiumMatch) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setMatches(cleaned);
      setForm(emptyForm(s.slots));
      if ((s.matches ?? []).length !== cleaned.length) {
        try {
          await patchAdmin("matches", cleaned);
        } catch {
          /* ignore — user can save manually */
        }
      }
      setLoading(false);
    });
  }, []);

  const slots = store?.slots ?? [];

  const slotsForDate = (date: string) =>
    slots.filter((s) => s.available && isSessionActiveOnDate(s, date));

  const pickSlot = (slotId: string) => {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot) return;
    setForm((f) => ({ ...f, slotId, slotLabel: slot.label, slotPrice: slot.price }));
  };

  const persist = async (data: StadiumMatch[]) => {
    setSaving(true);
    try {
      const { store: updated } = await patchAdmin("matches", data);
      const cleaned = (updated.matches ?? [])
        .map((m: unknown) => normalizeMatch(m as Record<string, unknown>))
        .filter((m: StadiumMatch | null): m is StadiumMatch => m !== null);
      setStore(updated);
      setMatches(cleaned);
      toast("Saved", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm(slots));
    setShowForm(true);
  };

  const startEdit = (m: StadiumMatch) => {
    setEditingId(m.id);
    setForm(toForm(m));
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm(slots));
  };

  const submitEntry = () => {
    if (!form.customerName.trim()) {
      toast("Customer name is required", "error");
      return;
    }
    if (!form.date || !form.slotId) {
      toast("Date and session are required", "error");
      return;
    }
    const received =
      form.amountReceived === "" || form.amountReceived === undefined
        ? undefined
        : parseAmount(form.amountReceived);
    const udhari =
      form.udhariAmount === "" || form.udhariAmount === undefined
        ? 0
        : parseAmount(form.udhariAmount);
    if (received !== undefined && (Number.isNaN(received) || received < 0)) {
      toast("Enter a valid amount received", "error");
      return;
    }
    if (udhari !== undefined && (Number.isNaN(udhari) || udhari < 0)) {
      toast("Enter a valid udhari amount", "error");
      return;
    }

    if (!form.receivedByOwnerId) {
      toast("Select owner — required", "error");
      return;
    }

    const row: StadiumMatch = {
      id: editingId ?? `M-${Date.now()}`,
      customerName: form.customerName.trim(),
      phone: form.phone.trim() || undefined,
      date: form.date,
      slotId: form.slotId,
      slotLabel: form.slotLabel,
      slotPrice: form.slotPrice,
      amountReceived: received,
      udhariAmount: udhari,
      receivedByOwnerId: form.receivedByOwnerId || undefined,
      matchType: form.matchType,
      notes: form.notes.trim() || undefined,
      status: "completed",
    };

    if (editingId) {
      persist(matches.map((m) => (m.id === editingId ? row : m)));
    } else {
      persist([row, ...matches]);
    }
    cancelForm();
  };

  const deleteEntry = (id: string) => {
    if (!confirm("Delete this old session?")) return;
    persist(matches.filter((m) => m.id !== id));
  };

  const totals = useMemo(
    () => ({
      received: matches.reduce((s, m) => s + matchAmountReceived(m), 0),
      billed: matches.reduce((s, m) => s + (m.slotPrice ?? 0), 0),
      udhari: matches.reduce((s, m) => s + matchUdhari(m), 0),
    }),
    [matches]
  );

  if (loading) {
    return (
      <AdminShell title="Old Sessions">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      </AdminShell>
    );
  }

  const dateSlots = slotsForDate(form.date);

  return (
    <AdminShell title="Old Sessions">
      <p className="text-sm text-slate-600 mb-4 max-w-3xl">
        Backfill past ground sessions (before bookings) — same fields as a booking: customer, date,
        session, amount received. Counts in dashboard finance.
      </p>

      <div className="grid sm:grid-cols-3 gap-3 mb-6 max-w-2xl">
        <Card className="!p-4">
          <p className="text-xs text-slate-500">Total received</p>
          <p className="text-xl font-bold text-green-700">{formatCurrency(totals.received)}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-slate-500">Total billed</p>
          <p className="text-xl font-bold text-[var(--navy)]">{formatCurrency(totals.billed)}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-slate-500">Total udhari</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(totals.udhari)}</p>
        </Card>
      </div>

      {!showForm ? (
        <Button size="sm" className="mb-6" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add old session
        </Button>
      ) : (
        <Card className="mb-6 max-w-3xl">
          <h3 className="font-semibold text-[var(--navy)] mb-4">
            {editingId ? "Edit old session" : "Add old session"}
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <Label>Customer name</Label>
              <Input
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="Contact name"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Session</Label>
              <Select
                value={form.slotId}
                onChange={(e) => pickSlot(e.target.value)}
                className="mt-1"
              >
                {dateSlots.length === 0 && <option value="">No session for this date</option>}
                {dateSlots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} — {formatCurrency(s.price)}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Session price (₹)</Label>
              <AmountInput
                value={form.slotPrice}
                onChange={(v) => setForm({ ...form, slotPrice: parseAmount(v) })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Amount received (₹)</Label>
              <AmountInput
                value={form.amountReceived}
                onChange={(amountReceived) => setForm({ ...form, amountReceived })}
                placeholder="Cash received"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Udhari / pending (₹)</Label>
              <AmountInput
                value={form.udhariAmount}
                onChange={(udhariAmount) => setForm({ ...form, udhariAmount })}
                placeholder="0 if none — manual"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Match type</Label>
              <Select
                value={form.matchType}
                onChange={(e) => setForm({ ...form, matchType: e.target.value as MatchType })}
                className="mt-1"
              >
                {matchTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
            {store && (
              <OwnerSelect
                owners={store.owners ?? []}
                value={form.receivedByOwnerId}
                onChange={(receivedByOwnerId) => setForm({ ...form, receivedByOwnerId })}
                label="Owner / who received *"
                required
              />
            )}
            <div className="sm:col-span-2 lg:col-span-3">
              <Label>Notes (optional)</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={submitEntry} disabled={saving}>
              <Save className="h-4 w-4" />
              {editingId ? "Update" : "Save"} session
            </Button>
            <Button variant="ghost" onClick={cancelForm}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-0 md:p-6">
        <ResponsiveTable
          data={matches}
          rowKey={(m) => m.id}
          emptyMessage="No old sessions yet — click Add old session"
          columns={[
            { key: "date", header: "Date", render: (m) => formatDate(m.date) },
            {
              key: "customer",
              header: "Customer",
              render: (m) => (
                <div>
                  <p className="font-medium text-[var(--navy)]">{m.customerName}</p>
                  {m.phone && <p className="text-xs text-slate-500">{m.phone}</p>}
                </div>
              ),
            },
            { key: "slot", header: "Session", render: (m) => m.slotLabel },
            { key: "price", header: "Price", render: (m) => formatCurrency(m.slotPrice) },
            {
              key: "received",
              header: "Received",
              render: (m) => formatCurrency(matchAmountReceived(m)),
            },
            {
              key: "udhari",
              header: "Udhari",
              render: (m) =>
                matchUdhari(m) > 0 ? (
                  <span className="text-red-600 font-semibold">{formatCurrency(matchUdhari(m))}</span>
                ) : (
                  "—"
                ),
            },
            {
              key: "owner",
              header: "Owner",
              render: (m) =>
                store && m.receivedByOwnerId ? getOwnerName(store, m.receivedByOwnerId) : "—",
            },
            {
              key: "actions",
              header: "",
              render: (m) => (
                <EntryActions onEdit={() => startEdit(m)} onDelete={() => deleteEntry(m.id)} />
              ),
            },
          ]}
        />
      </Card>
    </AdminShell>
  );
}
