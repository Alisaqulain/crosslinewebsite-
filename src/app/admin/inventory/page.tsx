"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { getBallStock } from "@/lib/finance";
import type { AppStore, BallPurchase, BallQuality, BallUsage } from "@/lib/types";
import { BALL_QUALITY_LABELS } from "@/lib/types";
import { Package, ArrowDown, ArrowUp, Loader2, Save } from "lucide-react";

export default function AdminInventoryPage() {
  const { toast } = useToast();
  const [store, setStore] = useState<AppStore | null>(null);
  const [purchases, setPurchases] = useState<BallPurchase[]>([]);
  const [usage, setUsage] = useState<BallUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPurchase, setShowPurchase] = useState(false);
  const [showUsage, setShowUsage] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    quality: "high" as BallQuality,
    quantity: 0,
    purchasePrice: 0,
    date: new Date().toISOString().split("T")[0],
    supplier: "",
    notes: "",
  });
  const [usageForm, setUsageForm] = useState({
    matchName: "",
    quality: "high" as BallQuality,
    quantity: 0,
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

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
    } catch {
      toast("Save failed", "error");
    }
  };

  const addPurchase = () => {
    const entry: BallPurchase = {
      id: `BP-${Date.now().toString(36).toUpperCase()}`,
      ...purchaseForm,
    };
    save("ballPurchases", [entry, ...purchases]);
    setShowPurchase(false);
    setPurchaseForm({
      quality: "high",
      quantity: 0,
      purchasePrice: 0,
      date: new Date().toISOString().split("T")[0],
      supplier: "",
      notes: "",
    });
  };

  const addUsage = () => {
    if (!store) return;
    const stock = getBallStock(store);
    const item = stock.find((s) => s.quality === usageForm.quality);
    if (!item || item.remaining < usageForm.quantity) {
      toast(`Insufficient ${BALL_QUALITY_LABELS[usageForm.quality]} stock`, "error");
      return;
    }
    const entry: BallUsage = {
      id: `BU-${Date.now().toString(36).toUpperCase()}`,
      ...usageForm,
    };
    save("ballUsage", [entry, ...usage]);
    setShowUsage(false);
    setUsageForm({
      matchName: "",
      quality: "high",
      quantity: 0,
      date: new Date().toISOString().split("T")[0],
      notes: "",
    });
  };

  const stock = store ? getBallStock(store) : [];
  const totalRemaining = stock.reduce((s, b) => s + b.remaining, 0);

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
      <p className="text-slate-400 mb-6">Total balls remaining: <strong className="text-white">{totalRemaining}</strong></p>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {stock.map((item) => (
          <Card key={item.quality} hover>
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-8 w-8 text-[#F7931E]" />
              <p className="font-semibold text-white">{item.label}</p>
            </div>
            <div className="text-3xl font-bold gradient-text font-[family-name:var(--font-sora)]">{item.remaining}</div>
            <p className="text-xs text-slate-500 mt-1">remaining in stock</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-[#0b1219]">
                <span className="text-slate-500 flex items-center gap-1">
                  <ArrowDown className="h-3 w-3 text-[#39B54A]" /> Purchased
                </span>
                <span className="text-white font-medium">{item.purchased}</span>
              </div>
              <div className="p-2 rounded-lg bg-[#0b1219]">
                <span className="text-slate-500 flex items-center gap-1">
                  <ArrowUp className="h-3 w-3 text-[#ED1C24]" /> Used
                </span>
                <span className="text-white font-medium">{item.used}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Button size="sm" onClick={() => setShowPurchase(!showPurchase)} className="min-h-[44px]">
          + Add Purchase
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowUsage(!showUsage)} className="min-h-[44px]">
          + Record Match Usage
        </Button>
      </div>

      {showPurchase && (
        <Card className="mb-6 space-y-3">
          <h3 className="font-semibold text-white">New Purchase Entry</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Ball Quality</Label>
              <Select
                value={purchaseForm.quality}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, quality: e.target.value as BallQuality })}
              >
                <option value="low">Low Quality</option>
                <option value="medium">Medium Quality</option>
                <option value="high">High Quality</option>
              </Select>
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
              <Label>Purchase Price (₹)</Label>
              <Input type="number" value={purchaseForm.purchasePrice || ""} onChange={(e) => setPurchaseForm({ ...purchaseForm, purchasePrice: Number(e.target.value) })} />
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
          <Button onClick={addPurchase}>
            <Save className="h-4 w-4" /> Save Purchase
          </Button>
        </Card>
      )}

      {showUsage && (
        <Card className="mb-6 space-y-3">
          <h3 className="font-semibold text-white">Match Ball Usage</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Match Name</Label>
              <Input value={usageForm.matchName} onChange={(e) => setUsageForm({ ...usageForm, matchName: e.target.value })} placeholder="Team A vs Team B" />
            </div>
            <div>
              <Label>Ball Quality</Label>
              <Select
                value={usageForm.quality}
                onChange={(e) => setUsageForm({ ...usageForm, quality: e.target.value as BallQuality })}
              >
                <option value="low">Low Quality</option>
                <option value="medium">Medium Quality</option>
                <option value="high">High Quality</option>
              </Select>
            </div>
            <div>
              <Label>Quantity Used</Label>
              <Input type="number" value={usageForm.quantity || ""} onChange={(e) => setUsageForm({ ...usageForm, quantity: Number(e.target.value) })} />
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
          <Button onClick={addUsage}>
            <Save className="h-4 w-4" /> Record Usage
          </Button>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-white mb-4">Purchase History</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto text-sm">
            {purchases.map((p) => (
              <div key={p.id} className="p-3 rounded-lg bg-[#0b1219]">
                <p className="text-white font-medium">
                  {BALL_QUALITY_LABELS[p.quality]} × {p.quantity}
                </p>
                <p className="text-xs text-slate-500">
                  {p.date} · {p.supplier} · ₹{p.purchasePrice}
                </p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold text-white mb-4">Usage History</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto text-sm">
            {usage.map((u) => (
              <div key={u.id} className="p-3 rounded-lg bg-[#0b1219]">
                <p className="text-white font-medium">
                  {u.matchName} — {BALL_QUALITY_LABELS[u.quality]} × {u.quantity}
                </p>
                <p className="text-xs text-slate-500">
                  {u.date} {u.notes && `· ${u.notes}`}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
