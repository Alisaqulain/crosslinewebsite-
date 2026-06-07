"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { BallStockBar, BallStockTable } from "@/components/admin/BallStockBar";
import { OwnerSelect } from "@/components/admin/OwnerSelect";
import { EntryActions } from "@/components/admin/EntryActions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AmountInput, parseAmount } from "@/components/ui/AmountInput";
import { Input, Label, Select } from "@/components/ui/Input";
import { ResponsiveTable } from "@/components/admin/ResponsiveTable";
import { fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { getAvailableBalls } from "@/lib/ball-stock";
import { getBallStock } from "@/lib/finance";
import { getOwnerName } from "@/lib/owners";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AppStore, OtherIncome, ShiftCategory, StadiumOwner } from "@/lib/types";
import { Loader2, Package, Save, TrendingUp } from "lucide-react";

const OTHER_CATEGORIES = [
  "Sponsorship",
  "Equipment rent",
  "Academy fees",
  "Tournament fees",
  "Misc income",
  "Other",
];

const emptyBallForm = () => ({
  date: new Date().toISOString().split("T")[0],
  title: "",
  pricePerBall: "" as string | number,
  shift: "day" as ShiftCategory,
  note: "",
  ownerId: "",
  ballQuality: "",
  ballsSold: 0,
});

function ballSaleTotal(pricePerBall: number, qty: number) {
  return pricePerBall * qty;
}

function ballPricePerUnit(e: OtherIncome): number {
  if (e.pricePerBall && e.pricePerBall > 0) return e.pricePerBall;
  if (e.ballsSold && e.ballsSold > 0) return Math.round(e.amount / e.ballsSold);
  return e.amount;
}

const emptyOtherForm = () => ({
  date: new Date().toISOString().split("T")[0],
  title: "",
  amount: "" as string | number,
  category: OTHER_CATEGORIES[0],
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
  const [editingBallId, setEditingBallId] = useState<string | null>(null);
  const [editingOtherId, setEditingOtherId] = useState<string | null>(null);
  const [ballForm, setBallForm] = useState(emptyBallForm);
  const [otherForm, setOtherForm] = useState(emptyOtherForm);

  useEffect(() => {
    fetchAdminStore().then(({ store: s }) => {
      setStore(s);
      setOwners(s.owners ?? []);
      setIncomes(s.otherIncomes ?? []);
      setLoading(false);
    });
  }, []);

  const ballSales = useMemo(
    () => incomes.filter((e) => e.category === "Ball sale"),
    [incomes]
  );
  const otherIncomes = useMemo(
    () => incomes.filter((e) => e.category !== "Ball sale"),
    [incomes]
  );

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

  const submitBallSale = () => {
    const pricePerBall = parseAmount(ballForm.pricePerBall);
    if (!ballForm.ballQuality) {
      toast("Select ball type from stock", "error");
      return;
    }
    if (!ballForm.ballsSold || ballForm.ballsSold < 1) {
      toast("Enter how many balls were sold", "error");
      return;
    }
    if (!pricePerBall || pricePerBall <= 0) {
      toast("Enter price per ball", "error");
      return;
    }
    if (!ballForm.ownerId && !owners[0]?.id) {
      toast("Select who received the money", "error");
      return;
    }
    if (store) {
      const available = getAvailableBalls(
        store,
        ballForm.ballQuality,
        undefined,
        undefined,
        editingBallId ?? undefined
      );
      if (ballForm.ballsSold > available) {
        toast(`Only ${available} available for this ball type`, "error");
        return;
      }
    }

    const title =
      ballForm.title.trim() ||
      `Sold ${ballForm.ballsSold} × ${ballForm.ballQuality}`;

    const totalAmount = ballSaleTotal(pricePerBall, ballForm.ballsSold);

    const payload: Omit<OtherIncome, "id"> = {
      date: ballForm.date,
      title,
      amount: totalAmount,
      category: "Ball sale",
      shift: ballForm.shift,
      note: ballForm.note || undefined,
      ownerId: ballForm.ownerId || owners[0]?.id || "",
      ballQuality: ballForm.ballQuality,
      ballsSold: ballForm.ballsSold,
      pricePerBall,
    };

    if (editingBallId) {
      save(incomes.map((e) => (e.id === editingBallId ? { ...e, ...payload } : e)));
      setEditingBallId(null);
    } else {
      save([{ id: `OI-${Date.now().toString(36).toUpperCase()}`, ...payload }, ...incomes]);
    }
    setBallForm(emptyBallForm());
  };

  const submitOtherIncome = () => {
    const amount = parseAmount(otherForm.amount);
    if (!otherForm.title.trim() || !amount || amount <= 0) {
      toast("Description and amount are required", "error");
      return;
    }
    if (!otherForm.ownerId && !owners[0]?.id) {
      toast("Select who received this income", "error");
      return;
    }

    const payload: Omit<OtherIncome, "id"> = {
      date: otherForm.date,
      title: otherForm.title.trim(),
      amount,
      category: otherForm.category,
      shift: otherForm.shift,
      note: otherForm.note || undefined,
      ownerId: otherForm.ownerId || owners[0]?.id || "",
    };

    if (editingOtherId) {
      save(incomes.map((e) => (e.id === editingOtherId ? { ...e, ...payload } : e)));
      setEditingOtherId(null);
    } else {
      save([{ id: `OI-${Date.now().toString(36).toUpperCase()}`, ...payload }, ...incomes]);
    }
    setOtherForm(emptyOtherForm());
  };

  const startEditBall = (e: OtherIncome) => {
    setEditingBallId(e.id);
    setEditingOtherId(null);
    setBallForm({
      date: e.date,
      title: e.title,
      pricePerBall: ballPricePerUnit(e),
      shift: e.shift,
      note: e.note ?? "",
      ownerId: e.ownerId ?? "",
      ballQuality: e.ballQuality ?? "",
      ballsSold: e.ballsSold ?? 0,
    });
  };

  const startEditOther = (e: OtherIncome) => {
    setEditingOtherId(e.id);
    setEditingBallId(null);
    setOtherForm({
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
    if (!confirm("Delete this entry?")) return;
    save(incomes.filter((x) => x.id !== id));
    if (editingBallId === id) {
      setEditingBallId(null);
      setBallForm(emptyBallForm());
    }
    if (editingOtherId === id) {
      setEditingOtherId(null);
      setOtherForm(emptyOtherForm());
    }
  };

  const stockOptions = store
    ? getBallStockOptions(store, editingBallId)
    : [];

  if (loading) {
    return (
      <AdminShell title="Income">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Income">
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* —— Ball sale —— */}
        <Card>
          <h3 className="font-semibold text-[var(--navy)] mb-2 flex items-center gap-2">
            <Package className="h-5 w-5 text-[#F7931E]" />
            {editingBallId ? "Edit ball sale" : "Sell ball"}
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Stock is reduced automatically when you save a sale.
          </p>

          {store && (
            <>
              <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                Current stock
              </p>
              <BallStockBar store={store} />
              <BallStockTable store={store} />
            </>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={ballForm.date}
                onChange={(e) => setBallForm({ ...ballForm, date: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Ball type (from stock)</Label>
              <Select
                value={ballForm.ballQuality}
                onChange={(e) => setBallForm({ ...ballForm, ballQuality: e.target.value })}
                className="mt-1"
              >
                <option value="">— Select —</option>
                {stockOptions.map((s) => (
                  <option key={s.quality} value={s.quality}>
                    {s.label} ({s.available} available)
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Quantity sold</Label>
              <Input
                type="number"
                min={1}
                max={
                  store && ballForm.ballQuality
                    ? getAvailableBalls(
                        store,
                        ballForm.ballQuality,
                        undefined,
                        undefined,
                        editingBallId ?? undefined
                      )
                    : undefined
                }
                value={ballForm.ballsSold || ""}
                onChange={(e) =>
                  setBallForm({ ...ballForm, ballsSold: Number(e.target.value) || 0 })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Price per ball (₹)</Label>
              <AmountInput
                value={ballForm.pricePerBall}
                onChange={(pricePerBall) => setBallForm({ ...ballForm, pricePerBall })}
                className="mt-1"
              />
              {ballForm.ballsSold > 0 && parseAmount(ballForm.pricePerBall) > 0 && (
                <p className="text-xs text-green-700 mt-1 font-semibold">
                  Total received:{" "}
                  {formatCurrency(
                    ballSaleTotal(parseAmount(ballForm.pricePerBall), ballForm.ballsSold)
                  )}{" "}
                  ({ballForm.ballsSold} × {formatCurrency(parseAmount(ballForm.pricePerBall))})
                </p>
              )}
            </div>
            <OwnerSelect
              owners={owners}
              value={ballForm.ownerId}
              onChange={(ownerId) => setBallForm({ ...ballForm, ownerId })}
              label="Received by"
              required
            />
            <div className="sm:col-span-2">
              <Label>Note (optional)</Label>
              <Input
                value={ballForm.note}
                onChange={(e) => setBallForm({ ...ballForm, note: e.target.value })}
                placeholder="e.g. Sold to local team"
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={submitBallSale} disabled={saving}>
              <Save className="h-4 w-4" />
              {editingBallId ? "Update sale" : "Save sale"}
            </Button>
            {editingBallId && (
              <Button
                variant="ghost"
                onClick={() => {
                  setEditingBallId(null);
                  setBallForm(emptyBallForm());
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </Card>

        {/* —— Other income —— */}
        <Card>
          <h3 className="font-semibold text-[var(--navy)] mb-2 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            {editingOtherId ? "Edit other income" : "Other income"}
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Sponsorship, rent, fees — not ball sales or bookings.
          </p>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={otherForm.date}
                onChange={(e) => setOtherForm({ ...otherForm, date: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={otherForm.category}
                onChange={(e) => setOtherForm({ ...otherForm, category: e.target.value })}
                className="mt-1"
              >
                {OTHER_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Input
                value={otherForm.title}
                onChange={(e) => setOtherForm({ ...otherForm, title: e.target.value })}
                placeholder="e.g. Sponsor payment"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Amount (₹)</Label>
              <AmountInput
                value={otherForm.amount}
                onChange={(amount) => setOtherForm({ ...otherForm, amount })}
                className="mt-1"
              />
            </div>
            <OwnerSelect
              owners={owners}
              value={otherForm.ownerId}
              onChange={(ownerId) => setOtherForm({ ...otherForm, ownerId })}
              label="Received by"
              required
            />
            <div className="sm:col-span-2">
              <Label>Notes (optional)</Label>
              <Input
                value={otherForm.note}
                onChange={(e) => setOtherForm({ ...otherForm, note: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={submitOtherIncome} disabled={saving}>
              <Save className="h-4 w-4" />
              {editingOtherId ? "Update" : "Save"} income
            </Button>
            {editingOtherId && (
              <Button
                variant="ghost"
                onClick={() => {
                  setEditingOtherId(null);
                  setOtherForm(emptyOtherForm());
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <p className="text-sm font-semibold text-[var(--navy)] mb-3">
            Ball sales · {formatCurrency(ballSales.reduce((s, e) => s + e.amount, 0))}
          </p>
          <Card className="p-0 md:p-6">
            <ResponsiveTable
              data={ballSales}
              rowKey={(e) => e.id}
              emptyMessage="No ball sales yet"
              columns={[
                { key: "date", header: "Date", render: (e) => formatDate(e.date) },
                {
                  key: "title",
                  header: "Sale",
                  render: (e) => (
                    <div>
                      <p className="font-medium text-[var(--navy)]">{e.title}</p>
                      <p className="text-xs text-amber-700">
                        {e.ballsSold} × {e.ballQuality} @ {formatCurrency(ballPricePerUnit(e))} each
                      </p>
                      {store && e.ownerId && (
                        <p className="text-xs text-green-700">
                          {getOwnerName(store, e.ownerId)}
                        </p>
                      )}
                    </div>
                  ),
                },
                { key: "amount", header: "₹", render: (e) => formatCurrency(e.amount) },
                {
                  key: "actions",
                  header: "",
                  render: (e) => (
                    <EntryActions
                      onEdit={() => startEditBall(e)}
                      onDelete={() => deleteEntry(e.id)}
                    />
                  ),
                },
              ]}
            />
          </Card>
        </div>

        <div>
          <p className="text-sm font-semibold text-[var(--navy)] mb-3">
            Other income · {formatCurrency(otherIncomes.reduce((s, e) => s + e.amount, 0))}
          </p>
          <Card className="p-0 md:p-6">
            <ResponsiveTable
              data={otherIncomes}
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
                      <p className="text-xs text-slate-500">{e.category}</p>
                      {store && e.ownerId && (
                        <p className="text-xs text-green-700">
                          {getOwnerName(store, e.ownerId)}
                        </p>
                      )}
                    </div>
                  ),
                },
                { key: "amount", header: "₹", render: (e) => formatCurrency(e.amount) },
                {
                  key: "actions",
                  header: "",
                  render: (e) => (
                    <EntryActions
                      onEdit={() => startEditOther(e)}
                      onDelete={() => deleteEntry(e.id)}
                    />
                  ),
                },
              ]}
            />
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}

function getBallStockOptions(store: AppStore, editingId: string | null) {
  const editingQuality = editingId
    ? store.otherIncomes?.find((i) => i.id === editingId)?.ballQuality
    : undefined;
  return getBallStock(store)
    .map((s) => ({
      quality: s.quality,
      label: s.label,
      available: getAvailableBalls(store, s.quality, undefined, undefined, editingId ?? undefined),
    }))
    .filter((s) => s.available > 0 || s.quality === editingQuality);
}
