"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { BallQualitySelect } from "@/components/admin/BallQualitySelect";
import { EntryActions } from "@/components/admin/EntryActions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { getAvailableBalls, normalizeBallQuality } from "@/lib/ball-stock";
import { getBallStock } from "@/lib/finance";
import { getQualityLabel } from "@/lib/qualities";
import { formatCurrency } from "@/lib/utils";
import type { AppStore, BallPurchase, BallQuality, BallUsage } from "@/lib/types";
import { Package, ArrowDown, ArrowUp, Loader2, Save, Search } from "lucide-react";

const emptyPurchase = () => ({
  quality: "" as BallQuality,
  quantity: 0,
  purchasePrice: 0,
  date: new Date().toISOString().split("T")[0],
  supplier: "",
  notes: "",
});

const emptyUsage = () => ({
  matchName: "",
  quality: "" as BallQuality,
  quantity: 0,
  date: new Date().toISOString().split("T")[0],
  notes: "",
});

export default function AdminInventoryPage() {
  const { toast } = useToast();
  const [store, setStore] = useState<AppStore | null>(null);
  const [purchases, setPurchases] = useState<BallPurchase[]>([]);
  const [usage, setUsage] = useState<BallUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showPurchase, setShowPurchase] = useState(false);
  const [showUsage, setShowUsage] = useState(false);
  const [editingPurchaseId, setEditingPurchaseId] = useState<string | null>(null);
  const [editingUsageId, setEditingUsageId] = useState<string | null>(null);
  const [purchaseForm, setPurchaseForm] = useState(emptyPurchase);
  const [pricePerBall, setPricePerBall] = useState(0);
  const [usageForm, setUsageForm] = useState(emptyUsage);

  const load = () => {
    fetchAdminStore().then(({ store: s }) => {
      setStore(s);
      setPurchases(s.ballPurchases);
      setUsage(s.ballUsage);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (section: "ballPurchases" | "ballUsage", data: BallPurchase[] | BallUsage[]) => {
    try {
      const { store: updated } = await patchAdmin(section, data);
      setStore(updated);
      setPurchases(updated.ballPurchases);
      setUsage(updated.ballUsage);
      toast("Saved", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    }
  };

  const q = search.trim().toLowerCase();
  const filteredPurchases = useMemo(() => {
    if (!q) return purchases;
    return purchases.filter(
      (p) =>
        p.supplier.toLowerCase().includes(q) ||
        p.date.includes(q) ||
        (store ? getQualityLabel(store, p.quality) : p.quality).toLowerCase().includes(q) ||
        String(p.purchasePrice).includes(q) ||
        (p.notes ?? "").toLowerCase().includes(q)
    );
  }, [purchases, q, store]);

  const filteredUsage = useMemo(() => {
    if (!q) return usage;
    return usage.filter(
      (u) =>
        u.matchName.toLowerCase().includes(q) ||
        u.date.includes(q) ||
        (store ? getQualityLabel(store, u.quality) : u.quality).toLowerCase().includes(q) ||
        (u.notes ?? "").toLowerCase().includes(q)
    );
  }, [usage, q, store]);

  const savePurchase = () => {
    const quality = normalizeBallQuality(purchaseForm.quality);
    if (!quality || !purchaseForm.quantity || !purchaseForm.supplier) {
      toast("Fill quality name, quantity and supplier", "error");
      return;
    }
    const totalCost = purchaseForm.quantity * pricePerBall;
    if (!pricePerBall) {
      toast("Enter price per ball", "error");
      return;
    }
    const payload = { ...purchaseForm, quality, purchasePrice: totalCost };
    if (editingPurchaseId) {
      const next = purchases.map((p) =>
        p.id === editingPurchaseId ? { ...p, ...payload } : p
      );
      save("ballPurchases", next);
      setEditingPurchaseId(null);
    } else {
      const entry: BallPurchase = {
        id: `BP-${Date.now().toString(36).toUpperCase()}`,
        ...payload,
      };
      save("ballPurchases", [entry, ...purchases]);
    }
    setShowPurchase(false);
    setPurchaseForm(emptyPurchase());
    setPricePerBall(0);
  };

  const saveUsageEntry = () => {
    if (!store) return;
    const quality = normalizeBallQuality(usageForm.quality);
    if (!quality || !usageForm.matchName || !usageForm.quantity) {
      toast("Fill quality name, match name and quantity", "error");
      return;
    }
    const available = getAvailableBalls(store, quality, undefined, editingUsageId ?? undefined);
    if (available < usageForm.quantity) {
      toast(`Insufficient "${quality}" stock`, "error");
      return;
    }
    const payload = { ...usageForm, quality };
    if (editingUsageId) {
      const next = usage.map((u) =>
        u.id === editingUsageId ? { ...u, ...payload } : u
      );
      save("ballUsage", next);
      setEditingUsageId(null);
    } else {
      const entry: BallUsage = {
        id: `BU-${Date.now().toString(36).toUpperCase()}`,
        ...payload,
      };
      save("ballUsage", [entry, ...usage]);
    }
    setShowUsage(false);
    setUsageForm(emptyUsage());
  };

  const startEditPurchase = (p: BallPurchase) => {
    setEditingPurchaseId(p.id);
    setPurchaseForm({
      quality: p.quality,
      quantity: p.quantity,
      purchasePrice: p.purchasePrice,
      date: p.date,
      supplier: p.supplier,
      notes: p.notes ?? "",
    });
    setPricePerBall(p.quantity > 0 ? Math.round(p.purchasePrice / p.quantity) : 0);
    setShowPurchase(true);
    setShowUsage(false);
  };

  const startEditUsage = (u: BallUsage) => {
    if (u.bookingId) {
      toast("Edit balls from Bookings page for this match", "error");
      return;
    }
    setEditingUsageId(u.id);
    setUsageForm({
      matchName: u.matchName,
      quality: u.quality,
      quantity: u.quantity,
      date: u.date,
      notes: u.notes ?? "",
    });
    setShowUsage(true);
    setShowPurchase(false);
  };

  const deletePurchase = (id: string) => {
    if (!confirm("Delete this purchase entry?")) return;
    save("ballPurchases", purchases.filter((p) => p.id !== id));
  };

  const deleteUsage = (id: string) => {
    const entry = usage.find((u) => u.id === id);
    if (entry?.bookingId) {
      toast("Edit balls from Bookings page for this match", "error");
      return;
    }
    if (!confirm("Delete this usage entry?")) return;
    save("ballUsage", usage.filter((u) => u.id !== id));
  };

  const stock = store ? getBallStock(store) : [];
  const totalRemaining = stock.reduce((s, b) => s + b.remaining, 0);
  const availableUsage = store
    ? getAvailableBalls(store, usageForm.quality, undefined, editingUsageId ?? undefined)
    : 0;

  if (loading) {
    return (
      <AdminShell title="Ball Stock">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Ball Stock Management">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <p className="text-[var(--text-muted)]">
          Total available: <strong className="text-[var(--navy)]">{totalRemaining}</strong> balls
        </p>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stock, supplier, match…"
            className="pl-9"
          />
        </div>
      </div>

      <p className="text-sm text-slate-600 mb-6">
        Type ball quality as free text when adding stock or assigning balls (e.g. Tonk, Practice, Match).
        Use the same spelling each time so stock counts match.
      </p>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {stock.map((item) => (
          <Card key={item.quality} hover>
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-8 w-8 text-[#F7931E]" />
              <p className="font-semibold text-[var(--navy)]">{item.label}</p>
            </div>
            <div className="text-3xl font-bold gradient-text font-[family-name:var(--font-sora)]">{item.remaining}</div>
            <p className="text-xs text-slate-500 mt-1">available in stock</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg admin-subtle">
                <span className="text-slate-500 flex items-center gap-1">
                  <ArrowDown className="h-3 w-3 text-[#39B54A]" /> Purchased
                </span>
                <span className="font-semibold text-[var(--navy)]">{item.purchased}</span>
              </div>
              <div className="p-2 rounded-lg admin-subtle">
                <span className="text-slate-500 flex items-center gap-1">
                  <ArrowUp className="h-3 w-3 text-[#ED1C24]" /> Used
                </span>
                <span className="font-semibold text-[var(--navy)]">{item.used}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          size="sm"
          onClick={() => {
            setEditingPurchaseId(null);
            setPurchaseForm(emptyPurchase());
            setShowPurchase(!showPurchase);
            setShowUsage(false);
          }}
          className="min-h-[44px]"
        >
          + Add Purchase
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setEditingUsageId(null);
            setUsageForm(emptyUsage());
            setShowUsage(!showUsage);
            setShowPurchase(false);
          }}
          className="min-h-[44px]"
        >
          + Other match (no booking)
        </Button>
      </div>

      {showPurchase && store && (
        <Card className="mb-6 space-y-3">
          <h3 className="font-semibold text-[var(--navy)]">
            {editingPurchaseId ? "Edit Purchase" : "New Purchase Entry"}
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Ball quality (type name)</Label>
              <BallQualitySelect
                store={store}
                value={purchaseForm.quality}
                onChange={(quality) => setPurchaseForm({ ...purchaseForm, quality })}
                className="mt-1"
                placeholder="e.g. Tonk, Practice"
              />
            </div>
            <div>
              <Label>Supplier / Source</Label>
              <Input value={purchaseForm.supplier} onChange={(e) => setPurchaseForm({ ...purchaseForm, supplier: e.target.value })} />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input type="number" value={purchaseForm.quantity || ""} onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Price per ball (₹)</Label>
              <Input
                type="number"
                min={0}
                value={pricePerBall || ""}
                onChange={(e) => setPricePerBall(Number(e.target.value))}
                placeholder="e.g. 400"
              />
              {purchaseForm.quantity > 0 && pricePerBall > 0 && (
                <p className="text-xs text-green-700 font-semibold mt-1">
                  Total cost: {formatCurrency(purchaseForm.quantity * pricePerBall)} (
                  {purchaseForm.quantity} × ₹{pricePerBall})
                </p>
              )}
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={purchaseForm.date} onChange={(e) => setPurchaseForm({ ...purchaseForm, date: e.target.value })} />
            </div>
            <div>
              <Label>Notes</Label>
              <Input value={purchaseForm.notes} onChange={(e) => setPurchaseForm({ ...purchaseForm, notes: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={savePurchase}>
              <Save className="h-4 w-4" /> {editingPurchaseId ? "Update" : "Save"} Purchase
            </Button>
            <Button variant="ghost" onClick={() => { setShowPurchase(false); setEditingPurchaseId(null); }}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {showUsage && store && (
        <Card className="mb-6 space-y-3">
          <h3 className="font-semibold text-[var(--navy)]">
            {editingUsageId ? "Edit Usage" : "Other match — not from website booking"}
          </h3>
          <p className="text-xs text-slate-500">
            Use Bookings page to assign balls when approving a slot. Use this for extra practice or events without a booking.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Match / Session Name</Label>
              <Input value={usageForm.matchName} onChange={(e) => setUsageForm({ ...usageForm, matchName: e.target.value })} placeholder="Lions vs Tigers" />
            </div>
            <div>
              <Label>Ball quality (type name)</Label>
              <BallQualitySelect
                store={store}
                value={usageForm.quality}
                onChange={(quality) => setUsageForm({ ...usageForm, quality })}
                excludeUsageId={editingUsageId ?? undefined}
                placeholder="e.g. Tonk, Match ball"
              />
            </div>
            <div>
              <Label>Quantity Used</Label>
              <Input
                type="number"
                min={0}
                max={availableUsage || undefined}
                value={usageForm.quantity || ""}
                onChange={(e) =>
                  setUsageForm({
                    ...usageForm,
                    quantity: Math.min(Number(e.target.value), availableUsage),
                  })
                }
              />
              <p className="text-xs text-slate-500 mt-1">{availableUsage} available</p>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={usageForm.date} onChange={(e) => setUsageForm({ ...usageForm, date: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Notes</Label>
              <Input value={usageForm.notes} onChange={(e) => setUsageForm({ ...usageForm, notes: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={saveUsageEntry}>
              <Save className="h-4 w-4" /> {editingUsageId ? "Update" : "Record"} Usage
            </Button>
            <Button variant="ghost" onClick={() => { setShowUsage(false); setEditingUsageId(null); }}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-[var(--navy)] mb-4">Purchase History</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto text-sm">
            {filteredPurchases.length === 0 ? (
              <p className="text-center text-slate-500 py-6">No purchases found</p>
            ) : (
              filteredPurchases.map((p) => (
                <div key={p.id} className="flex items-start justify-between gap-2 p-3 rounded-lg admin-subtle">
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--navy)]">
                      {store ? getQualityLabel(store, p.quality) : p.quality} × {p.quantity}
                    </p>
                    <p className="text-xs text-slate-500">
                      {p.date} · {p.supplier} · {formatCurrency(p.purchasePrice)} total
                      {p.quantity > 0
                        ? ` (${p.quantity} @ ₹${Math.round(p.purchasePrice / p.quantity)}/ball)`
                        : ""}
                      {p.notes ? ` · ${p.notes}` : ""}
                    </p>
                  </div>
                  <EntryActions onEdit={() => startEditPurchase(p)} onDelete={() => deletePurchase(p.id)} />
                </div>
              ))
            )}
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold text-[var(--navy)] mb-4">Usage History</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto text-sm">
            {filteredUsage.length === 0 ? (
              <p className="text-center text-slate-500 py-6">No usage records found</p>
            ) : (
              filteredUsage.map((u) => (
                <div key={u.id} className="flex items-start justify-between gap-2 p-3 rounded-lg admin-subtle">
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--navy)]">
                      {u.matchName} — {store ? getQualityLabel(store, u.quality) : u.quality} × {u.quantity}
                    </p>
                    <p className="text-xs text-slate-500">
                      {u.date}
                      {u.bookingId && " · From booking"}
                      {u.notes && ` · ${u.notes}`}
                    </p>
                  </div>
                  <EntryActions onEdit={() => startEditUsage(u)} onDelete={() => deleteUsage(u.id)} />
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
