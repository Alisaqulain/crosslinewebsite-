"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { EntryActions } from "@/components/admin/EntryActions";
import { StatCard } from "@/components/admin/StatCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { ResponsiveTable } from "@/components/admin/ResponsiveTable";
import { fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type {
  FinanceEntry,
  TransactionCategory,
  TransactionType,
  ShiftCategory,
} from "@/lib/types";
import { getFinanceSummary } from "@/lib/finance";
import { IndianRupee, TrendingDown, TrendingUp, Loader2, Plus, Sun, Moon } from "lucide-react";

export default function AdminFinancePage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [store, setStore] = useState<Awaited<ReturnType<typeof fetchAdminStore>>["store"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "income" as TransactionType,
    category: "other" as TransactionCategory,
    shift: "day" as ShiftCategory,
    amount: 0,
    note: "",
  });

  useEffect(() => {
    fetchAdminStore().then((data) => {
      setStore(data.store);
      setEntries(data.store.financeEntries);
      setLoading(false);
    });
  }, []);

  const summary = store ? getFinanceSummary(store) : null;

  const saveEntries = async (next: FinanceEntry[]) => {
    try {
      const { store: updated } = await patchAdmin("financeEntries", next);
      setStore(updated);
      setEntries(updated.financeEntries);
      toast("Saved", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const addOrUpdateEntry = async () => {
    if (!form.amount) return;
    if (editingId) {
      const next = entries.map((e) =>
        e.id === editingId ? { ...e, ...form } : e
      );
      await saveEntries(next);
      setEditingId(null);
    } else {
      const entry: FinanceEntry = {
        id: `FE-${Date.now().toString(36).toUpperCase()}`,
        ...form,
      };
      await saveEntries([entry, ...entries]);
    }
    setForm({ ...form, amount: 0, note: "" });
  };

  const startEdit = (e: FinanceEntry) => {
    setEditingId(e.id);
    setForm({
      date: e.date,
      type: e.type,
      category: e.category,
      shift: e.shift,
      amount: e.amount,
      note: e.note,
    });
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    await saveEntries(entries.filter((e) => e.id !== id));
  };

  if (loading || !summary) {
    return (
      <AdminShell title="Income & Expense">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Income & Expense Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatCard label="Total Income" value={formatCurrency(summary.totalIncome)} icon={TrendingUp} color="#39B54A" />
        <StatCard label="Total Expense" value={formatCurrency(summary.totalExpense)} icon={TrendingDown} color="#ED1C24" />
        <StatCard label="Net Profit/Loss" value={formatCurrency(summary.netProfit)} icon={IndianRupee} color="#F7931E" />
        <StatCard label="Today's Income" value={formatCurrency(summary.todayIncome)} icon={IndianRupee} color="#FBB03B" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Card className="!p-5 border-l-4 border-l-amber-400">
          <div className="flex items-center gap-2 mb-2">
            <Sun className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold text-[var(--navy)]">Day Shift — Profit / Loss</h3>
          </div>
          <p className={`text-2xl font-bold ${summary.dayNetProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(summary.dayNetProfit)}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Income {formatCurrency(summary.dayIncome)} · Expense {formatCurrency(summary.dayExpense)}
          </p>
        </Card>
        <Card className="!p-5 border-l-4 border-l-indigo-500">
          <div className="flex items-center gap-2 mb-2">
            <Moon className="h-5 w-5 text-indigo-500" />
            <h3 className="font-semibold text-[var(--navy)]">Night Shift — Profit / Loss</h3>
          </div>
          <p className={`text-2xl font-bold ${summary.nightNetProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(summary.nightNetProfit)}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Income {formatCurrency(summary.nightIncome)} · Expense {formatCurrency(summary.nightExpense)}
          </p>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Booking Income", value: summary.bookingIncome },
          { label: "Diesel Total", value: summary.dieselTotal },
          { label: "Ball Purchase", value: summary.ballPurchaseTotal },
          { label: "Monthly Income", value: summary.monthlyIncome },
        ].map((item) => (
          <Card key={item.label} className="!p-4">
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className="text-lg font-bold text-[var(--navy)] mt-1">{formatCurrency(item.value)}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <h3 className="font-semibold text-[var(--navy)] mb-4">
          {editingId ? "Edit Manual Entry" : "Add Manual Entry"}
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label>Date</Label>
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label>Type</Label>
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TransactionType })} className="mt-1">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </Select>
          </div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as TransactionCategory })} className="mt-1">
              <option value="booking">Booking</option>
              <option value="diesel">Diesel</option>
              <option value="ball_purchase">Ball Purchase</option>
              <option value="maintenance">Maintenance</option>
              <option value="other">Other</option>
            </Select>
          </div>
          <div>
            <Label>Shift</Label>
            <Select value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value as ShiftCategory })} className="mt-1">
              <option value="day">Day</option>
              <option value="night">Night</option>
            </Select>
          </div>
          <div>
            <Label>Amount (₹)</Label>
            <Input type="number" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="mt-1" />
          </div>
          <div>
            <Label>Note</Label>
            <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="mt-1" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={addOrUpdateEntry}>
            <Plus className="h-4 w-4" />
            {editingId ? "Update Entry" : "Add Entry"}
          </Button>
          {editingId && (
            <Button variant="ghost" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
          )}
        </div>
      </Card>

      <Card className="p-0 md:p-6 mb-6">
        <h3 className="font-semibold text-[var(--navy)] mb-4 px-4 md:px-0 pt-4 md:pt-0">Manual Finance Entries</h3>
        <ResponsiveTable
          data={entries}
          rowKey={(e) => e.id}
          emptyMessage="No manual entries"
          columns={[
            { key: "date", header: "Date", render: (e) => formatDate(e.date) },
            { key: "type", header: "Type", render: (e) => <span className="capitalize">{e.type}</span> },
            { key: "shift", header: "Shift", render: (e) => <span className="capitalize">{e.shift}</span> },
            { key: "category", header: "Category", render: (e) => e.category.replace("_", " ") },
            {
              key: "amount",
              header: "Amount",
              render: (e) => (
                <span className={e.type === "income" ? "text-green-600" : "text-red-600"}>
                  {formatCurrency(e.amount)}
                </span>
              ),
            },
            { key: "note", header: "Note", render: (e) => e.note },
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

      <Card className="p-0 md:p-6">
        <h3 className="font-semibold text-[var(--navy)] mb-4 px-4 md:px-0 pt-4 md:pt-0">All Recent Transactions</h3>
        <ResponsiveTable
          data={summary.recentTransactions}
          rowKey={(t) => t.id}
          emptyMessage="No transactions"
          columns={[
            { key: "date", header: "Date", render: (t) => formatDate(t.date) },
            { key: "type", header: "Type", render: (t) => <span className="capitalize">{t.type}</span> },
            { key: "shift", header: "Shift", render: (t) => <span className="capitalize">{t.shift}</span> },
            { key: "category", header: "Category", render: (t) => t.category.replace("_", " ") },
            {
              key: "amount",
              header: "Amount",
              render: (t) => (
                <span className={t.type === "income" ? "text-green-600" : "text-red-600"}>
                  {formatCurrency(t.amount)}
                </span>
              ),
            },
            { key: "note", header: "Note", render: (t) => t.note },
          ]}
        />
      </Card>
    </AdminShell>
  );
}
