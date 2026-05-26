"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/utils";
import type { TimeSlot } from "@/lib/types";
import { Plus, Ban, Loader2, Save } from "lucide-react";

export default function AdminSlotsPage() {
  const { toast } = useToast();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [advancePct, setAdvancePct] = useState(25);
  const [newBlockDate, setNewBlockDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdminStore().then(({ store }) => {
      setSlots(store.slots);
      setBlocked(store.blockedDates);
      setAdvancePct(store.advancePercentage);
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await patchAdmin("slots", slots);
      await patchAdmin("blockedDates", blocked);
      await patchAdmin("advancePercentage", advancePct);
      toast("Slots & settings saved", "success");
    } catch {
      toast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminShell title="Slots & Pricing">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Slot Management">
      <div className="flex justify-end mb-4">
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save All Changes
        </Button>
      </div>
      <Card className="mb-6">
        <Label>Default Advance Percentage (%)</Label>
        <Input
          type="number"
          min={20}
          max={30}
          value={advancePct}
          onChange={(e) => setAdvancePct(Number(e.target.value))}
          className="mt-2 w-32"
        />
        <p className="text-xs text-slate-500 mt-2">Users pay 20–30% advance when booking online</p>
      </Card>
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Time Slots</h2>
          <div className="space-y-3">
            {slots.map((slot) => (
              <Card key={slot.id}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">{slot.label}</p>
                    <p className="text-sm text-slate-400">{slot.start} – {slot.end}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <Label className="text-xs">Price (₹)</Label>
                      <Input
                        type="number"
                        value={slot.price}
                        onChange={(e) =>
                          setSlots((prev) =>
                            prev.map((s) => (s.id === slot.id ? { ...s, price: Number(e.target.value) } : s))
                          )
                        }
                        className="w-28 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Adv %</Label>
                      <Input
                        type="number"
                        value={slot.advancePercentage ?? ""}
                        placeholder={String(advancePct)}
                        onChange={(e) =>
                          setSlots((prev) =>
                            prev.map((s) =>
                              s.id === slot.id
                                ? { ...s, advancePercentage: e.target.value ? Number(e.target.value) : undefined }
                                : s
                            )
                          )
                        }
                        className="w-20 mt-1"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant={slot.available ? "secondary" : "outline"}
                      onClick={() =>
                        setSlots((prev) =>
                          prev.map((s) => (s.id === slot.id ? { ...s, available: !s.available } : s))
                        )
                      }
                    >
                      {slot.available ? "Available" : "Blocked"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Ban className="h-5 w-5 text-[#ED1C24]" />
            Blocked Dates
          </h2>
          <Card className="mb-4">
            <div className="flex gap-2">
              <Input type="date" value={newBlockDate} onChange={(e) => setNewBlockDate(e.target.value)} />
              <Button
                size="sm"
                onClick={() => {
                  if (newBlockDate && !blocked.includes(newBlockDate)) {
                    setBlocked([...blocked, newBlockDate]);
                    setNewBlockDate("");
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </Card>
          <div className="space-y-2">
            {blocked.map((d) => (
              <div key={d} className="flex justify-between items-center p-3 rounded-xl bg-[#1a2736]">
                <span className="text-white">{d}</span>
                <Button size="sm" variant="ghost" onClick={() => setBlocked(blocked.filter((x) => x !== d))}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Morning slot preview: {formatCurrency(slots[0]?.price ?? 0)} · Advance:{" "}
            {formatCurrency(Math.round(((slots[0]?.price ?? 0) * (slots[0]?.advancePercentage ?? advancePct)) / 100))}
          </p>
        </div>
      </div>
    </AdminShell>
  );
}
