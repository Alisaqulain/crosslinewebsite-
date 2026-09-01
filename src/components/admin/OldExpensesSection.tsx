"use client";

import { useEffect, useMemo, useState } from "react";
import { EntryActions } from "@/components/admin/EntryActions";
import { SessionOwnerSelect } from "@/components/admin/SessionOwnerSelect";
import { defaultOwnerId, useSessionOwnerLock } from "@/hooks/useSessionOwnerLock";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { AmountInput, parseAmount } from "@/components/ui/AmountInput";
import { ResponsiveTable } from "@/components/admin/ResponsiveTable";
import { fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { getOwnerName } from "@/lib/owners";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AppStore, OtherExpense, ShiftCategory } from "@/lib/types";
import { Loader2, Plus, Save } from "lucide-react";

const CATEGORIES = [
  "Ground equipment",
  "Maintenance",
  "Supplies",
  "Staff / labour",
  "Utilities",
  "Diesel",
  "Ball purchase",
  "Other",
];

type ExpenseForm = {
  date: string;
  title: string;
  amount: string | number;
  category: string;
  shift: ShiftCategory;
  note: string;
  ownerId: string;
};

function emptyForm(): ExpenseForm {
  return {
    date: new Date().toISOString().split("T")[0],
    title: "",
    amount: "",
    category: CATEGORIES[0],
    shift: "day",
    note: "",
    ownerId: "",
  };
}

function toForm(e: OtherExpense): ExpenseForm {
  return {
    date: e.date,
    title: e.title,
    amount: e.amount,
    category: e.category,
    shift: e.shift,
    note: e.note ?? "",
    ownerId: e.ownerId ?? "",
  };
}

export function OldExpensesSection() {
  const { toast } = useToast();
  const [store, setStore] = useState<AppStore | null>(null);
  const [expenses, setExpenses] = useState<OtherExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { lockedOwnerId, lockedOwnerName } = useSessionOwnerLock();

  useEffect(() => {
    if (lockedOwnerId) {
      setForm((f) => ({ ...f, ownerId: lockedOwnerId }));
    }
  }, [lockedOwnerId]);

  useEffect(() => {
    fetchAdminStore().then(({ store: s }) => {
      setStore(s);
      const rows = [...(s.oldExpenses ?? [])].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setExpenses(rows);
      setLoading(false);
    });
  }, []);

  const persist = async (data: OtherExpense[]) => {
    setSaving(true);
    try {
      const { store: updated } = await patchAdmin("oldExpenses", data);
      setStore(updated);
      setExpenses(updated.oldExpenses ?? data);
      toast("Saved", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const startEdit = (e: OtherExpense) => {
    setEditingId(e.id);
    setForm(toForm(e));
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const submitEntry = () => {
    const amount = parseAmount(form.amount);
    if (!form.title.trim() || !amount || amount <= 0) {
      toast("Description and amount are required", "error");
      return;
    }
    const ownerId = defaultOwnerId(lockedOwnerId, form.ownerId, store?.owners ?? []);
    if (!ownerId) {
      toast("Select who paid / recorded this", "error");
      return;
    }

    const row: OtherExpense = {
      id: editingId ?? `OLD-E-${Date.now().toString(36).toUpperCase()}`,
      date: form.date,
      title: form.title.trim(),
      amount,
      category: form.category,
      shift: form.shift,
      note: form.note.trim() || undefined,
      ownerId,
    };

    if (editingId) {
      persist(expenses.map((e) => (e.id === editingId ? row : e)));
    } else {
      persist([row, ...expenses]);
    }
    cancelForm();
  };

  const deleteEntry = (id: string) => {
    if (!confirm("Delete this old expense?")) return;
    persist(expenses.filter((e) => e.id !== id));
  };

  const total = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-slate-600 mb-4">
        Past expenses before you started using this system — add historical records here for accurate
        profit &amp; loss.
      </p>

      <Card className="!p-4 mb-6 max-w-xs">
        <p className="text-xs text-slate-500">Total old expenses</p>
        <p className="text-lg font-bold text-red-600">{formatCurrency(total)}</p>
      </Card>

      {!showForm ? (
        <Button size="sm" className="mb-6" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add old expense
        </Button>
      ) : (
        <Card className="mb-6 max-w-3xl">
          <h3 className="font-semibold text-[var(--navy)] mb-4">
            {editingId ? "Edit old expense" : "Add old expense"}
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>What was paid for?</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Generator repair, nets"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Amount (₹)</Label>
              <AmountInput
                value={form.amount}
                onChange={(amount) => setForm({ ...form, amount })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            {store && (
              <SessionOwnerSelect
                owners={store.owners ?? []}
                value={lockedOwnerId ?? form.ownerId}
                onChange={(ownerId) => setForm({ ...form, ownerId })}
                lockedOwnerId={lockedOwnerId}
                lockedOwnerName={lockedOwnerName}
                label="Paid by / recorded by"
                required
              />
            )}
            <div className="sm:col-span-2 lg:col-span-3">
              <Label>Notes (optional)</Label>
              <Input
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={submitEntry} disabled={saving}>
              <Save className="h-4 w-4" />
              {editingId ? "Update" : "Save"} expense
            </Button>
            <Button variant="ghost" onClick={cancelForm}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-0 md:p-6">
        <ResponsiveTable
          data={expenses}
          rowKey={(e) => e.id}
          emptyMessage="No old expenses yet"
          columns={[
            { key: "date", header: "Date", render: (e) => formatDate(e.date) },
            {
              key: "title",
              header: "Description",
              render: (e) => (
                <div>
                  <p className="font-medium text-[var(--navy)]">{e.title}</p>
                  {store && e.ownerId && (
                    <p className="text-xs text-red-700">By {getOwnerName(store, e.ownerId)}</p>
                  )}
                  {e.note && <p className="text-xs text-slate-500">{e.note}</p>}
                </div>
              ),
            },
            { key: "category", header: "Category", render: (e) => e.category },
            { key: "amount", header: "Amount", render: (e) => formatCurrency(e.amount) },
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
    </div>
  );
}
