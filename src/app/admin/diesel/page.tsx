"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { ResponsiveTable } from "@/components/admin/ResponsiveTable";
import { fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DieselExpense, ShiftCategory } from "@/lib/types";
import { Fuel, Loader2, Plus, Save } from "lucide-react";

export default function AdminDieselPage() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<DieselExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    liters: 0,
    pricePerLiter: 0,
    purpose: "",
    shift: "day" as ShiftCategory,
  });

  useEffect(() => {
    fetchAdminStore().then(({ store }) => {
      setExpenses(store.dieselExpenses);
      setLoading(false);
    });
  }, []);

  const save = async (data: DieselExpense[]) => {
    setSaving(true);
    try {
      await patchAdmin("dieselExpenses", data);
      setExpenses(data);
      toast("Saved", "success");
    } catch {
      toast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const addEntry = () => {
    const totalCost = form.liters * form.pricePerLiter;
    const entry: DieselExpense = {
      id: `DE-${Date.now().toString(36).toUpperCase()}`,
      ...form,
      totalCost,
    };
    const next = [entry, ...expenses];
    save(next);
    setForm({
      date: new Date().toISOString().split("T")[0],
      liters: 0,
      pricePerLiter: 0,
      purpose: "",
      shift: "day",
    });
  };

  const total = expenses.reduce((s, e) => s + e.totalCost, 0);

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
        <h3 className="font-semibold text-[var(--navy)] mb-4 flex items-center gap-2">
          <Fuel className="h-5 w-5 text-[#F7931E]" />
          Add Diesel Expense
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label>Date</Label>
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label>Liters</Label>
            <Input type="number" value={form.liters || ""} onChange={(e) => setForm({ ...form, liters: Number(e.target.value) })} className="mt-1" />
          </div>
          <div>
            <Label>Price per Liter (₹)</Label>
            <Input type="number" value={form.pricePerLiter || ""} onChange={(e) => setForm({ ...form, pricePerLiter: Number(e.target.value) })} className="mt-1" />
          </div>
          <div>
            <Label>Shift</Label>
            <Select value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value as ShiftCategory })} className="mt-1">
              <option value="day">Day</option>
              <option value="night">Night</option>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Purpose / Note</Label>
            <Input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className="mt-1" />
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-400">
          Total: {formatCurrency(form.liters * form.pricePerLiter)}
        </p>
        <Button className="mt-4" onClick={addEntry} disabled={saving || !form.liters}>
          <Plus className="h-4 w-4" />
          Add Entry
        </Button>
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
            { key: "liters", header: "Liters", render: (e) => e.liters },
            { key: "rate", header: "Rate", render: (e) => formatCurrency(e.pricePerLiter) },
            { key: "total", header: "Total", render: (e) => formatCurrency(e.totalCost) },
            { key: "shift", header: "Shift", render: (e) => <span className="capitalize">{e.shift}</span> },
            { key: "purpose", header: "Purpose", render: (e) => e.purpose },
            {
              key: "del",
              header: "",
              render: (e) => (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => save(expenses.filter((x) => x.id !== e.id))}
                >
                  Remove
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </AdminShell>
  );
}
