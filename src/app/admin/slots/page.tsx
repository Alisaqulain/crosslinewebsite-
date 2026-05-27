"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/utils";
import type { AppStore, TimeSlot } from "@/lib/types";
import { getAdminSlotStatus } from "@/lib/slots";
import { Plus, Ban, Loader2, Save, Trash2 } from "lucide-react";

export default function AdminSlotsPage() {
  const { toast } = useToast();
  const [store, setStore] = useState<AppStore | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [statusDate, setStatusDate] = useState(new Date().toISOString().split("T")[0]);
  const [newBlockDate, setNewBlockDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdminStore().then(({ store: s }) => {
      setStore(s);
      setSlots(s.slots);
      setBlocked(s.blockedDates);
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await patchAdmin("slots", slots);
      await patchAdmin("blockedDates", blocked);
      toast("Slots saved", "success");
    } catch {
      toast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const addSlot = () => {
    const id = `slot-${Date.now().toString(36)}`;
    setSlots([
      ...slots,
      {
        id,
        date: "",
        label: "New Session",
        start: "06:00",
        end: "10:00",
        price: 5000,
        available: true,
      },
    ]);
  };

  const removeSlot = (id: string) => {
    setSlots(slots.filter((s) => s.id !== id));
  };

  if (loading) {
    return (
      <AdminShell title="Slot Management">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Slot Management">
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <Button onClick={addSlot} variant="outline" size="sm">
          <Plus className="h-4 w-4" />
          Add Slot
        </Button>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save All
        </Button>
      </div>

      <Card className="mb-6">
        <Label>View booking status for date</Label>
        <Input
          type="date"
          value={statusDate}
          onChange={(e) => setStatusDate(e.target.value)}
          className="mt-2 max-w-xs"
        />
      </Card>

      <div className="space-y-4 mb-8">
        {slots.map((slot) => {
          const status = store
            ? getAdminSlotStatus(slot, statusDate, store.bookings)
            : "available";
          const statusColors = {
            available: "text-green-400",
            booked: "text-red-400",
            under_review: "text-amber-400",
            blocked: "text-slate-500",
          };
          return (
            <Card key={slot.id}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs">Label</Label>
                  <Input
                    value={slot.label}
                    onChange={(e) =>
                      setSlots((prev) =>
                        prev.map((s) => (s.id === slot.id ? { ...s, label: e.target.value } : s))
                      )
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Date (optional)</Label>
                  <Input
                    type="date"
                    value={slot.date}
                    onChange={(e) =>
                      setSlots((prev) =>
                        prev.map((s) => (s.id === slot.id ? { ...s, date: e.target.value } : s))
                      )
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Start</Label>
                  <Input
                    type="time"
                    value={slot.start}
                    onChange={(e) =>
                      setSlots((prev) =>
                        prev.map((s) => (s.id === slot.id ? { ...s, start: e.target.value } : s))
                      )
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">End</Label>
                  <Input
                    type="time"
                    value={slot.end}
                    onChange={(e) =>
                      setSlots((prev) =>
                        prev.map((s) => (s.id === slot.id ? { ...s, end: e.target.value } : s))
                      )
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Price (₹)</Label>
                  <Input
                    type="number"
                    value={slot.price}
                    onChange={(e) =>
                      setSlots((prev) =>
                        prev.map((s) =>
                          s.id === slot.id ? { ...s, price: Number(e.target.value) } : s
                        )
                      )
                    }
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    size="sm"
                    variant={slot.available ? "secondary" : "outline"}
                    onClick={() =>
                      setSlots((prev) =>
                        prev.map((s) =>
                          s.id === slot.id ? { ...s, available: !s.available } : s
                        )
                      )
                    }
                  >
                    {slot.available ? "Available" : "Blocked"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => removeSlot(slot.id)}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
                <div className="sm:col-span-2 flex items-end">
                  <p className="text-sm">
                    Status on {statusDate}:{" "}
                    <span className={`font-bold capitalize ${statusColors[status]}`}>
                      {status.replace("_", " ")}
                    </span>
                    <span className="text-slate-500 ml-2">· {formatCurrency(slot.price)}</span>
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--navy)] mb-4 flex items-center gap-2">
          <Ban className="h-5 w-5 text-[#ED1C24]" />
          Blocked Dates
        </h2>
        <div className="flex gap-2 mb-4">
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
        <div className="space-y-2">
          {blocked.map((d) => (
            <div key={d} className="flex justify-between items-center p-3 rounded-xl admin-subtle">
              <span className="text-[var(--navy)]">{d}</span>
              <Button size="sm" variant="ghost" onClick={() => setBlocked(blocked.filter((x) => x !== d))}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </AdminShell>
  );
}
