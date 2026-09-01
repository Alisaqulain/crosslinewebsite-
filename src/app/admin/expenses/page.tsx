"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { AdminCollapsibleForm } from "@/components/admin/AdminCollapsibleForm";
import { EntryKindSelect, isOldEntryId, type EntryKind } from "@/components/admin/EntryKindSelect";
import { SessionOwnerSelect } from "@/components/admin/SessionOwnerSelect";
import { defaultOwnerId, useSessionOwnerLock } from "@/hooks/useSessionOwnerLock";
import { EntryActions } from "@/components/admin/EntryActions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { AmountInput, parseAmount } from "@/components/ui/AmountInput";
import { ResponsiveTable } from "@/components/admin/ResponsiveTable";
import { fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getOwnerName } from "@/lib/owners";
import type { AppStore, OtherExpense, ShiftCategory, StadiumOwner } from "@/lib/types";
import { Loader2, Save } from "lucide-react";

const CATEGORIES = [
  "Ground equipment",
  "Maintenance",
  "Supplies",
  "Staff / labour",
  "Utilities",
  "Other",
];

type ExpenseRow = OtherExpense & { entryKind: EntryKind };

const emptyForm = () => ({
  date: new Date().toISOString().split("T")[0],
  title: "",
  amount: "" as string | number,
  category: CATEGORIES[0],
  shift: "day" as ShiftCategory,
  note: "",
  ownerId: "",
  entryKind: "current" as EntryKind,
});

export default function AdminOtherExpensesPage() {
  const { toast } = useToast();
  const [store, setStore] = useState<AppStore | null>(null);
  const [owners, setOwners] = useState<StadiumOwner[]>([]);
  const [currentExpenses, setCurrentExpenses] = useState<OtherExpense[]>([]);
  const [oldExpenses, setOldExpenses] = useState<OtherExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { lockedOwnerId, lockedOwnerName } = useSessionOwnerLock();

  useEffect(() => {
    fetchAdminStore().then(({ store: s }) => {
      setStore(s);
      setOwners(s.owners ?? []);
      setCurrentExpenses(s.otherExpenses ?? []);
      setOldExpenses(s.oldExpenses ?? []);
      setLoading(false);
    });
  }, []);

  const allExpenses = useMemo<ExpenseRow[]>(
    () =>
      [
        ...currentExpenses.map((e) => ({ ...e, entryKind: "current" as const })),
        ...oldExpenses.map((e) => ({ ...e, entryKind: "old" as const })),
      ].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)),
    [currentExpenses, oldExpenses]
  );

  const total = allExpenses.reduce((s, e) => s + e.amount, 0);

  const persist = async (current: OtherExpense[], old: OtherExpense[]) => {
    setSaving(true);
    try {
      await patchAdmin("otherExpenses", current);
      const { store: updated } = await patchAdmin("oldExpenses", old);
      setStore(updated);
      setCurrentExpenses(updated.otherExpenses ?? current);
      setOldExpenses(updated.oldExpenses ?? old);
      toast("Saved", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const submitEntry = () => {
    const amount = parseAmount(form.amount);
    if (!form.title.trim() || !amount || amount <= 0) {
      toast("Description and amount are required", "error");
      return;
    }
    if (!(lockedOwnerId || form.ownerId)) {
      toast("Select who paid / recorded this expense", "error");
      return;
    }
    const ownerId = defaultOwnerId(lockedOwnerId, form.ownerId, owners);
    const row: OtherExpense = {
      id: editingId ?? `${form.entryKind === "old" ? "OLD-E" : "OE"}-${Date.now().toString(36).toUpperCase()}`,
      date: form.date,
      title: form.title.trim(),
      amount,
      category: form.category,
      shift: form.shift,
      note: form.note.trim() || undefined,
      ownerId,
    };

    let nextCurrent = [...currentExpenses];
    let nextOld = [...oldExpenses];

    if (editingId) {
      const wasOld = isOldEntryId(editingId);
      if (wasOld) nextOld = nextOld.filter((e) => e.id !== editingId);
      else nextCurrent = nextCurrent.filter((e) => e.id !== editingId);
    }

    if (form.entryKind === "old") nextOld = [row, ...nextOld];
    else nextCurrent = [row, ...nextCurrent];

    persist(nextCurrent, nextOld);
    setEditingId(null);
    setShowForm(false);
    setForm(emptyForm());
  };

  const startEdit = (e: ExpenseRow) => {
    setShowForm(true);
    setEditingId(e.id);
    setForm({
      date: e.date,
      title: e.title,
      amount: e.amount,
      category: e.category,
      shift: e.shift,
      note: e.note ?? "",
      ownerId: e.ownerId ?? "",
      entryKind: e.entryKind,
    });
  };

  const deleteEntry = (e: ExpenseRow) => {
    if (!confirm("Delete this expense?")) return;
    if (e.entryKind === "old") {
      persist(currentExpenses, oldExpenses.filter((x) => x.id !== e.id));
    } else {
      persist(
        currentExpenses.filter((x) => x.id !== e.id),
        oldExpenses
      );
    }
  };

  if (loading) {
    return (
      <AdminShell title="Expenses">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Expenses">
      <p className="admin-page-intro">
        Ground purchases (not diesel or balls). Use &quot;Old&quot; for past expenses before you started
        tracking here.
      </p>

      <Card className="!p-4 mb-6 max-w-sm">
        <p className="text-xs text-slate-500">Total expenses</p>
        <p className="text-xl font-bold text-red-600">{formatCurrency(total)}</p>
        <p className="text-xs text-slate-500 mt-1">{allExpenses.length} entries</p>
      </Card>

      <AdminCollapsibleForm
        open={showForm || !!editingId}
        onOpenChange={setShowForm}
        title="Add expense"
        addLabel="Add expense"
        editing={!!editingId}
      >
        <div className="admin-form-grid cols-3">
          <EntryKindSelect
            value={form.entryKind}
            onChange={(entryKind) => setForm({ ...form, entryKind })}
          />
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-2">
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
            <AmountInput
              value={form.amount}
              onChange={(amount) => setForm({ ...form, amount })}
              className="mt-1"
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
          <Button onClick={submitEntry} disabled={saving || !parseAmount(form.amount)}>
            <Save className="h-4 w-4" />
            {editingId ? "Update" : "Save"} expense
          </Button>
          {editingId && (
            <Button
              variant="ghost"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm());
                setShowForm(false);
              }}
            >
              Cancel edit
            </Button>
          )}
        </div>
      </AdminCollapsibleForm>

      <Card className="p-0 md:p-6">
        <ResponsiveTable
          data={allExpenses}
          rowKey={(e) => e.id}
          emptyMessage="No expenses yet"
          columns={[
            { key: "date", header: "Date", render: (e) => formatDate(e.date) },
            {
              key: "title",
              header: "Description",
              render: (e) => (
                <div>
                  <p className="font-medium text-[var(--navy)]">{e.title}</p>
                  {e.entryKind === "old" && (
                    <span className="text-[10px] font-semibold uppercase text-amber-700">Old</span>
                  )}
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
                <EntryActions onEdit={() => startEdit(e)} onDelete={() => deleteEntry(e)} />
              ),
            },
          ]}
        />
      </Card>
    </AdminShell>
  );
}
