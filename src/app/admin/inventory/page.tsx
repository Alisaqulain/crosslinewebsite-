"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import type { BallPurchase, BallUsage } from "@/lib/types";
import { Package, ArrowDown, ArrowUp, Loader2, Save } from "lucide-react";

function stockByType(purchases: BallPurchase[], usage: BallUsage[]) {
  const types = new Set([
    ...purchases.map((p) => p.ballType),
    ...usage.map((u) => u.ballType),
  ]);
  return Array.from(types).map((type) => {
    const purchased = purchases.filter((p) => p.ballType === type).reduce((s, p) => s + p.quantity, 0);
    const used = usage.filter((u) => u.ballType === type).reduce((s, u) => s + u.quantity, 0);
    return { type, purchased, used, current: purchased - used };
  });
}

export default function AdminInventoryPage() {
  const { toast } = useToast();
  const [purchases, setPurchases] = useState<BallPurchase[]>([]);
  const [usage, setUsage] = useState<BallUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPurchase, setShowPurchase] = useState(false);
  const [showUsage, setShowUsage] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    supplier: "",
    ballType: "",
    quantity: 0,
    purchasePrice: 0,
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [usageForm, setUsageForm] = useState({
    ballType: "",
    quantity: 0,
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const load = () => {
    fetchAdminStore().then(({ store }) => {
      setPurchases(store.ballPurchases);
      setUsage(store.ballUsage);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (section: "ballPurchases" | "ballUsage", data: BallPurchase[] | BallUsage[]) => {
    try {
      await patchAdmin(section, data);
      toast("Saved", "success");
      load();
    } catch {
      toast("Save failed", "error");
    }
  };

  const addPurchase = () => {
    const entry: BallPurchase = {
      id: `BP-${Date.now()}`,
      ...purchaseForm,
    };
    const next = [entry, ...purchases];
    setPurchases(next);
    save("ballPurchases", next);
    setShowPurchase(false);
    setPurchaseForm({ supplier: "", ballType: "", quantity: 0, purchasePrice: 0, date: new Date().toISOString().split("T")[0], notes: "" });
  };

  const addUsage = () => {
    const entry: BallUsage = {
      id: `BU-${Date.now()}`,
      ...usageForm,
    };
    const next = [entry, ...usage];
    setUsage(next);
    save("ballUsage", next);
    setShowUsage(false);
    setUsageForm({ ballType: "", quantity: 0, date: new Date().toISOString().split("T")[0], notes: "" });
  };

  const stock = stockByType(purchases, usage);

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {stock.map((item) => (
          <Card key={item.type} hover>
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-8 w-8 text-[#F7931E]" />
              <p className="font-semibold text-white">{item.type}</p>
            </div>
            <div className="text-3xl font-bold gradient-text font-[family-name:var(--font-sora)]">{item.current}</div>
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
                  <ArrowUp className="h-3 w-3 text-[#ED1C24]" /> Used/Sold
                </span>
                <span className="text-white font-medium">{item.used}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 mb-6">
        <Button size="sm" onClick={() => setShowPurchase(!showPurchase)}>+ Add Purchase</Button>
        <Button size="sm" variant="outline" onClick={() => setShowUsage(!showUsage)}>+ Add Usage/Sold</Button>
      </div>

      {showPurchase && (
        <Card className="mb-6 space-y-3">
          <h3 className="font-semibold text-white">New Purchase Entry</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>Supplier</Label><Input value={purchaseForm.supplier} onChange={(e) => setPurchaseForm({ ...purchaseForm, supplier: e.target.value })} /></div>
            <div><Label>Ball Type</Label><Input value={purchaseForm.ballType} onChange={(e) => setPurchaseForm({ ...purchaseForm, ballType: e.target.value })} /></div>
            <div><Label>Quantity</Label><Input type="number" value={purchaseForm.quantity} onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: Number(e.target.value) })} /></div>
            <div><Label>Purchase Price (₹)</Label><Input type="number" value={purchaseForm.purchasePrice} onChange={(e) => setPurchaseForm({ ...purchaseForm, purchasePrice: Number(e.target.value) })} /></div>
            <div><Label>Date</Label><Input type="date" value={purchaseForm.date} onChange={(e) => setPurchaseForm({ ...purchaseForm, date: e.target.value })} /></div>
            <div><Label>Notes</Label><Input value={purchaseForm.notes} onChange={(e) => setPurchaseForm({ ...purchaseForm, notes: e.target.value })} /></div>
          </div>
          <Button onClick={addPurchase}><Save className="h-4 w-4" /> Save Purchase</Button>
        </Card>
      )}

      {showUsage && (
        <Card className="mb-6 space-y-3">
          <h3 className="font-semibold text-white">New Usage / Sold Entry</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>Ball Type</Label><Input value={usageForm.ballType} onChange={(e) => setUsageForm({ ...usageForm, ballType: e.target.value })} /></div>
            <div><Label>Quantity</Label><Input type="number" value={usageForm.quantity} onChange={(e) => setUsageForm({ ...usageForm, quantity: Number(e.target.value) })} /></div>
            <div><Label>Date</Label><Input type="date" value={usageForm.date} onChange={(e) => setUsageForm({ ...usageForm, date: e.target.value })} /></div>
            <div><Label>Notes</Label><Input value={usageForm.notes} onChange={(e) => setUsageForm({ ...usageForm, notes: e.target.value })} /></div>
          </div>
          <Button onClick={addUsage}><Save className="h-4 w-4" /> Save Usage</Button>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-white mb-4">Purchase History</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto text-sm">
            {purchases.map((p) => (
              <div key={p.id} className="p-3 rounded-lg bg-[#0b1219]">
                <p className="text-white font-medium">{p.ballType} × {p.quantity}</p>
                <p className="text-xs text-slate-500">{p.date} · {p.supplier} · ₹{p.purchasePrice}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold text-white mb-4">Usage History</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto text-sm">
            {usage.map((u) => (
              <div key={u.id} className="p-3 rounded-lg bg-[#0b1219]">
                <p className="text-white font-medium">{u.ballType} × {u.quantity}</p>
                <p className="text-xs text-slate-500">{u.date} {u.notes && `· ${u.notes}`}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
