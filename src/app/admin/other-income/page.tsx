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
import { getOwnerName } from "@/lib/owners";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AppStore, OtherIncome, ShiftCategory, StadiumOwner } from "@/lib/types";
import { Loader2, Save, TrendingUp } from "lucide-react";

const CATEGORIES = [
  "Sponsorship",
  "Equipment rent",
  "Academy fees",
  "Tournament fees",
  "Misc income",
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

export default function AdminOtherIncomePage() {
  const { toast } = useToast();
  const [store, setStore] = useState<AppStore | null>(null);
  const [owners, setOwners] = useState<StadiumOwner[]>([]);
  const [incomes, setIncomes] = useState<OtherIncome[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchAdminStore().then(({ store: s }) => {
      setStore(s);
      setOwners(s.owners ?? []);
      setIncomes(s.otherIncomes ?? []);
      setLoading(false);
    });
  }, []);

  const save = async (data: OtherIncome[]) => {
    setSaving(true);
    try {
      const { store: updated } = await patchAdmin("otherIncomes", data);
      setStore(updated);
      setIncomes(updated.otherIncomes ?? data);
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
      toast("Title and amount are required", "error");
      return;
    }
    if (!form.ownerId) {
      toast("Select who received this income", "error");
      return;
    }
    const payload = { ...form, amount, note: form.note || undefined };
    if (editingId) {
      save(incomes.map((e) => (e.id === editingId ? { ...e, ...payload } : e)));
      setEditingId(null);
    } else {
      save([{ id: `OI-${Date.now().toString(36).toUpperCase()}`, ...payload }, ...incomes]);
    }
    setForm(emptyForm());
  };

  const startEdit = (e: OtherIncome) => {
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
    if (!confirm("Delete this income entry?")) return;
    save(incomes.filter((x) => x.id !== id));
  };

  const total = incomes.reduce((s, e) => s + e.amount, 0);

  if (loading) {
    return (
      <AdminShell title="Other Income">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Other Income">
      <p className="text-sm text-slate-600 mb-6 max-w-2xl">
        Money received outside bookings — sponsorship, rent, etc. Select which owner received it.
      </p>

      <Card className="mb-6">
        <h3 className="font-semibold text-[var(--navy)] mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          {editingId ? "Edit income" : "Add income"}
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label>Date</Label>
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1" />
          </div>
          <div className="sm:col-span-2">
            <Label>Description</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Sponsor payment" className="mt-1" />
          </div>
          <div>
            <Label>Amount (₹)</Label>
            <Input type="number" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="mt-1" />
          </div>
          <OwnerSelect
            owners={owners}
            value={form.ownerId}
            onChange={(ownerId) => setForm({ ...form, ownerId })}
            label="Received by"
            required
          />
          <div>
            <Label>Category</Label>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Day / Night</Label>
            <Select value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value as ShiftCategory })} className="mt-1">
              <option value="day">Day</option>
              <option value="night">Night</option>
            </Select>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <Label>Notes (optional)</Label>
            <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="mt-1" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={submitEntry} disabled={saving}>
            <Save className="h-4 w-4" />
            {editingId ? "Update" : "Save"} income
          </Button>
        </div>
      </Card>

      <p className="text-sm font-semibold text-[var(--navy)] mb-4">Total: {formatCurrency(total)}</p>

      <Card className="p-0 md:p-6">
        <ResponsiveTable
          data={incomes}
          rowKey={(e) => e.id}
          emptyMessage="No other income yet"
          columns={[
            { key: "date", header: "Date", render: (e) => formatDate(e.date) },
            {
              key: "title",
              header: "Description",
              render: (e) => (
                <div>
                  <p className="font-medium text-[var(--navy)]">{e.title}</p>
                  {store && e.ownerId && (
                    <p className="text-xs text-green-700">Received by {getOwnerName(store, e.ownerId)}</p>
                  )}
                </div>
              ),
            },
            { key: "amount", header: "Amount", render: (e) => formatCurrency(e.amount) },
            {
              key: "actions",
              header: "",
              render: (e) => <EntryActions onEdit={() => startEdit(e)} onDelete={() => deleteEntry(e.id)} />,
            },
          ]}
        />
      </Card>
    </AdminShell>
  );
}
