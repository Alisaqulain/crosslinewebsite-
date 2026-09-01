"use client";

import { useEffect, useMemo, useState } from "react";
import { EntryActions } from "@/components/admin/EntryActions";
import { SessionOwnerSelect } from "@/components/admin/SessionOwnerSelect";
import { defaultOwnerId, useSessionOwnerLock } from "@/hooks/useSessionOwnerLock";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { AmountInput, parseAmount } from "@/components/ui/AmountInput";
import { ResponsiveTable } from "@/components/admin/ResponsiveTable";
import { fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { getOwnerName } from "@/lib/owners";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AppStore, OtherIncome, ShiftCategory } from "@/lib/types";
import { Loader2, Plus, Save } from "lucide-react";

const CATEGORIES = [
  "Sponsorship",
  "Drinks / snacks",
  "Food / canteen",
  "Equipment rent",
  "Parking",
  "Academy fees",
  "Tournament fees",
  "Coaching",
  "Net rent",
  "Ball sale",
  "Misc income",
  "Other",
];

type IncomeForm = {
  date: string;
  title: string;
  amount: string | number;
  category: string;
  shift: ShiftCategory;
  note: string;
  ownerId: string;
};

function emptyForm(): IncomeForm {
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

function toForm(i: OtherIncome): IncomeForm {
  return {
    date: i.date,
    title: i.title,
    amount: i.amount,
    category: i.category,
    shift: i.shift,
    note: i.note ?? "",
    ownerId: i.ownerId ?? "",
  };
}

export function OldIncomeSection() {
  const { toast } = useToast();
  const [store, setStore] = useState<AppStore | null>(null);
  const [incomes, setIncomes] = useState<OtherIncome[]>([]);
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
      const rows = [...(s.oldIncomes ?? [])].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setIncomes(rows);
      setLoading(false);
    });
  }, []);

  const persist = async (data: OtherIncome[]) => {
    setSaving(true);
    try {
      const { store: updated } = await patchAdmin("oldIncomes", data);
      setStore(updated);
      setIncomes(updated.oldIncomes ?? data);
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

  const startEdit = (i: OtherIncome) => {
    setEditingId(i.id);
    setForm(toForm(i));
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
      toast("Select who received this income", "error");
      return;
    }

    const row: OtherIncome = {
      id: editingId ?? `OLD-I-${Date.now().toString(36).toUpperCase()}`,
      date: form.date,
      title: form.title.trim(),
      amount,
      category: form.category,
      shift: form.shift,
      note: form.note.trim() || undefined,
      ownerId,
    };

    if (editingId) {
      persist(incomes.map((i) => (i.id === editingId ? row : i)));
    } else {
      persist([row, ...incomes]);
    }
    cancelForm();
  };

  const deleteEntry = (id: string) => {
    if (!confirm("Delete this old income entry?")) return;
    persist(incomes.filter((i) => i.id !== id));
  };

  const total = useMemo(() => incomes.reduce((s, i) => s + i.amount, 0), [incomes]);

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
        Past income before you started using this system — sponsorship, rent, fees, etc. These count
        in profit &amp; loss but do not affect ball stock.
      </p>

      <Card className="!p-4 mb-6 max-w-xs">
        <p className="text-xs text-slate-500">Total old income</p>
        <p className="text-lg font-bold text-green-700">{formatCurrency(total)}</p>
      </Card>

      {!showForm ? (
        <Button size="sm" className="mb-6" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add old income
        </Button>
      ) : (
        <Card className="mb-6 max-w-3xl">
          <h3 className="font-semibold text-[var(--navy)] mb-4">
            {editingId ? "Edit old income" : "Add old income"}
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
            <div>
              <Label>Category</Label>
              <Input
                list="old-income-categories"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Pick or type"
                className="mt-1"
              />
              <datalist id="old-income-categories">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Label>Description</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Sponsor payment from last season"
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
            {store && (
              <SessionOwnerSelect
                owners={store.owners ?? []}
                value={lockedOwnerId ?? form.ownerId}
                onChange={(ownerId) => setForm({ ...form, ownerId })}
                lockedOwnerId={lockedOwnerId}
                lockedOwnerName={lockedOwnerName}
                label="Received by"
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
              {editingId ? "Update" : "Save"} income
            </Button>
            <Button variant="ghost" onClick={cancelForm}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-0 md:p-6">
        <ResponsiveTable
          data={incomes}
          rowKey={(i) => i.id}
          emptyMessage="No old income yet"
          columns={[
            { key: "date", header: "Date", render: (i) => formatDate(i.date) },
            {
              key: "title",
              header: "Description",
              render: (i) => (
                <div>
                  <p className="font-medium text-[var(--navy)]">{i.title}</p>
                  <p className="text-xs text-slate-500">{i.category}</p>
                  {store && i.ownerId && (
                    <p className="text-xs text-green-700">{getOwnerName(store, i.ownerId)}</p>
                  )}
                  {i.note && <p className="text-xs text-slate-500">{i.note}</p>}
                </div>
              ),
            },
            { key: "amount", header: "Amount", render: (i) => formatCurrency(i.amount) },
            {
              key: "actions",
              header: "",
              render: (i) => (
                <EntryActions onEdit={() => startEdit(i)} onDelete={() => deleteEntry(i.id)} />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
