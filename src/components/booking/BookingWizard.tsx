"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { validateEmail, validatePhone, validateRequired, normalizePhone } from "@/lib/validation";
import { createBooking, fetchPublic } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { Calendar, CheckCircle, Loader2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MatchType, TimeSlot } from "@/lib/types";

type Step = "slot" | "details" | "done";

const matchTypes: { value: MatchType; label: string }[] = [
  { value: "practice", label: "Practice" },
  { value: "friendly", label: "Friendly Match" },
  { value: "tournament", label: "Tournament" },
  { value: "corporate", label: "Corporate Event" },
  { value: "academy", label: "Academy Session" },
];

function SlotPricingCards({
  slots,
  selectedSlot,
  onSelect,
  disabled,
}: {
  slots: TimeSlot[];
  selectedSlot: string;
  onSelect: (id: string) => void;
  disabled: boolean;
}) {
  if (slots.length === 0) {
    return (
      <p className="text-center py-8 text-[var(--text-muted)]">
        No slots available for this date. Please choose another date.
      </p>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {slots.map((s) => (
        <button
          key={s.id}
          type="button"
          disabled={!s.available || disabled}
          onClick={() => onSelect(s.id)}
          className={cn(
            "text-left p-5 rounded-2xl border-2 transition-all min-h-[120px]",
            selectedSlot === s.id
              ? "border-[var(--brand-red)] bg-[var(--brand-red)]/5 shadow-md"
              : "border-[var(--border)] bg-white hover:border-[var(--navy-light)]",
            (!s.available || disabled) && "opacity-50 cursor-not-allowed"
          )}
        >
          <p className="font-bold text-[var(--navy)]">{s.label}</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {s.start} – {s.end}
          </p>
          <p className="mt-3 text-xl font-bold text-[var(--brand-red)]">{formatCurrency(s.price)}</p>
        </button>
      ))}
    </div>
  );
}

export function BookingWizard() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("slot");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    teamName: "",
    numberOfPlayers: "",
    matchType: "friendly" as MatchType,
    specialRequest: "",
  });
  const [bookingId, setBookingId] = useState("");

  useEffect(() => {
    if (!selectedDate) {
      setSlots([]);
      setSelectedSlot("");
      return;
    }
    setLoadingSlots(true);
    fetchPublic(selectedDate)
      .then((data) => {
        setSlots(data.slots ?? []);
        setBlockedDates(data.blockedDates ?? []);
        setSelectedSlot("");
      })
      .catch(() => toast("Failed to load slots", "error"))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, toast]);

  const slot = slots.find((s) => s.id === selectedSlot);
  const isBlocked = blockedDates.includes(selectedDate);

  const validateDetails = () => {
    const e: Record<string, string> = {};
    if (validateRequired(form.name, "Full name")) e.name = validateRequired(form.name, "Full name")!;
    if (validateEmail(form.email)) e.email = validateEmail(form.email)!;
    if (validatePhone(form.phone)) e.phone = validatePhone(form.phone)!;
    if (validateRequired(form.address, "Address")) e.address = validateRequired(form.address, "Address")!;
    if (validateRequired(form.teamName, "Team name")) e.teamName = validateRequired(form.teamName, "Team name")!;
    if (!form.numberOfPlayers || Number(form.numberOfPlayers) < 1)
      e.numberOfPlayers = "Enter number of players";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateDetails()) return;
    setSubmitting(true);
    try {
      const res = await createBooking({
        customerName: form.name,
        email: form.email,
        phone: normalizePhone(form.phone),
        address: form.address,
        date: selectedDate,
        slotId: selectedSlot,
        teamName: form.teamName,
        numberOfPlayers: Number(form.numberOfPlayers),
        matchType: form.matchType,
        specialRequest: form.specialRequest,
      });
      setBookingId(res.booking.id);
      setStep("done");
      toast("Booking request submitted!", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Booking failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "done") {
    return (
      <Card className="max-w-lg mx-auto text-center py-12">
        <CheckCircle className="h-16 w-16 mx-auto text-[var(--cricket-green)]" />
        <h2 className="mt-6 text-2xl font-bold text-[var(--navy)]">Booking Request Received!</h2>
        <p className="mt-3 text-[var(--text-muted)]">
          We&apos;ve received your request. You will receive a confirmation email once admin approves your booking.
        </p>
        <div className="mt-6 p-4 rounded-xl bg-[var(--bg-alt)] text-left text-sm space-y-2">
          <p>
            <span className="text-[var(--text-muted)]">ID:</span>{" "}
            <span className="text-[var(--navy)] font-medium">{bookingId}</span>
          </p>
          <p>
            <span className="text-[var(--text-muted)]">Date:</span> {selectedDate}
          </p>
          <p>
            <span className="text-[var(--text-muted)]">Slot:</span> {slot?.label}
          </p>
          <Badge status="pending">Pending Approval</Badge>
        </div>
        <Button
          className="mt-8"
          onClick={() => {
            setStep("slot");
            setSelectedSlot("");
            setSelectedDate("");
          }}
        >
          Book Another Slot
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex gap-2">
        {(["slot", "details"] as const).map((s, i) => (
          <div
            key={s}
            className={cn(
              "flex-1 h-1.5 rounded-full",
              ["slot", "details"].indexOf(step) >= i ? "bg-[var(--brand-red)]" : "bg-[var(--bg-muted)]"
            )}
          />
        ))}
      </div>

      {step === "slot" && (
        <>
          <Card>
            <Label htmlFor="date">Booking Date *</Label>
            <Input
              id="date"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-2 max-w-xs"
            />
            {isBlocked && <p className="mt-2 text-sm text-red-600">This date is unavailable.</p>}
          </Card>
          <div>
            <h3 className="font-bold text-[var(--navy)] flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-[var(--brand-red)]" />
              Available Slots
            </h3>
            {loadingSlots ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-red)]" />
              </div>
            ) : (
              <SlotPricingCards
                slots={slots}
                selectedSlot={selectedSlot}
                onSelect={setSelectedSlot}
                disabled={isBlocked || !selectedDate}
              />
            )}
          </div>
          <Button disabled={!selectedDate || !selectedSlot || isBlocked} onClick={() => setStep("details")}>
            Continue
          </Button>
        </>
      )}

      {step === "details" && (
        <div className="grid lg:grid-cols-5 gap-8">
          <Card className="space-y-4 lg:col-span-3">
            <h3 className="font-bold text-[var(--navy)] text-lg">Your Details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Mobile Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Full Address *</Label>
                <Textarea
                  id="address"
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
                {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
              </div>
              <div>
                <Label htmlFor="teamName">Team Name *</Label>
                <Input
                  id="teamName"
                  value={form.teamName}
                  onChange={(e) => setForm({ ...form, teamName: e.target.value })}
                />
                {errors.teamName && <p className="text-xs text-red-600 mt-1">{errors.teamName}</p>}
              </div>
              <div>
                <Label htmlFor="players">Number of Players *</Label>
                <Input
                  id="players"
                  type="number"
                  min={1}
                  max={22}
                  value={form.numberOfPlayers}
                  onChange={(e) => setForm({ ...form, numberOfPlayers: e.target.value })}
                />
                {errors.numberOfPlayers && (
                  <p className="text-xs text-red-600 mt-1">{errors.numberOfPlayers}</p>
                )}
              </div>
              <div>
                <Label htmlFor="matchType">Match Type</Label>
                <Select
                  id="matchType"
                  value={form.matchType}
                  onChange={(e) => setForm({ ...form, matchType: e.target.value as MatchType })}
                >
                  {matchTypes.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="special">Special Request</Label>
                <Textarea
                  id="special"
                  rows={3}
                  value={form.specialRequest}
                  onChange={(e) => setForm({ ...form, specialRequest: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep("slot")} disabled={submitting}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={submitting} className="min-h-[48px]">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Booking Request
              </Button>
            </div>
          </Card>
          <Card className="h-fit lg:col-span-2">
            <h3 className="font-bold text-[var(--navy)] mb-4">Summary</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--text-muted)]">Date</dt>
                <dd className="font-medium text-right">{selectedDate}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--text-muted)]">Slot</dt>
                <dd className="font-medium text-right">{slot?.label}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--text-muted)]">Time</dt>
                <dd className="text-right">
                  {slot?.start} – {slot?.end}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-[var(--border)] pt-2">
                <dt className="text-[var(--text-muted)]">Price</dt>
                <dd className="font-bold text-[var(--brand-red)]">{formatCurrency(slot?.price ?? 0)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-[var(--text-muted)] flex items-start gap-2">
              <Mail className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              Confirmation email sent after admin approval
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
