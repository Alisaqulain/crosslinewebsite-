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
import { Input, Label } from "@/components/ui/Input";
import { AmountInput, parseAmount } from "@/components/ui/AmountInput";
import { ResponsiveTable } from "@/components/admin/ResponsiveTable";
import { fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { dieselAmount } from "@/lib/diesel";
import { getOwnerName } from "@/lib/owners";
import type { AppStore, DieselExpense, StadiumOwner } from "@/lib/types";
import { Loader2, Plus, Save } from "lucide-react";

type DieselRow = DieselExpense & { entryKind: EntryKind };

const emptyForm = () => ({
  date: new Date().toISOString().split("T")[0],
  amount: "" as string | number,
  purpose: "",
  ownerId: "",
  entryKind: "current" as EntryKind,
});

export default function AdminDieselPage() {
  const { toast } = useToast();
  const [store, setStore] = useState<AppStore | null>(null);
  const [owners, setOwners] = useState<StadiumOwner[]>([]);
  const [currentExpenses, setCurrentExpenses] = useState<DieselExpense[]>([]);
  const [oldExpenses, setOldExpenses] = useState<DieselExpense[]>([]);
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
      setCurrentExpenses(s.dieselExpenses ?? []);
      setOldExpenses(s.oldDieselExpenses ?? []);
      setLoading(false);
    });
  }, []);

  const allExpenses = useMemo<DieselRow[]>(
    () =>
      [
        ...currentExpenses.map((e) => ({ ...e, entryKind: "current" as const })),
        ...oldExpenses.map((e) => ({ ...e, entryKind: "old" as const })),
      ].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)),
    [currentExpenses, oldExpenses]
  );

  const total = allExpenses.reduce((s, e) => s + dieselAmount(e), 0);

  const persist = async (current: DieselExpense[], old: DieselExpense[]) => {
    setSaving(true);
    try {
      await patchAdmin("dieselExpenses", current);
      const { store: updated } = await patchAdmin("oldDieselExpenses", old);
      setStore(updated);
      setCurrentExpenses(updated.dieselExpenses ?? current);
      setOldExpenses(updated.oldDieselExpenses ?? old);
      toast("Saved", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const submitEntry = () => {
    const amount = parseAmount(form.amount);
    if (!amount || amount <= 0) {
      toast("Enter a valid diesel amount", "error");
      return;
    }
    if (!(lockedOwnerId || form.ownerId)) {
      toast("Select who paid / recorded this", "error");
      return;
    }
    const ownerId = defaultOwnerId(lockedOwnerId, form.ownerId, owners);
    const row: DieselExpense = {
      id: editingId ?? `${form.entryKind === "old" ? "OLD-D" : "DE"}-${Date.now().toString(36).toUpperCase()}`,
      date: form.date,
      amount,
      purpose: form.purpose.trim(),
      shift: "night",
      ownerId,
    };

    let nextCurrent = [...currentExpenses];
    let nextOld = [...oldExpenses];

    if (editingId) {
      if (isOldEntryId(editingId)) nextOld = nextOld.filter((e) => e.id !== editingId);
      else nextCurrent = nextCurrent.filter((e) => e.id !== editingId);
    }

    if (form.entryKind === "old") nextOld = [row, ...nextOld];
    else nextCurrent = [row, ...nextCurrent];

    persist(nextCurrent, nextOld);
    setEditingId(null);
    setShowForm(false);
    setForm(emptyForm());
  };

  const startEdit = (e: DieselRow) => {
    setShowForm(true);
    setEditingId(e.id);
    setForm({
      date: e.date,
      amount: dieselAmount(e),
      purpose: e.purpose,
      ownerId: e.ownerId ?? "",
      entryKind: e.entryKind,
    });
  };

  const deleteEntry = (e: DieselRow) => {
    if (!confirm("Delete this diesel entry?")) return;
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
      <AdminShell title="Diesel">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Diesel">
      <p className="admin-page-intro">
        Night match diesel costs. Pick &quot;Old&quot; for past diesel before you started tracking here.
      </p>

      <Card className="!p-4 mb-6 max-w-sm">
        <p className="text-xs text-slate-500">Total diesel</p>
        <p className="text-xl font-bold text-red-600">{formatCurrency(total)}</p>
        <p className="text-xs text-slate-500 mt-1">{allExpenses.length} entries</p>
      </Card>

      <AdminCollapsibleForm
        open={showForm || !!editingId}
        onOpenChange={setShowForm}
        title="Add diesel entry"
        addLabel="Add diesel entry"
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
            <Input
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              className="mt-1"
              placeholder="Floodlights generator, night session, etc."
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={submitEntry} disabled={saving || !parseAmount(form.amount)}>
            {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingId ? "Update" : "Add entry"}
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
              Cancel
            </Button>
          )}
        </div>
      </AdminCollapsibleForm>

      <Card className="p-0 md:p-6">
        <ResponsiveTable
          data={allExpenses}
          rowKey={(e) => e.id}
          emptyMessage="No diesel entries yet"
          columns={[
            { key: "date", header: "Date", render: (e) => formatDate(e.date) },
            { key: "amount", header: "Amount", render: (e) => formatCurrency(dieselAmount(e)) },
            {
              key: "purpose",
              header: "Note",
              render: (e) => (
                <span>
                  {e.purpose || "—"}
                  {e.entryKind === "old" && (
                    <span className="block text-[10px] font-semibold uppercase text-amber-700">
                      Old
                    </span>
                  )}
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
                <EntryActions onEdit={() => startEdit(e)} onDelete={() => deleteEntry(e)} />
              ),
            },
          ]}
        />
      </Card>
    </AdminShell>
  );
}
