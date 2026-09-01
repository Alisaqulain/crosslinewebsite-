"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { AdminCollapsibleForm } from "@/components/admin/AdminCollapsibleForm";
import { BallQualitySelect } from "@/components/admin/BallQualitySelect";
import { BallStockBar, BallStockTable } from "@/components/admin/BallStockBar";
import { EntryKindSelect, isOldEntryId, type EntryKind } from "@/components/admin/EntryKindSelect";
import { SessionOwnerSelect } from "@/components/admin/SessionOwnerSelect";
import { defaultOwnerId, useSessionOwnerLock } from "@/hooks/useSessionOwnerLock";
import { EntryActions } from "@/components/admin/EntryActions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AmountInput, parseAmount } from "@/components/ui/AmountInput";
import { Input, Label } from "@/components/ui/Input";
import { ResponsiveTable } from "@/components/admin/ResponsiveTable";
import { fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { getAvailableBalls } from "@/lib/ball-stock";
import { getOwnerName } from "@/lib/owners";
import { getQualityLabel } from "@/lib/qualities";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AppStore, OtherIncome, ShiftCategory, StadiumOwner } from "@/lib/types";
import { Loader2, Save } from "lucide-react";

const OTHER_CATEGORIES = [
  "Sponsorship",
  "Drinks / snacks",
  "Food / canteen",
  "Equipment rent",
  "Parking",
  "Academy fees",
  "Tournament fees",
  "Coaching",
  "Net rent",
  "Misc income",
  "Other",
];

type IncomeRow = OtherIncome & { entryKind: EntryKind };

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

const emptyOtherForm = () => ({
  date: new Date().toISOString().split("T")[0],
  title: "",
  amount: "" as string | number,
  category: OTHER_CATEGORIES[0],
  shift: "day" as ShiftCategory,
  note: "",
  ownerId: "",
  entryKind: "current" as EntryKind,
});

function ballSaleTotal(pricePerBall: number, qty: number) {
  return pricePerBall * qty;
}

function ballPricePerUnit(e: OtherIncome): number {
  if (e.pricePerBall && e.pricePerBall > 0) return e.pricePerBall;
  if (e.ballsSold && e.ballsSold > 0) return Math.round(e.amount / e.ballsSold);
  return e.amount;
}

export default function AdminOtherIncomePage() {
  const { toast } = useToast();
  const [store, setStore] = useState<AppStore | null>(null);
  const [owners, setOwners] = useState<StadiumOwner[]>([]);
  const [currentIncomes, setCurrentIncomes] = useState<OtherIncome[]>([]);
  const [oldIncomes, setOldIncomes] = useState<OtherIncome[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingBallId, setEditingBallId] = useState<string | null>(null);
  const [editingOtherId, setEditingOtherId] = useState<string | null>(null);
  const [showBallForm, setShowBallForm] = useState(false);
  const [showOtherForm, setShowOtherForm] = useState(false);
  const [ballForm, setBallForm] = useState(emptyBallForm);
  const [otherForm, setOtherForm] = useState(emptyOtherForm);
  const { lockedOwnerId, lockedOwnerName } = useSessionOwnerLock();

  useEffect(() => {
    fetchAdminStore().then(({ store: s }) => {
      setStore(s);
      setOwners(s.owners ?? []);
      setCurrentIncomes(s.otherIncomes ?? []);
      setOldIncomes(s.oldIncomes ?? []);
      setLoading(false);
    });
  }, []);

  const allIncomes = useMemo<IncomeRow[]>(
    () =>
      [
        ...currentIncomes.map((e) => ({ ...e, entryKind: "current" as const })),
        ...oldIncomes.map((e) => ({ ...e, entryKind: "old" as const })),
      ].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)),
    [currentIncomes, oldIncomes]
  );

  const total = allIncomes.reduce((s, e) => s + e.amount, 0);

  const persist = async (current: OtherIncome[], old: OtherIncome[]) => {
    setSaving(true);
    try {
      const { store: afterCurrent } = await patchAdmin("otherIncomes", current);
      const { store: updated } = await patchAdmin("oldIncomes", old);
      setStore(updated ?? afterCurrent);
      setCurrentIncomes(updated?.otherIncomes ?? afterCurrent.otherIncomes ?? current);
      setOldIncomes(updated?.oldIncomes ?? old);
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
    if (!(ballForm.ownerId || lockedOwnerId) && !owners[0]?.id) {
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

    const row: OtherIncome = {
      id: editingBallId ?? `OI-${Date.now().toString(36).toUpperCase()}`,
      date: ballForm.date,
      title,
      amount: ballSaleTotal(pricePerBall, ballForm.ballsSold),
      category: "Ball sale",
      shift: ballForm.shift,
      note: ballForm.note || undefined,
      ownerId: defaultOwnerId(lockedOwnerId, ballForm.ownerId, owners),
      ballQuality: ballForm.ballQuality,
      ballsSold: ballForm.ballsSold,
      pricePerBall,
    };

    const next = editingBallId
      ? currentIncomes.map((e) => (e.id === editingBallId ? row : e))
      : [row, ...currentIncomes];

    persist(next, oldIncomes);
    setEditingBallId(null);
    setShowBallForm(false);
    setBallForm(emptyBallForm());
  };

  const submitOtherIncome = () => {
    const amount = parseAmount(otherForm.amount);
    if (!otherForm.title.trim() || !amount || amount <= 0) {
      toast("Description and amount are required", "error");
      return;
    }
    if (!(otherForm.ownerId || lockedOwnerId) && !owners[0]?.id) {
      toast("Select who received this income", "error");
      return;
    }

    const row: OtherIncome = {
      id:
        editingOtherId ??
        `${otherForm.entryKind === "old" ? "OLD-I" : "OI"}-${Date.now().toString(36).toUpperCase()}`,
      date: otherForm.date,
      title: otherForm.title.trim(),
      amount,
      category: otherForm.category,
      shift: otherForm.shift,
      note: otherForm.note || undefined,
      ownerId: defaultOwnerId(lockedOwnerId, otherForm.ownerId, owners),
    };

    let nextCurrent = [...currentIncomes];
    let nextOld = [...oldIncomes];

    if (editingOtherId) {
      if (isOldEntryId(editingOtherId)) nextOld = nextOld.filter((e) => e.id !== editingOtherId);
      else nextCurrent = nextCurrent.filter((e) => e.id !== editingOtherId);
    }

    if (otherForm.entryKind === "old") nextOld = [row, ...nextOld];
    else nextCurrent = [row, ...nextCurrent];

    persist(nextCurrent, nextOld);
    setEditingOtherId(null);
    setShowOtherForm(false);
    setOtherForm(emptyOtherForm());
  };

  const startEditBall = (e: IncomeRow) => {
    if (e.entryKind === "old" || e.category !== "Ball sale") return;
    setShowBallForm(true);
    setShowOtherForm(false);
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

  const startEditOther = (e: IncomeRow) => {
    if (e.category === "Ball sale") {
      startEditBall(e);
      return;
    }
    setShowOtherForm(true);
    setShowBallForm(false);
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
      entryKind: e.entryKind,
    });
  };

  const deleteEntry = (e: IncomeRow) => {
    if (!confirm("Delete this entry?")) return;
    if (e.entryKind === "old") {
      persist(currentIncomes, oldIncomes.filter((x) => x.id !== e.id));
    } else {
      persist(
        currentIncomes.filter((x) => x.id !== e.id),
        oldIncomes
      );
    }
    if (editingBallId === e.id) {
      setEditingBallId(null);
      setBallForm(emptyBallForm());
    }
    if (editingOtherId === e.id) {
      setEditingOtherId(null);
      setOtherForm(emptyOtherForm());
    }
  };

  if (loading) {
    return (
      <AdminShell title="Other income">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Other income">
      <p className="admin-page-intro">
        Ball sales and other income in one place. Use &quot;Old&quot; for income recorded before this
        system (does not change ball stock).
      </p>

      <Card className="!p-4 mb-6 max-w-sm">
        <p className="text-xs text-slate-500">Total income</p>
        <p className="text-xl font-bold text-green-700">{formatCurrency(total)}</p>
        <p className="text-xs text-slate-500 mt-1">{allIncomes.length} entries</p>
      </Card>

      <AdminCollapsibleForm
        open={showBallForm || !!editingBallId}
        onOpenChange={(open) => {
          setShowBallForm(open);
          if (open) setShowOtherForm(false);
        }}
        title="Sell ball"
        addLabel="Sell ball"
        editing={!!editingBallId}
      >
        {store && (
          <div className="mb-4">
            <BallStockBar store={store} />
            <BallStockTable store={store} />
          </div>
        )}
        <div className="admin-form-grid">
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
            {store && (
              <BallQualitySelect
                store={store}
                value={ballForm.ballQuality}
                onChange={(ballQuality) => setBallForm({ ...ballForm, ballQuality })}
                excludeOtherIncomeId={editingBallId ?? undefined}
                label="Ball type (from stock)"
                className="mt-1"
              />
            )}
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
          </div>
          <SessionOwnerSelect
            owners={owners}
            value={lockedOwnerId ?? ballForm.ownerId}
            onChange={(ownerId) => setBallForm({ ...ballForm, ownerId })}
            lockedOwnerId={lockedOwnerId}
            lockedOwnerName={lockedOwnerName}
            label="Received by"
            required
          />
          <div className="sm:col-span-2">
            <Label>Note (optional)</Label>
            <Input
              value={ballForm.note}
              onChange={(e) => setBallForm({ ...ballForm, note: e.target.value })}
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
                setShowBallForm(false);
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </AdminCollapsibleForm>

      <AdminCollapsibleForm
        open={showOtherForm || !!editingOtherId}
        onOpenChange={(open) => {
          setShowOtherForm(open);
          if (open) setShowBallForm(false);
        }}
        title="Other income"
        addLabel="Add other income"
        editing={!!editingOtherId}
      >
        <div className="admin-form-grid">
          <EntryKindSelect
            value={otherForm.entryKind}
            onChange={(entryKind) => setOtherForm({ ...otherForm, entryKind })}
          />
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
            <Input
              list="other-income-categories"
              value={otherForm.category}
              onChange={(e) => setOtherForm({ ...otherForm, category: e.target.value })}
              placeholder="Pick or type any source"
              className="mt-1"
            />
            <datalist id="other-income-categories">
              {OTHER_CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div className="sm:col-span-2">
            <Label>Description</Label>
            <Input
              value={otherForm.title}
              onChange={(e) => setOtherForm({ ...otherForm, title: e.target.value })}
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
          <SessionOwnerSelect
            owners={owners}
            value={lockedOwnerId ?? otherForm.ownerId}
            onChange={(ownerId) => setOtherForm({ ...otherForm, ownerId })}
            lockedOwnerId={lockedOwnerId}
            lockedOwnerName={lockedOwnerName}
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
          <Button onClick={submitOtherIncome} disabled={saving || !parseAmount(otherForm.amount)}>
            <Save className="h-4 w-4" />
            {editingOtherId ? "Update" : "Save"} income
          </Button>
          {editingOtherId && (
            <Button
              variant="ghost"
              onClick={() => {
                setEditingOtherId(null);
                setOtherForm(emptyOtherForm());
                setShowOtherForm(false);
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </AdminCollapsibleForm>

      <Card className="p-0 md:p-6 mt-2">
        <ResponsiveTable
          data={allIncomes}
          rowKey={(e) => e.id}
          emptyMessage="No income entries yet"
          columns={[
            { key: "date", header: "Date", render: (e) => formatDate(e.date) },
            {
              key: "title",
              header: "Description",
              render: (e) => (
                <div>
                  <p className="font-medium text-[var(--navy)]">{e.title}</p>
                  <p className="text-xs text-slate-500">
                    {e.category === "Ball sale" ? "Ball sale" : e.category}
                    {e.entryKind === "old" ? " · Old" : ""}
                  </p>
                  {e.category === "Ball sale" && e.ballsSold && (
                    <p className="text-xs text-amber-700">
                      {e.ballsSold} ×{" "}
                      {store ? getQualityLabel(store, e.ballQuality ?? "") : e.ballQuality}
                    </p>
                  )}
                  {store && e.ownerId && (
                    <p className="text-xs text-green-700">{getOwnerName(store, e.ownerId)}</p>
                  )}
                </div>
              ),
            },
            { key: "amount", header: "Amount", render: (e) => formatCurrency(e.amount) },
            {
              key: "actions",
              header: "",
              render: (e) => (
                <EntryActions
                  onEdit={() =>
                    e.category === "Ball sale" ? startEditBall(e) : startEditOther(e)
                  }
                  onDelete={() => deleteEntry(e)}
                />
              ),
            },
          ]}
        />
      </Card>
    </AdminShell>
  );
}
