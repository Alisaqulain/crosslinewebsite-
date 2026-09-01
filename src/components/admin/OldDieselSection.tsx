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
import { dieselAmount } from "@/lib/diesel";
import { getOwnerName } from "@/lib/owners";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AppStore, DieselExpense } from "@/lib/types";
import { Loader2, Plus, Save } from "lucide-react";

type DieselForm = {
  date: string;
  amount: string | number;
  purpose: string;
  ownerId: string;
};

function emptyForm(): DieselForm {
  return {
    date: new Date().toISOString().split("T")[0],
    amount: "",
    purpose: "",
    ownerId: "",
  };
}

function toForm(e: DieselExpense): DieselForm {
  return {
    date: e.date,
    amount: dieselAmount(e),
    purpose: e.purpose,
    ownerId: e.ownerId ?? "",
  };
}

export function OldDieselSection() {
  const { toast } = useToast();
  const [store, setStore] = useState<AppStore | null>(null);
  const [expenses, setExpenses] = useState<DieselExpense[]>([]);
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
      const rows = [...(s.oldDieselExpenses ?? [])].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setExpenses(rows);
      setLoading(false);
    });
  }, []);

  const persist = async (data: DieselExpense[]) => {
    setSaving(true);
    try {
      const { store: updated } = await patchAdmin("oldDieselExpenses", data);
      setStore(updated);
      setExpenses(updated.oldDieselExpenses ?? data);
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

  const startEdit = (e: DieselExpense) => {
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
    if (!amount || amount <= 0) {
      toast("Enter a valid diesel amount", "error");
      return;
    }
    const ownerId = defaultOwnerId(lockedOwnerId, form.ownerId, store?.owners ?? []);
    if (!ownerId) {
      toast("Select who paid / recorded this", "error");
      return;
    }

    const row: DieselExpense = {
      id: editingId ?? `OLD-D-${Date.now().toString(36).toUpperCase()}`,
      date: form.date,
      amount,
      purpose: form.purpose.trim(),
      shift: "night",
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
    if (!confirm("Delete this old diesel entry?")) return;
    persist(expenses.filter((e) => e.id !== id));
  };

  const total = useMemo(() => expenses.reduce((s, e) => s + dieselAmount(e), 0), [expenses]);

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
        Past diesel costs before you started using this system — night match generator / floodlight
        fuel, etc.
      </p>

      <Card className="!p-4 mb-6 max-w-xs">
        <p className="text-xs text-slate-500">Total old diesel</p>
        <p className="text-lg font-bold text-red-600">{formatCurrency(total)}</p>
      </Card>

      {!showForm ? (
        <Button size="sm" className="mb-6" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add old diesel
        </Button>
      ) : (
        <Card className="mb-6 max-w-3xl">
          <h3 className="font-semibold text-[var(--navy)] mb-4">
            {editingId ? "Edit old diesel" : "Add old diesel"}
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
              <Label>Amount (₹)</Label>
              <AmountInput
                value={form.amount}
                onChange={(amount) => setForm({ ...form, amount })}
                className="mt-1"
                placeholder="e.g. 2500"
              />
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
              <Label>Purpose / note (optional)</Label>
              <Input
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                placeholder="Night session generator"
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={submitEntry} disabled={saving}>
              <Save className="h-4 w-4" />
              {editingId ? "Update" : "Save"} entry
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
          emptyMessage="No old diesel entries yet"
          columns={[
            { key: "date", header: "Date", render: (e) => formatDate(e.date) },
            { key: "amount", header: "Amount", render: (e) => formatCurrency(dieselAmount(e)) },
            {
              key: "purpose",
              header: "Note",
              render: (e) => (
                <span>
                  {e.purpose || "—"}
                  {store && e.ownerId && (
                    <span className="block text-xs text-red-700">
                      By {getOwnerName(store, e.ownerId)}
                    </span>
                  )}
                </span>
              ),
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
    </div>
  );
}
