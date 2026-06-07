"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { OwnerSelect } from "@/components/admin/OwnerSelect";
import { EntryActions } from "@/components/admin/EntryActions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { ResponsiveTable } from "@/components/admin/ResponsiveTable";
import { fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getOwnerName } from "@/lib/owners";
import type { AppStore, OtherExpense, ShiftCategory, StadiumOwner } from "@/lib/types";
import { Loader2, Plus, Receipt, Save } from "lucide-react";

const CATEGORIES = [
  "Ground equipment",
  "Maintenance",
  "Supplies",
  "Staff / labour",
  "Utilities",
  "Other",
];

const emptyForm = () => ({
  date: new Date().toISOString().split("T")[0],
  title: "",
  amount: 0,
  category: CATEGORIES[0],
  shift: "day" as ShiftCategory,
  note: "",
  ownerId: "",
});

export default function AdminOtherExpensesPage() {
  const { toast } = useToast();
  const [store, setStore] = useState<AppStore | null>(null);
  const [owners, setOwners] = useState<StadiumOwner[]>([]);
  const [expenses, setExpenses] = useState<OtherExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchAdminStore().then(({ store: s }) => {
      setStore(s);
      setOwners(s.owners ?? []);
      setExpenses(s.otherExpenses ?? []);
      setLoading(false);
    });
  }, []);

  const save = async (data: OtherExpense[]) => {
    setSaving(true);
    try {
      const { store: updated } = await patchAdmin("otherExpenses", data);
      setStore(updated);
      setExpenses(updated.otherExpenses ?? data);
      toast("Saved", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const submitEntry = () => {
    const amount = Number(form.amount);
    if (!form.title.trim() || !amount || amount <= 0) {
      toast("Title and a valid amount are required", "error");
      return;
    }
    if (!form.ownerId) {
      toast("Select who paid / recorded this expense", "error");
      return;
    }
    if (editingId) {
      const next = expenses.map((e) =>
        e.id === editingId ? { ...e, ...form, amount } : e
      );
      save(next);
      setEditingId(null);
    } else {
      const entry: OtherExpense = {
        id: `OE-${Date.now().toString(36).toUpperCase()}`,
        ...form,
        amount,
      };
      save([entry, ...expenses]);
    }
    setForm(emptyForm());
  };

  const startEdit = (e: OtherExpense) => {
    setEditingId(e.id);
    setForm({
      date: e.date,
      title: e.title,
      amount: e.amount,
      category: e.category,
      shift: e.shift,
      note: e.note ?? "",
      ownerId: e.ownerId ?? "",
    });
  };

  const deleteEntry = (id: string) => {
    if (!confirm("Delete this expense?")) return;
    save(expenses.filter((x) => x.id !== id));
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  if (loading) {
    return (
      <AdminShell title="Other Expenses">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Other Ground Expenses">
      <p className="text-sm text-slate-600 mb-6 max-w-2xl">
        Record purchases for the ground that are not diesel or cricket balls — nets, markers,
        chairs, repairs, water, etc. These appear in Profit &amp; Loss.
      </p>

      <Card className="mb-6">
        <h3 className="font-semibold text-[var(--navy)] mb-4 flex items-center gap-2">
          <Receipt className="h-5 w-5 text-[#F7931E]" />
          {editingId ? "Edit expense" : "Add expense"}
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <Label>What did you buy / pay for?</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. New boundary rope, chair rental"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Amount (₹)</Label>
            <Input
              type="number"
              value={form.amount || ""}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              className="mt-1"
            />
          </div>
          <OwnerSelect
            owners={owners}
            value={form.ownerId}
            onChange={(ownerId) => setForm({ ...form, ownerId })}
            label="Paid by / recorded by"
            required
          />
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
          {editingId && (
            <Button
              variant="ghost"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm());
              }}
            >
              Cancel edit
            </Button>
          )}
        </div>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--navy)]">
          Total recorded: {formatCurrency(total)}
        </p>
      </div>

      <Card className="p-0 md:p-6">
        <ResponsiveTable
          data={expenses}
          rowKey={(e) => e.id}
          emptyMessage="No other expenses yet"
          columns={[
            {
              key: "date",
              header: "Date",
              render: (e) => formatDate(e.date),
            },
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
            {
              key: "category",
              header: "Category",
              render: (e) => e.category,
            },
            {
              key: "amount",
              header: "Amount",
              render: (e) => formatCurrency(e.amount),
            },
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
