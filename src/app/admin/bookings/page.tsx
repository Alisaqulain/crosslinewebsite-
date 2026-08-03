"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminHeader";
import { OldSessionsSection } from "@/components/admin/OldSessionsSection";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AmountInput, parseAmount } from "@/components/ui/AmountInput";
import { Input, Label, Select } from "@/components/ui/Input";
import { OwnerSelect } from "@/components/admin/OwnerSelect";
import { BallQualitySelect } from "@/components/admin/BallQualitySelect";
import { ResponsiveTable } from "@/components/admin/ResponsiveTable";
import {
  createWalkInBooking,
  fetchAdminStore,
  fetchBookings,
  patchBooking,
  deleteBooking,
} from "@/lib/api-client";
import { getAvailableBalls, normalizeBallQuality } from "@/lib/ball-stock";
import { BallStockBar } from "@/components/admin/BallStockBar";
import { getBallStock } from "@/lib/finance";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate, formatTimeRange } from "@/lib/utils";
import { getBookingSlotsForDate } from "@/lib/slots";
import { getQualityLabel } from "@/lib/qualities";
import { bookingAmountReceived, bookingUdhari } from "@/lib/udhari";
import type { AppStore, BallQuality, Booking, BookingSlotView, BookingStatus } from "@/lib/types";
import { Check, X, Loader2, Plus, IndianRupee, Save, Trash2 } from "lucide-react";

function parseBallQuantity(value: string, max: number): number {
  if (value.trim() === "") return 0;
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n < 0) return 0;
  return Math.min(n, max);
}

type BookingsTab = "current" | "old-sessions";

export default function AdminBookingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [tab, setTab] = useState<BookingsTab>("current");
  const [store, setStore] = useState<AppStore | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [approveTarget, setApproveTarget] = useState<Booking | null>(null);
  const [ballTarget, setBallTarget] = useState<Booking | null>(null);
  const [payTarget, setPayTarget] = useState<Booking | null>(null);
  const [amountReceivedInput, setAmountReceivedInput] = useState("");
  const [udhariInput, setUdhariInput] = useState("0");
  const [paymentOwnerId, setPaymentOwnerId] = useState("");
  const [ballQuality, setBallQuality] = useState<BallQuality>("");
  const [ballsUsed, setBallsUsed] = useState(0);
  const [assignBalls, setAssignBalls] = useState(false);
  const [walkInAssignBalls, setWalkInAssignBalls] = useState(false);
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [walkInSaving, setWalkInSaving] = useState(false);
  const [walkIn, setWalkIn] = useState({
    customerName: "",
    phone: "",
    date: new Date().toISOString().split("T")[0],
    slotId: "",
    ballQuality: "" as BallQuality,
    ballsUsed: 0,
    amountReceived: "" as string | number,
    udhariAmount: "0" as string | number,
    receivedByOwnerId: "",
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "old-sessions") {
      setTab("old-sessions");
    }
  }, []);

  const switchTab = (next: BookingsTab) => {
    setTab(next);
    router.replace(next === "old-sessions" ? "/admin/bookings?tab=old-sessions" : "/admin/bookings", {
      scroll: false,
    });
  };

  const walkInSlots: BookingSlotView[] = useMemo(
    () =>
      store
        ? getBookingSlotsForDate(store, walkIn.date).filter((s) => s.available)
        : [],
    [store, walkIn.date]
  );

  const selectedWalkInSlot = walkInSlots.find((s) => s.id === walkIn.slotId);
  const availableForBalls =
    store && ballTarget
      ? getAvailableBalls(store, ballQuality, ballTarget.id)
      : store
        ? getBallStock(store).find((s) => s.quality === ballQuality)?.remaining ?? 0
        : 0;
  const availableWalkIn = store ? getAvailableBalls(store, walkIn.ballQuality) : 0;

  const openApprove = (b: Booking) => {
    setApproveTarget(b);
  };

  const openBallAssign = (b: Booking) => {
    setBallTarget(b);
    const hadBalls = (b.ballsUsed ?? 0) > 0;
    setAssignBalls(hadBalls);
    setBallQuality(b.ballQuality ?? "");
    setBallsUsed(hadBalls ? (b.ballsUsed ?? 0) : 0);
  };

  const confirmApprove = async () => {
    if (!approveTarget) return;
    setActionId(approveTarget.id);
    try {
      await patchBooking(approveTarget.id, { status: "approved" });
      toast("Booking approved — assign balls after the match is played", "success");
      setApproveTarget(null);
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Approve failed", "error");
    } finally {
      setActionId(null);
    }
  };

  const openPayment = (b: Booking) => {
    setPayTarget(b);
    const received = bookingAmountReceived(b);
    setAmountReceivedInput(String(received || ""));
    setUdhariInput(
      typeof b.udhariAmount === "number" ? String(b.udhariAmount) : "0"
    );
    setPaymentOwnerId(b.receivedByOwnerId ?? "");
  };

  const confirmPayment = async () => {
    if (!payTarget) return;
    const received = parseAmount(amountReceivedInput);
    const udhari = parseAmount(udhariInput);
    if (Number.isNaN(received) || received < 0) {
      toast("Enter a valid received amount", "error");
      return;
    }
    if (Number.isNaN(udhari) || udhari < 0) {
      toast("Enter a valid udhari amount", "error");
      return;
    }
    if (!paymentOwnerId) {
      toast("Select owner — who received / recorded this booking", "error");
      return;
    }
    setActionId(payTarget.id);
    try {
      await patchBooking(payTarget.id, {
        recordPayment: true,
        amountReceived: received,
        udhariAmount: udhari,
        receivedByOwnerId: paymentOwnerId || null,
      });
      toast(
        udhari > 0 ? `Saved — ${formatCurrency(udhari)} udhari` : "Full payment recorded",
        "success"
      );
      setPayTarget(null);
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setActionId(null);
    }
  };

  const confirmBallAssign = async () => {
    if (!ballTarget || !store) return;
    const qty = assignBalls ? ballsUsed : 0;
    if (assignBalls && qty > 0 && !normalizeBallQuality(ballQuality)) {
      toast("Enter ball quality name", "error");
      return;
    }
    if (assignBalls && qty > 0 && qty > availableForBalls) {
      toast(`Only ${availableForBalls} balls available`, "error");
      return;
    }
    if (assignBalls && qty > 0 && availableForBalls === 0) {
      toast("No stock for this quality", "error");
      return;
    }
    setActionId(ballTarget.id);
    try {
      await patchBooking(ballTarget.id, {
        assignBalls: true,
        ballsUsed: qty,
        ballQuality: assignBalls && qty > 0 ? normalizeBallQuality(ballQuality) : null,
      });
      toast(
        qty > 0
          ? `Assigned ${qty} ${getQualityLabel(store, ballQuality)} ball(s)`
          : "Ball assignment cleared",
        "success"
      );
      setBallTarget(null);
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Update failed", "error");
    } finally {
      setActionId(null);
    }
  };

  const removeBooking = async (b: Booking) => {
    if (
      !confirm(
        `Delete booking ${b.id}?\n\n${b.customerName} · ${formatDate(b.date)} · ${b.slotLabel}\n\nThis frees the slot and cannot be undone.`
      )
    ) {
      return;
    }
    setActionId(b.id);
    try {
      await deleteBooking(b.id);
      toast("Booking deleted", "success");
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Delete failed", "error");
    } finally {
      setActionId(null);
    }
  };

  const updateStatus = async (id: string, status: BookingStatus) => {
    setActionId(id);
    try {
      await patchBooking(id, { status });
      toast(`Booking ${status}`, "success");
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Update failed", "error");
    } finally {
      setActionId(null);
    }
  };

  const submitWalkIn = async () => {
    if (!walkIn.slotId) {
      toast("Select a session", "error");
      return;
    }
    if (!walkIn.receivedByOwnerId) {
      toast("Select owner — required for every booking", "error");
      return;
    }
    if (!selectedWalkInSlot?.bookable) {
      toast("This session is already booked on that date — pick another session or date", "error");
      return;
    }
    setWalkInSaving(true);
    try {
      await createWalkInBooking({
        customerName: walkIn.customerName.trim() || "Walk-in",
        phone: walkIn.phone,
        date: walkIn.date,
        slotId: walkIn.slotId,
        matchType: "friendly",
        ballQuality:
          walkInAssignBalls && walkIn.ballsUsed > 0
            ? normalizeBallQuality(walkIn.ballQuality)
            : undefined,
        ballsUsed: walkInAssignBalls ? walkIn.ballsUsed : 0,
        amountReceived:
          walkIn.amountReceived !== "" && walkIn.amountReceived !== undefined
            ? parseAmount(walkIn.amountReceived)
            : undefined,
        udhariAmount: parseAmount(walkIn.udhariAmount),
        receivedByOwnerId: walkIn.receivedByOwnerId || undefined,
      });
      toast("Direct booking saved — stock updated", "success");
      setShowWalkIn(false);
      setWalkIn({
        customerName: "",
        phone: "",
        date: new Date().toISOString().split("T")[0],
        slotId: walkInSlots.find((s) => s.bookable)?.id ?? walkInSlots[0]?.id ?? "",
        ballQuality: "",
        ballsUsed: 0,
        amountReceived: "",
        udhariAmount: "0",
        receivedByOwnerId: "",
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
    if (!walkInSlots.length) {
      setWalkIn((w) => ({ ...w, slotId: "" }));
      return;
    }
    const current = walkInSlots.find((s) => s.id === walkIn.slotId);
    if (!current || !current.bookable) {
      const pick = walkInSlots.find((s) => s.bookable) ?? walkInSlots[0];
      setWalkIn((w) => ({ ...w, slotId: pick.id }));
    }
  }, [walkInSlots, walkIn.slotId]);

  return (
    <AdminShell title="Bookings & Sessions">
      <div className="flex flex-wrap gap-2 mb-6">
        {(
          [
            { id: "current" as const, label: "Current bookings" },
            { id: "old-sessions" as const, label: "Old sessions" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => switchTab(t.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold min-h-[44px] transition-colors ${
              tab === t.id
                ? "admin-filter-active bg-[var(--brand-red)]/10 text-[var(--brand-red)] border border-[var(--brand-red)]/20"
                : "admin-filter bg-white text-[var(--text-muted)] border border-[var(--border)] hover:text-[var(--navy)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "old-sessions" ? (
        <OldSessionsSection />
      ) : (
        <>
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
            Phone or on-ground bookings — saved as approved. Pick any future date (e.g. 10 days
            ahead); that session will show as booked on that day for everyone.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <Label>Contact name</Label>
              <Input
                value={walkIn.customerName}
                onChange={(e) => setWalkIn({ ...walkIn, customerName: e.target.value })}
                placeholder="Walk-in"
              />
            </div>
            <div>
              <Label>Phone (optional)</Label>
              <Input value={walkIn.phone} onChange={(e) => setWalkIn({ ...walkIn, phone: e.target.value })} />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={walkIn.date}
                onChange={(e) => setWalkIn({ ...walkIn, date: e.target.value })}
              />
              {walkIn.date && (
                <p className="text-xs text-slate-500 mt-1">{formatDate(walkIn.date)}</p>
              )}
            </div>
            <div>
              <Label>Session</Label>
              {walkInSlots.length === 0 ? (
                <p className="text-sm text-amber-700 mt-1">No open sessions for this date.</p>
              ) : (
                <Select
                  value={walkIn.slotId}
                  onChange={(e) => setWalkIn({ ...walkIn, slotId: e.target.value })}
                >
                  {walkInSlots.map((s) => (
                    <option key={s.id} value={s.id} disabled={!s.bookable}>
                      {s.label} ({formatTimeRange(s.start, s.end)}) — {formatCurrency(s.price)}
                      {!s.bookable ? " — Booked" : ""}
                    </option>
                  ))}
                </Select>
              )}
              {selectedWalkInSlot && !selectedWalkInSlot.bookable && (
                <p className="text-xs text-red-600 mt-1">{selectedWalkInSlot.statusLabel}</p>
              )}
            </div>
            <div>
              <Label>Amount received (₹)</Label>
              <AmountInput
                value={walkIn.amountReceived}
                onChange={(amountReceived) => setWalkIn({ ...walkIn, amountReceived })}
                placeholder="e.g. 2500"
                className="mt-1"
              />
              {walkIn.slotId && selectedWalkInSlot && (
                <p className="text-xs text-slate-500 mt-1">
                  List price {formatCurrency(selectedWalkInSlot.price)}
                </p>
              )}
            </div>
            <div>
              <Label>Udhari / pending (₹)</Label>
              <AmountInput
                value={walkIn.udhariAmount}
                onChange={(udhariAmount) => setWalkIn({ ...walkIn, udhariAmount })}
                placeholder="0 if none — enter manually"
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                Not auto-calculated. Leave 0 if full payment or discount — only type udhari if customer still owes.
              </p>
            </div>
            {store && (
              <OwnerSelect
                owners={store.owners ?? []}
                value={walkIn.receivedByOwnerId}
                onChange={(receivedByOwnerId) => setWalkIn({ ...walkIn, receivedByOwnerId })}
                label="Owner / who received *"
                required
              />
            )}
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
                  <Label>Ball quality (type name)</Label>
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
                    {availableWalkIn} {getQualityLabel(store, walkIn.ballQuality)} available
                  </p>
                </div>
              </>
            )}
          </div>
          <Button
            onClick={submitWalkIn}
            disabled={
              walkInSaving ||
              !selectedWalkInSlot?.bookable ||
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

      {approveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-md space-y-4 shadow-xl">
            <h3 className="font-semibold text-[var(--navy)]">Approve booking</h3>
            <p className="text-sm text-slate-600">
              {approveTarget.customerName} · {formatDate(approveTarget.date)} · {approveTarget.slotLabel}
            </p>
            <p className="text-sm text-slate-500 rounded-xl admin-subtle p-3 border border-[var(--border)]">
              This session will be locked for this date. Other pending requests for the same
              session will be rejected automatically. Assign balls later after the match is played.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setApproveTarget(null)}>
                Cancel
              </Button>
              <Button onClick={confirmApprove} disabled={actionId === approveTarget.id}>
                Approve booking
              </Button>
            </div>
          </Card>
        </div>
      )}

      {payTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-md space-y-4 shadow-xl">
            <h3 className="font-semibold text-[var(--navy)] flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-amber-600" />
              Amount received
            </h3>
            <p className="text-sm text-slate-600">
              {payTarget.customerName} · {formatDate(payTarget.date)} · {payTarget.slotLabel}
              <br />
              List price {formatCurrency(payTarget.slotPrice)}
            </p>
            <div>
              <Label>Received (₹)</Label>
              <AmountInput
                value={amountReceivedInput}
                onChange={setAmountReceivedInput}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Udhari / pending (₹)</Label>
              <AmountInput
                value={udhariInput}
                onChange={setUdhariInput}
                placeholder="0 if none"
                className="mt-1"
              />
              <p className="text-xs mt-1 text-slate-500">
                Type manually only. Not price − received. Empty = ₹0 udhari.
              </p>
            </div>
            {store && (
              <OwnerSelect
                owners={store.owners ?? []}
                value={paymentOwnerId}
                onChange={setPaymentOwnerId}
                label="Owner / who received *"
                required
              />
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setPayTarget(null)}>
                Cancel
              </Button>
              <Button onClick={confirmPayment} disabled={actionId === payTarget.id}>
                <Save className="h-4 w-4" /> Save
              </Button>
            </div>
          </Card>
        </div>
      )}

      {ballTarget && store && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-md space-y-4 shadow-xl">
            <h3 className="font-semibold text-[var(--navy)]">Assign balls (after match)</h3>
            <p className="text-sm text-slate-600">
              {ballTarget.customerName} · {formatDate(ballTarget.date)} · {ballTarget.slotLabel}
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
                <span className="text-sm text-[var(--navy)]">No balls from stock</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="ballAssign"
                  checked={assignBalls}
                  onChange={() => setAssignBalls(true)}
                />
                <span className="text-sm text-[var(--navy)]">Deduct balls from stock</span>
              </label>
            </div>

            {assignBalls && (
              <div className="space-y-3 pl-1 border-l-2 border-[#F7931E] ml-1">
                <div>
                  <Label>Ball quality (type name)</Label>
                  <BallQualitySelect
                    store={store}
                    value={ballQuality}
                    onChange={setBallQuality}
                    excludeBookingId={ballTarget.id}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>How many balls?</Label>
                  <Input
                    type="number"
                    min={0}
                    max={availableForBalls || undefined}
                    value={ballsUsed === 0 ? "" : String(ballsUsed)}
                    placeholder="0"
                    onChange={(e) =>
                      setBallsUsed(parseBallQuantity(e.target.value, availableForBalls))
                    }
                    className="mt-1"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {availableForBalls} {getQualityLabel(store, ballQuality)} available
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setBallTarget(null)}>
                Cancel
              </Button>
              <Button onClick={confirmBallAssign} disabled={actionId === ballTarget.id}>
                Save balls
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
                key: "type",
                header: "Type",
                render: (b) => <span className="capitalize text-sm">{b.matchType}</span>,
              },
              {
                key: "balls",
                header: "Balls",
                render: (b) =>
                  b.ballsUsed && b.ballQuality && store ? (
                    <span className="text-xs font-medium text-[var(--navy)]">
                      {getQualityLabel(store, b.ballQuality)} × {b.ballsUsed}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  ),
              },
              {
                key: "amount",
                header: "Price / Payment",
                render: (b) =>
                  b.status === "approved" ? (
                    <div className="text-xs">
                      <p className="font-medium text-[var(--navy)]">{formatCurrency(b.slotPrice)}</p>
                      <p className="text-green-700">Rcvd {formatCurrency(bookingAmountReceived(b))}</p>
                      {bookingUdhari(b) > 0 ? (
                        <p className="text-red-600 font-semibold">Udhari {formatCurrency(bookingUdhari(b))}</p>
                      ) : (
                        <p className="text-slate-400">Paid</p>
                      )}
                    </div>
                  ) : (
                    formatCurrency(b.slotPrice)
                  ),
              },
              {
                key: "status",
                header: "Status",
                render: (b) => <Badge status={b.status} theme="light" />,
              },
              {
                key: "actions",
                header: "Actions",
                render: (b) => (
                  <div className="flex flex-col gap-1 items-end">
                    {b.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={actionId === b.id}
                          onClick={() => openApprove(b)}
                          title="Approve"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={actionId === b.id}
                          onClick={() => updateStatus(b.id, "rejected")}
                          title="Reject"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                    {b.status === "approved" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          disabled={actionId === b.id}
                          onClick={() => openPayment(b)}
                        >
                          <IndianRupee className="h-3 w-3" />
                          Amount received
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs"
                          disabled={actionId === b.id}
                          onClick={() => openBallAssign(b)}
                        >
                          Assign balls
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      className="text-xs"
                      disabled={actionId === b.id}
                      onClick={() => removeBooking(b)}
                      title="Delete booking"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </Card>
      )}
        </>
      )}
    </AdminShell>
  );
}
