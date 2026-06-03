"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { BallQualitySelect } from "@/components/admin/BallQualitySelect";
import { ResponsiveTable } from "@/components/admin/ResponsiveTable";
import {
  createWalkInBooking,
  fetchAdminStore,
  fetchBookings,
  patchBooking,
} from "@/lib/api-client";
import { firstAvailableQuality, getAvailableBalls } from "@/lib/ball-stock";
import { getBallStock } from "@/lib/finance";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { isSessionActiveOnDate } from "@/lib/slots";
import type { AppStore, BallQuality, Booking, BookingStatus, TimeSlot } from "@/lib/types";
import { BALL_QUALITY_LABELS } from "@/lib/types";
import { Check, X, Loader2, Package, Plus } from "lucide-react";

function parseBallQuantity(value: string, max: number): number {
  if (value.trim() === "") return 0;
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n < 0) return 0;
  return Math.min(n, max);
}

function BallStockBar({ store }: { store: AppStore }) {
  const stock = getBallStock(store);
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {stock.map((s) => (
        <div
          key={s.quality}
          className="flex items-center gap-2 px-3 py-2 rounded-xl admin-subtle text-sm"
        >
          <Package className="h-4 w-4 text-[#F7931E]" />
          <span className="text-[var(--text-muted)]">{s.label}:</span>
          <span className="font-bold text-[var(--navy)]">{s.remaining}</span>
          <span className="text-xs text-slate-400">available</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminBookingsPage() {
  const { toast } = useToast();
  const [store, setStore] = useState<AppStore | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [approveTarget, setApproveTarget] = useState<Booking | null>(null);
  const [ballQuality, setBallQuality] = useState<BallQuality>("high");
  const [ballsUsed, setBallsUsed] = useState(0);
  const [assignBalls, setAssignBalls] = useState(false);
  const [walkInAssignBalls, setWalkInAssignBalls] = useState(false);
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [walkInSaving, setWalkInSaving] = useState(false);
  const [walkIn, setWalkIn] = useState({
    teamA: "",
    teamB: "",
    customerName: "",
    phone: "",
    date: new Date().toISOString().split("T")[0],
    slotId: "",
    numberOfPlayers: 11,
    ballQuality: "high" as BallQuality,
    ballsUsed: 0,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ bookings: data }, admin] = await Promise.all([
        fetchBookings({
          status: filter === "all" ? undefined : filter,
          date: dateFilter || undefined,
        }),
        fetchAdminStore(),
      ]);
      setBookings(data);
      setStore(admin.store);
    } catch {
      toast("Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  }, [filter, dateFilter, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const slots: TimeSlot[] =
    store?.slots.filter((s) => s.available && isSessionActiveOnDate(s, walkIn.date)) ?? [];
  const availableForApprove =
    store && approveTarget
      ? getAvailableBalls(store, ballQuality, approveTarget.id)
      : store
        ? getBallStock(store).find((s) => s.quality === ballQuality)?.remaining ?? 0
        : 0;
  const availableWalkIn = store ? getAvailableBalls(store, walkIn.ballQuality) : 0;

  const openApprove = (b: Booking) => {
    setApproveTarget(b);
    const hadBalls = (b.ballsUsed ?? 0) > 0;
    setAssignBalls(hadBalls);
    const preferred = b.ballQuality ?? "high";
    const quality =
      store && firstAvailableQuality(store, b.id, preferred)
        ? firstAvailableQuality(store, b.id, preferred)!
        : preferred;
    setBallQuality(quality);
    setBallsUsed(hadBalls ? (b.ballsUsed ?? 0) : 0);
  };

  useEffect(() => {
    if (!store || !approveTarget || !assignBalls) return;
    const available = getAvailableBalls(store, ballQuality, approveTarget.id);
    if (available === 0) {
      const next = firstAvailableQuality(store, approveTarget.id, ballQuality);
      if (next) setBallQuality(next);
    }
  }, [store, approveTarget, ballQuality, assignBalls]);

  useEffect(() => {
    if (!store || !showWalkIn || !walkInAssignBalls) return;
    const available = getAvailableBalls(store, walkIn.ballQuality);
    if (available === 0) {
      const next = firstAvailableQuality(store, undefined, walkIn.ballQuality);
      if (next) setWalkIn((w) => ({ ...w, ballQuality: next }));
    }
  }, [store, showWalkIn, walkIn.ballQuality, walkInAssignBalls]);

  const confirmApprove = async () => {
    if (!approveTarget) return;
    const qty = assignBalls ? ballsUsed : 0;
    if (assignBalls && qty > 0 && qty > availableForApprove) {
      toast(`Only ${availableForApprove} balls available`, "error");
      return;
    }
    if (assignBalls && qty > 0 && availableForApprove === 0) {
      toast("No stock for this quality — choose another or use no balls", "error");
      return;
    }
    setActionId(approveTarget.id);
    try {
      const payload: Record<string, unknown> = {
        ballsUsed: qty,
        ballQuality: assignBalls && qty > 0 ? ballQuality : null,
      };
      if (approveTarget.status === "pending") payload.status = "approved";
      await patchBooking(approveTarget.id, payload);
      toast(
        qty > 0
          ? `${approveTarget.status === "pending" ? "Approved" : "Updated"} — ${qty} ${BALL_QUALITY_LABELS[ballQuality]} ball(s)`
          : approveTarget.status === "pending"
            ? "Booking approved (no balls used)"
            : "Balls cleared",
        "success"
      );
      setApproveTarget(null);
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Update failed", "error");
    } finally {
      setActionId(null);
    }
  };

  const updateStatus = async (id: string, status: BookingStatus) => {
    setActionId(id);
    try {
      await patchBooking(id, { status, ballsUsed: 0 });
      toast(`Booking ${status}`, "success");
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Update failed", "error");
    } finally {
      setActionId(null);
    }
  };

  const submitWalkIn = async () => {
    if (!walkIn.teamA.trim() || !walkIn.teamB.trim() || !walkIn.phone || !walkIn.slotId) {
      toast("Fill both teams, phone, and session", "error");
      return;
    }
    setWalkInSaving(true);
    try {
      await createWalkInBooking({
        customerName: walkIn.customerName.trim() || "Walk-in",
        phone: walkIn.phone,
        teamName: `${walkIn.teamA.trim()} vs ${walkIn.teamB.trim()}`,
        date: walkIn.date,
        slotId: walkIn.slotId,
        numberOfPlayers: walkIn.numberOfPlayers,
        matchType: "friendly",
        ballQuality: walkInAssignBalls && walkIn.ballsUsed > 0 ? walkIn.ballQuality : undefined,
        ballsUsed: walkInAssignBalls ? walkIn.ballsUsed : 0,
      });
      toast("Direct booking saved — stock updated", "success");
      setShowWalkIn(false);
      setWalkIn({
        teamA: "",
        teamB: "",
        customerName: "",
        phone: "",
        date: new Date().toISOString().split("T")[0],
        slotId: slots[0]?.id ?? "",
        numberOfPlayers: 11,
        ballQuality: "high",
        ballsUsed: 0,
      });
      setWalkInAssignBalls(false);
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setWalkInSaving(false);
    }
  };

  useEffect(() => {
    if (slots.length && !walkIn.slotId) {
      setWalkIn((w) => ({ ...w, slotId: slots[0].id }));
    }
  }, [slots, walkIn.slotId]);

  return (
    <AdminShell title="Booking Management">
      {store && <BallStockBar store={store} />}

      <div className="flex flex-wrap gap-3 mb-6">
        <Button size="sm" onClick={() => setShowWalkIn(!showWalkIn)} className="min-h-[44px]">
          <Plus className="h-4 w-4" />
          Direct / Walk-in Match
        </Button>
      </div>

      {showWalkIn && store && (
        <Card className="mb-6 space-y-4">
          <h3 className="font-semibold text-[var(--navy)]">Direct booking (not from website)</h3>
          <p className="text-xs text-slate-500">
            Phone or on-ground bookings — saved as approved and balls deducted from stock.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <Label>Team A</Label>
              <Input
                value={walkIn.teamA}
                onChange={(e) => setWalkIn({ ...walkIn, teamA: e.target.value })}
                placeholder="e.g. Lions XI"
              />
            </div>
            <div>
              <Label>Team B</Label>
              <Input
                value={walkIn.teamB}
                onChange={(e) => setWalkIn({ ...walkIn, teamB: e.target.value })}
                placeholder="e.g. Tigers"
              />
            </div>
            <div>
              <Label>Contact name (optional)</Label>
              <Input
                value={walkIn.customerName}
                onChange={(e) => setWalkIn({ ...walkIn, customerName: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={walkIn.phone} onChange={(e) => setWalkIn({ ...walkIn, phone: e.target.value })} />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={walkIn.date}
                onChange={(e) => setWalkIn({ ...walkIn, date: e.target.value })}
              />
            </div>
            <div>
              <Label>Session</Label>
              <Select
                value={walkIn.slotId}
                onChange={(e) => setWalkIn({ ...walkIn, slotId: e.target.value })}
              >
                {slots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} ({s.start}–{s.end}) — {formatCurrency(s.price)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2 space-y-2 p-3 rounded-xl admin-subtle border border-[var(--border)]">
              <p className="text-xs font-semibold text-[var(--navy)]">Stadium balls</p>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={!walkInAssignBalls}
                  onChange={() => {
                    setWalkInAssignBalls(false);
                    setWalkIn({ ...walkIn, ballsUsed: 0 });
                  }}
                />
                <span className="text-sm">No balls from stock</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={walkInAssignBalls}
                  onChange={() => setWalkInAssignBalls(true)}
                />
                <span className="text-sm">Assign balls from stock</span>
              </label>
            </div>
            {walkInAssignBalls && (
              <>
                <div>
                  <Label>Ball quality</Label>
                  <BallQualitySelect
                    store={store}
                    value={walkIn.ballQuality}
                    onChange={(ballQuality) => setWalkIn({ ...walkIn, ballQuality })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Balls used (optional, 0 = none)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={availableWalkIn || undefined}
                    placeholder="0"
                    value={walkIn.ballsUsed === 0 ? "" : String(walkIn.ballsUsed)}
                    onChange={(e) =>
                      setWalkIn({
                        ...walkIn,
                        ballsUsed: parseBallQuantity(e.target.value, availableWalkIn),
                      })
                    }
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {availableWalkIn} {BALL_QUALITY_LABELS[walkIn.ballQuality]} available
                  </p>
                </div>
              </>
            )}
          </div>
          <Button
            onClick={submitWalkIn}
            disabled={
              walkInSaving ||
              (walkInAssignBalls &&
                walkIn.ballsUsed > 0 &&
                (availableWalkIn === 0 || walkIn.ballsUsed > availableWalkIn))
            }
          >
            {walkInSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save direct booking
          </Button>
        </Card>
      )}

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-semibold capitalize min-h-[44px] transition-colors ${
                filter === f
                  ? "admin-filter-active bg-[var(--brand-red)]/10 text-[var(--brand-red)] border border-[var(--brand-red)]/20"
                  : "admin-filter bg-white text-[var(--text-muted)] border border-[var(--border)] hover:text-[var(--navy)]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div>
          <Label className="text-xs">Filter by date</Label>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="mt-1 w-44"
          />
        </div>
      </div>

      {approveTarget && store && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-md space-y-4 shadow-xl">
            <h3 className="font-semibold text-[var(--navy)]">
              {approveTarget.status === "pending" ? "Approve booking" : "Edit booking"}
            </h3>
            <p className="text-sm text-slate-600">
              {approveTarget.teamName} · {formatDate(approveTarget.date)} · {approveTarget.slotLabel}
            </p>

            <div className="space-y-2 p-3 rounded-xl admin-subtle border border-[var(--border)]">
              <p className="text-xs font-semibold text-[var(--navy)] uppercase tracking-wide">
                Stadium balls
              </p>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="ballAssign"
                  checked={!assignBalls}
                  onChange={() => {
                    setAssignBalls(false);
                    setBallsUsed(0);
                  }}
                />
                <span className="text-sm text-[var(--navy)]">No balls from stock (teams bring own)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="ballAssign"
                  checked={assignBalls}
                  onChange={() => setAssignBalls(true)}
                />
                <span className="text-sm text-[var(--navy)]">Assign balls from stock</span>
              </label>
            </div>

            {assignBalls && (
              <div className="space-y-3 pl-1 border-l-2 border-[#F7931E] ml-1">
                <div>
                  <Label>Ball quality</Label>
                  <BallQualitySelect
                    store={store}
                    value={ballQuality}
                    onChange={setBallQuality}
                    excludeBookingId={approveTarget.id}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>How many balls? (leave 0 if none)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={availableForApprove || undefined}
                    value={ballsUsed === 0 ? "" : String(ballsUsed)}
                    placeholder="0"
                    onChange={(e) =>
                      setBallsUsed(parseBallQuantity(e.target.value, availableForApprove))
                    }
                    className="mt-1"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {availableForApprove} {BALL_QUALITY_LABELS[ballQuality]} available
                    {ballsUsed > 0 ? ` · ${availableForApprove - ballsUsed} left after` : ""}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setApproveTarget(null)}>
                Cancel
              </Button>
              <Button
                onClick={confirmApprove}
                disabled={actionId === approveTarget.id}
              >
                {approveTarget.status === "pending" ? "Approve" : "Save"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      ) : (
        <Card className="p-0 md:p-6">
          <ResponsiveTable
            data={bookings}
            rowKey={(b) => b.id}
            emptyMessage="No bookings found"
            columns={[
              {
                key: "id",
                header: "ID",
                render: (b) => (
                  <span className="text-[var(--text-muted)]">
                    {b.id}
                    {b.walkIn && (
                      <span className="block text-[10px] uppercase text-amber-600">Walk-in</span>
                    )}
                  </span>
                ),
              },
              {
                key: "customer",
                header: "Customer",
                render: (b) => (
                  <div>
                    <p className="font-semibold text-[var(--navy)]">{b.customerName}</p>
                    <p className="text-xs text-[var(--text-muted)]">{b.phone}</p>
                  </div>
                ),
              },
              {
                key: "date",
                header: "Date / Slot",
                render: (b) => (
                  <span>
                    {formatDate(b.date)}
                    <br />
                    <span className="text-xs text-slate-500">{b.slotLabel}</span>
                  </span>
                ),
              },
              {
                key: "team",
                header: "Match",
                render: (b) => (
                  <span>
                    {b.teamName}
                    <br />
                    <span className="text-xs capitalize">{b.matchType}</span>
                  </span>
                ),
              },
              {
                key: "balls",
                header: "Balls",
                render: (b) =>
                  b.ballsUsed && b.ballQuality ? (
                    <span className="text-xs font-medium text-[var(--navy)]">
                      {BALL_QUALITY_LABELS[b.ballQuality]} × {b.ballsUsed}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  ),
              },
              {
                key: "amount",
                header: "Price",
                render: (b) => formatCurrency(b.slotPrice),
              },
              {
                key: "status",
                header: "Status",
                render: (b) => <Badge status={b.status} theme="light" />,
              },
              {
                key: "actions",
                header: "Actions",
                render: (b) =>
                  b.status === "pending" ? (
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={actionId === b.id}
                        onClick={() => openApprove(b)}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={actionId === b.id}
                        onClick={() => updateStatus(b.id, "rejected")}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : b.status === "approved" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                      disabled={actionId === b.id}
                      onClick={() => openApprove(b)}
                    >
                      Edit balls
                    </Button>
                  ) : (
                    <span className="text-slate-500 text-xs">—</span>
                  ),
              },
            ]}
          />
        </Card>
      )}
    </AdminShell>
  );
}
