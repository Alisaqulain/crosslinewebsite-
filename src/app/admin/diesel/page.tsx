"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { SessionOwnerSelect } from "@/components/admin/SessionOwnerSelect";
import { defaultOwnerId, useSessionOwnerLock } from "@/hooks/useSessionOwnerLock";
import { EntryActions } from "@/components/admin/EntryActions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { AmountInput, parseAmount } from "@/components/ui/AmountInput";
import { ResponsiveTable } from "@/components/admin/ResponsiveTable";
import { fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { dieselAmount } from "@/lib/diesel";
import { getOwnerName } from "@/lib/owners";
import type { AppStore, DieselExpense, StadiumOwner } from "@/lib/types";
import { Fuel, Loader2, Moon, Plus, Save } from "lucide-react";

const emptyForm = () => ({
  date: new Date().toISOString().split("T")[0],
  amount: "",
  purpose: "",
  ownerId: "",
});

export default function AdminDieselPage() {
  const { toast } = useToast();
  const [store, setStore] = useState<AppStore | null>(null);
  const [owners, setOwners] = useState<StadiumOwner[]>([]);
  const [expenses, setExpenses] = useState<DieselExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { lockedOwnerId, lockedOwnerName } = useSessionOwnerLock();

  useEffect(() => {
    fetchAdminStore().then(({ store: s }) => {
      setStore(s);
      setOwners(s.owners ?? []);
      setExpenses(s.dieselExpenses);
      setLoading(false);
    });
  }, []);

  const save = async (data: DieselExpense[]) => {
    setSaving(true);
    try {
      await patchAdmin("dieselExpenses", data);
      setExpenses(data);
      toast("Saved", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const submitEntry = () => {
    const amount = parseAmount(form.amount);
    if (!amount || !(lockedOwnerId || form.ownerId)) {
      toast("Fill amount (₹) and select owner", "error");
      return;
    }
    const ownerId = defaultOwnerId(lockedOwnerId, form.ownerId, owners);
    if (editingId) {
      const next = expenses.map((e) =>
        e.id === editingId
          ? { ...e, date: form.date, amount, purpose: form.purpose, shift: "night" as const, ownerId }
          : e
      );
      save(next);
      setEditingId(null);
    } else {
      const entry: DieselExpense = {
        id: `DE-${Date.now().toString(36).toUpperCase()}`,
        date: form.date,
        amount,
        purpose: form.purpose,
        shift: "night",
        ownerId,
      };
      save([entry, ...expenses]);
    }
    setForm(emptyForm());
  };

  const startEdit = (e: DieselExpense) => {
    setEditingId(e.id);
    setForm({
      date: e.date,
      amount: String(dieselAmount(e)),
      purpose: e.purpose,
      ownerId: e.ownerId ?? "",
    });
  };

  const deleteEntry = (id: string) => {
    if (!confirm("Delete this diesel entry?")) return;
    save(expenses.filter((x) => x.id !== id));
  };

  const total = expenses.reduce((s, e) => s + dieselAmount(e), 0);

  if (loading) {
    return (
      <AdminShell title="Diesel Expenses">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Diesel Cost Entry">
      <Card className="mb-6">
        <h3 className="font-semibold text-[var(--navy)] mb-1 flex items-center gap-2">
          <Fuel className="h-5 w-5 text-[#F7931E]" />
          {editingId ? "Edit Diesel Expense" : "Add Diesel Expense"}
        </h3>
        <p className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
          <Moon className="h-3.5 w-3.5" />
          Night match only — diesel cost in rupees (₹)
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label>Date</Label>
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label>Amount (₹)</Label>
            <AmountInput
              value={form.amount}
              onChange={(amount) => setForm({ ...form, amount })}
              className="mt-1"
              placeholder="e.g. 2500"
            />
          </div>
          <SessionOwnerSelect
            owners={owners}
            value={lockedOwnerId ?? form.ownerId}
            onChange={(ownerId) => setForm({ ...form, ownerId })}
            lockedOwnerId={lockedOwnerId}
            lockedOwnerName={lockedOwnerName}
            label="Paid by / recorded by"
            required
          />
          <div className="sm:col-span-2 lg:col-span-3">
            <Label>Purpose / Note</Label>
            <Input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className="mt-1" placeholder="Floodlights generator, night session, etc." />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={submitEntry} disabled={saving || !parseAmount(form.amount)}>
            {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingId ? "Update Entry" : "Add Entry"}
          </Button>
          {editingId && (
            <Button variant="ghost" onClick={() => { setEditingId(null); setForm(emptyForm()); }}>
              Cancel
            </Button>
          )}
        </div>
      </Card>

      <p className="text-lg font-semibold text-[var(--navy)] mb-4">
        Total Diesel Expense: {formatCurrency(total)}
      </p>

      <Card className="p-0 md:p-6">
        <ResponsiveTable
          data={expenses}
          rowKey={(e) => e.id}
          emptyMessage="No diesel entries"
          columns={[
            { key: "date", header: "Date", render: (e) => formatDate(e.date) },
            { key: "amount", header: "Amount (₹)", render: (e) => formatCurrency(dieselAmount(e)) },
            { key: "shift", header: "Shift", render: () => <span className="capitalize text-indigo-700">Night</span> },
            { key: "purpose", header: "Purpose", render: (e) => (
              <span>
                {e.purpose || "—"}
                {store && e.ownerId && (
                  <span className="block text-xs text-red-700">By {getOwnerName(store, e.ownerId)}</span>
                )}
              </span>
            ) },
            {
              key: "actions",
              header: "",
              render: (e) => (
                <EntryActions onEdit={() => startEdit(e)} onDelete={() => deleteEntry(e.id)} />
              ),
            },
          ]}
        />
      </Card>
    </AdminShell>
  );
}
