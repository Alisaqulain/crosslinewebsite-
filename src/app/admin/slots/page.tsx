"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatTimeRange } from "@/lib/utils";
import { formatSessionValidity } from "@/lib/slots";
import type { TimeSlot } from "@/lib/types";
import { Ban, Calendar, Clock, Loader2, Pencil, Plus, Save, Trash2 } from "lucide-react";

const emptySessionForm = (): Omit<TimeSlot, "id"> => ({
  date: "",
  label: "",
  start: "06:00",
  end: "10:00",
  price: 5000,
  available: true,
  validity: "lifetime",
  validFrom: "",
  validTo: "",
});

export default function AdminSlotsPage() {
  const { toast } = useToast();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [newBlockDate, setNewBlockDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptySessionForm);

  const load = useCallback(() => {
    fetchAdminStore().then(({ store: s }) => {
      setSlots(
        s.slots.map((slot: TimeSlot) => ({
          ...slot,
          validity: slot.validity ?? (slot.date ? "date_range" : "lifetime"),
        }))
      );
      setBlocked(s.blockedDates);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const persistSlots = async (next: TimeSlot[], message = "Saved") => {
    setSaving(true);
    try {
      const { store } = await patchAdmin("slots", next);
      setSlots(store.slots);
      toast(message, "success");
      return true;
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const persistBlocked = async (next: string[]) => {
    try {
      await patchAdmin("blockedDates", next);
      setBlocked(next);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    }
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptySessionForm());
    setShowForm(true);
  };

  const openEditForm = (slot: TimeSlot) => {
    setEditingId(slot.id);
    setForm({
      date: slot.date,
      label: slot.label,
      start: slot.start,
      end: slot.end,
      price: slot.price,
      available: slot.available,
      validity: slot.validity ?? "lifetime",
      validFrom: slot.validFrom ?? slot.date ?? "",
      validTo: slot.validTo ?? "",
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptySessionForm());
  };

  const validateForm = (): boolean => {
    if (!form.label.trim()) {
      toast("Enter session name", "error");
      return false;
    }
    if (!form.start || !form.end) {
      toast("Set start and end time", "error");
      return false;
    }
    if (form.price < 0) {
      toast("Enter a valid price", "error");
      return false;
    }
    if (form.validity === "date_range") {
      if (!form.validFrom) {
        toast("Choose a start date for this session", "error");
        return false;
      }
      if (form.validTo && form.validTo < form.validFrom) {
        toast("End date must be on or after start date", "error");
        return false;
      }
    }
    return true;
  };

  const buildSlotFromForm = (id: string): TimeSlot => ({
    id,
    date: "",
    label: form.label.trim(),
    start: form.start,
    end: form.end,
    price: form.price,
    available: form.available,
    validity: form.validity,
    validFrom: form.validity === "date_range" ? form.validFrom : undefined,
    validTo: form.validity === "date_range" ? form.validTo || form.validFrom : undefined,
  });

  const applyForm = async () => {
    if (!validateForm()) return;

    let next: TimeSlot[];
    if (editingId) {
      next = slots.map((s) => (s.id === editingId ? buildSlotFromForm(editingId) : s));
    } else {
      next = [...slots, buildSlotFromForm(`slot-${Date.now().toString(36)}`)];
    }

    const ok = await persistSlots(next, editingId ? "Session updated" : "Session added");
    if (ok) cancelForm();
  };

  const deleteSession = async (id: string, label: string) => {
    if (!confirm(`Delete "${label}" permanently?`)) return;
    const next = slots.filter((s) => s.id !== id);
    const ok = await persistSlots(next, "Session deleted");
    if (ok && editingId === id) cancelForm();
  };

  const toggleOpen = async (slot: TimeSlot) => {
    const next = slots.map((s) =>
      s.id === slot.id ? { ...s, available: !s.available } : s
    );
    await persistSlots(
      next,
      slot.available ? "Session closed on booking page" : "Session open for booking"
    );
  };

  const openCount = slots.filter((s) => s.available).length;

  if (loading) {
    return (
      <AdminShell title="Slot Pricing">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Slot Pricing">
      <p className="text-sm text-[var(--text-muted)] mb-6 max-w-2xl">
        Sessions save automatically when you add, edit, or delete. Use{" "}
        <strong>Lifetime</strong> for always-on slots, or a <strong>date range</strong> for seasonal
        sessions.
      </p>

      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="font-semibold text-[var(--navy)]">
            {editingId ? "Edit session" : showForm ? "New session" : "Session form"}
          </h3>
          {!showForm && (
            <Button size="sm" onClick={openAddForm} disabled={saving}>
              <Plus className="h-4 w-4" />
              Add session
            </Button>
          )}
        </div>

        {showForm ? (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Session name *</Label>
                <Input
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="e.g. Morning Session"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Start time *</Label>
                <Input
                  type="time"
                  value={form.start}
                  onChange={(e) => setForm({ ...form, start: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>End time *</Label>
                <Input
                  type="time"
                  value={form.end}
                  onChange={(e) => setForm({ ...form, end: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Price (₹) *</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.price || ""}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="mt-1"
                />
                {form.price > 0 && (
                  <p className="text-xs text-slate-500 mt-1">{formatCurrency(form.price)} on website</p>
                )}
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer w-full p-3 rounded-xl admin-subtle border border-[var(--border)]">
                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={(e) => setForm({ ...form, available: e.target.checked })}
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm font-medium text-[var(--navy)]">Open for booking</span>
                </label>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-alt)]/40 space-y-4">
              <div className="flex items-center gap-2 text-[var(--navy)] font-medium text-sm">
                <Calendar className="h-4 w-4 text-[#F7931E]" />
                When is this session active?
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    form.validity === "lifetime"
                      ? "border-[var(--brand-red)]/40 bg-[var(--brand-red)]/5"
                      : "border-[var(--border)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="validity"
                    checked={form.validity === "lifetime"}
                    onChange={() => setForm({ ...form, validity: "lifetime" })}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-semibold text-sm text-[var(--navy)]">Lifetime</span>
                    <span className="block text-xs text-slate-500 mt-0.5">
                      Always shown on every booking date
                    </span>
                  </span>
                </label>
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    form.validity === "date_range"
                      ? "border-[var(--brand-red)]/40 bg-[var(--brand-red)]/5"
                      : "border-[var(--border)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="validity"
                    checked={form.validity === "date_range"}
                    onChange={() => setForm({ ...form, validity: "date_range" })}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-semibold text-sm text-[var(--navy)]">Date range</span>
                    <span className="block text-xs text-slate-500 mt-0.5">
                      Only between From and To dates
                    </span>
                  </span>
                </label>
              </div>
              {form.validity === "date_range" && (
                <div className="grid sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <Label>From date *</Label>
                    <Input
                      type="date"
                      value={form.validFrom}
                      onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>To date</Label>
                    <Input
                      type="date"
                      value={form.validTo}
                      onChange={(e) => setForm({ ...form, validTo: e.target.value })}
                      className="mt-1"
                    />
                    <p className="text-xs text-slate-500 mt-1">Leave empty = same as From (one day only)</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={applyForm} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editingId ? "Save session" : "Add session"}
              </Button>
              <Button variant="ghost" onClick={cancelForm} disabled={saving}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">
            Click <strong>Add session</strong> or <strong>Edit</strong> on a row below.
          </p>
        )}
      </Card>

      <Card className="mb-8">
        <h3 className="font-semibold text-[var(--navy)] mb-1 flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#F7931E]" />
          All sessions ({slots.length})
          {saving && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
        </h3>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Customers only see sessions marked <strong>Open</strong> on the booking page.
        </p>

        {slots.length > 0 && openCount === 0 && (
          <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
            <strong>Booking page is empty</strong> — all sessions are closed. Turn on{" "}
            <strong>Open for booking</strong> below (or use Edit).
          </div>
        )}

        {slots.length === 0 ? (
          <div className="text-center py-12 rounded-xl admin-subtle">
            <p className="text-[var(--text-muted)] mb-3">No sessions yet</p>
            <Button size="sm" onClick={openAddForm}>
              <Plus className="h-4 w-4" />
              Add your first session
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {slots.map((slot, index) => (
              <div
                key={slot.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl admin-subtle border border-[var(--border)]"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--navy)]/5 text-sm font-bold text-[var(--navy)]">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--navy)]">{slot.label}</p>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">
                      {formatTimeRange(slot.start, slot.end)} · {formatCurrency(slot.price)}
                    </p>
                    <p className="text-xs text-[#F7931E] font-medium mt-1">
                      {formatSessionValidity(slot)}
                    </p>
                    <span
                      className={`inline-block mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        slot.available
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {slot.available ? "Open — on booking page" : "Closed — not on booking page"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:shrink-0 justify-end">
                  <Button
                    size="sm"
                    variant={slot.available ? "outline" : "secondary"}
                    onClick={() => toggleOpen(slot)}
                    disabled={saving}
                  >
                    {slot.available ? "Close booking" : "Open for booking"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openEditForm(slot)} disabled={saving}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteSession(slot.id, slot.label)}
                    disabled={saving}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="font-semibold text-[var(--navy)] mb-1 flex items-center gap-2">
          <Ban className="h-5 w-5 text-[#ED1C24]" />
          Blocked dates
        </h3>
        <p className="text-xs text-[var(--text-muted)] mb-4">No bookings on these days (saved automatically).</p>
        <div className="flex flex-wrap gap-2 mb-4 max-w-lg">
          <div className="flex-1 min-w-[160px]">
            <Label className="text-xs">Date</Label>
            <Input
              type="date"
              value={newBlockDate}
              onChange={(e) => setNewBlockDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex items-end">
            <Button
              size="sm"
              onClick={() => {
                if (newBlockDate && !blocked.includes(newBlockDate)) {
                  const next = [...blocked, newBlockDate].sort();
                  persistBlocked(next);
                  setNewBlockDate("");
                }
              }}
            >
              Block date
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          {blocked.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No blocked dates</p>
          ) : (
            blocked.map((d) => (
              <div
                key={d}
                className="flex justify-between items-center p-3 rounded-xl admin-subtle text-sm"
              >
                <span className="font-medium text-[var(--navy)]">{d}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600"
                  onClick={() => persistBlocked(blocked.filter((x) => x !== d))}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>
    </AdminShell>
  );
}
