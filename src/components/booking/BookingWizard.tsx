"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { validateEmail, validatePhone, validateRequired, normalizePhone } from "@/lib/validation";
import { createBooking } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { usePublicData } from "@/hooks/usePublicData";
import { Calendar, CheckCircle, CreditCard, Loader2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MatchType, TimeSlot } from "@/lib/types";

type Step = "slot" | "details" | "payment" | "done";

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
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {slots.map((s) => (
        <button
          key={s.id}
          type="button"
          disabled={!s.available || disabled}
          onClick={() => onSelect(s.id)}
          className={cn(
            "text-left p-5 rounded-2xl border-2 transition-all",
            selectedSlot === s.id
              ? "border-[var(--brand-red)] bg-[var(--brand-red)]/5 shadow-md"
              : "border-[var(--border)] bg-white hover:border-[var(--navy-light)]",
            (!s.available || disabled) && "opacity-50 cursor-not-allowed"
          )}
        >
          <p className="font-bold text-[var(--navy)]">{s.label}</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">{s.start} – {s.end}</p>
          <p className="mt-3 text-xl font-bold text-[var(--brand-red)]">{formatCurrency(s.price)}</p>
          {!s.available && <span className="text-xs text-red-500 font-semibold mt-2 block">Unavailable</span>}
        </button>
      ))}
    </div>
  );
}

export function BookingWizard() {
  const { toast } = useToast();
  const { data, loading } = usePublicData();
  const [step, setStep] = useState<Step>("slot");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    teamName: "",
    numberOfPlayers: "",
    matchType: "friendly" as MatchType,
    specialRequest: "",
    paymentStatus: "paid" as "paid" | "pending",
  });
  const [bookingId, setBookingId] = useState("");

  const slots = data?.allSlots ?? data?.slots ?? [];
  const blockedDates = data?.blockedDates ?? [];
  const advancePct = data?.advancePercentage ?? 25;
  const slot = slots.find((s) => s.id === selectedSlot);
  const total = slot?.price ?? 0;
  const pct = slot?.advancePercentage ?? advancePct;
  const advance = Math.round((total * pct) / 100);
  const remaining = total - advance;
  const isBlocked = blockedDates.includes(selectedDate);

  const validateDetails = () => {
    const e: Record<string, string> = {};
    if (validateRequired(form.name, "Full name")) e.name = validateRequired(form.name, "Full name")!;
    if (validateEmail(form.email)) e.email = validateEmail(form.email)!;
    if (validatePhone(form.phone)) e.phone = validatePhone(form.phone)!;
    if (validateRequired(form.address, "Address")) e.address = validateRequired(form.address, "Address")!;
    if (validateRequired(form.teamName, "Team name")) e.teamName = validateRequired(form.teamName, "Team name")!;
    if (!form.numberOfPlayers || Number(form.numberOfPlayers) < 1) e.numberOfPlayers = "Enter number of players";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
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
        paymentStatus: form.paymentStatus,
      });
      setBookingId(res.booking.id);
      setStep("done");
      toast("Booking request submitted! Check your email.", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Booking failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--brand-red)]" />
      </div>
    );
  }

  if (step === "done") {
    return (
      <Card className="max-w-lg mx-auto text-center py-12">
        <CheckCircle className="h-16 w-16 mx-auto text-[var(--cricket-green)]" />
        <h2 className="mt-6 text-2xl font-bold text-[var(--navy)]">Booking Request Received!</h2>
        <p className="mt-3 text-[var(--text-muted)]">
          Confirmation email sent to <strong className="text-[var(--navy)]">{form.email}</strong>. We will notify you once approved.
        </p>
        <div className="mt-6 p-4 rounded-xl bg-[var(--bg-alt)] text-left text-sm space-y-2">
          <p><span className="text-[var(--text-muted)]">ID:</span> <span className="text-[var(--navy)] font-medium">{bookingId}</span></p>
          <p><span className="text-[var(--text-muted)]">Date:</span> {selectedDate}</p>
          <p><span className="text-[var(--text-muted)]">Slot:</span> {slot?.label}</p>
          <Badge status="pending">Pending Approval</Badge>
        </div>
        <Button className="mt-8" onClick={() => { setStep("slot"); setSelectedSlot(""); setSelectedDate(""); }}>
          Book Another Slot
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex gap-2">
        {(["slot", "details", "payment"] as const).map((s, i) => (
          <div
            key={s}
            className={cn(
              "flex-1 h-1.5 rounded-full",
              ["slot", "details", "payment"].indexOf(step) >= i ? "bg-[var(--brand-red)]" : "bg-[var(--bg-muted)]"
            )}
          />
        ))}
      </div>

      {step === "slot" && (
        <>
          <Card>
            <Label htmlFor="date">Booking Date</Label>
            <Input id="date" type="date" min={new Date().toISOString().split("T")[0]} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="mt-2 max-w-xs" />
            {isBlocked && <p className="mt-2 text-sm text-red-600">This date is unavailable.</p>}
          </Card>
          <div>
            <h3 className="font-bold text-[var(--navy)] flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-[var(--brand-red)]" />
              Available Slots & Pricing
            </h3>
            <SlotPricingCards slots={slots} selectedSlot={selectedSlot} onSelect={setSelectedSlot} disabled={isBlocked} />
          </div>
          <Button disabled={!selectedDate || !selectedSlot || isBlocked} onClick={() => setStep("details")}>
            Continue
          </Button>
        </>
      )}

      {step === "details" && (
        <Card className="space-y-4 max-w-3xl">
          <h3 className="font-bold text-[var(--navy)] text-lg">Your Details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Mobile Number *</Label>
              <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="address">Full Address *</Label>
              <Textarea id="address" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
            </div>
            <div>
              <Label htmlFor="teamName">Team Name *</Label>
              <Input id="teamName" value={form.teamName} onChange={(e) => setForm({ ...form, teamName: e.target.value })} />
              {errors.teamName && <p className="text-xs text-red-600 mt-1">{errors.teamName}</p>}
            </div>
            <div>
              <Label htmlFor="players">Number of Players *</Label>
              <Input id="players" type="number" min={1} max={22} value={form.numberOfPlayers} onChange={(e) => setForm({ ...form, numberOfPlayers: e.target.value })} />
              {errors.numberOfPlayers && <p className="text-xs text-red-600 mt-1">{errors.numberOfPlayers}</p>}
            </div>
            <div>
              <Label htmlFor="matchType">Match Type</Label>
              <Select id="matchType" value={form.matchType} onChange={(e) => setForm({ ...form, matchType: e.target.value as MatchType })}>
                {matchTypes.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="special">Special Request</Label>
              <Textarea id="special" rows={3} value={form.specialRequest} onChange={(e) => setForm({ ...form, specialRequest: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("slot")}>Back</Button>
            <Button onClick={() => { if (validateDetails()) setStep("payment"); }}>Continue</Button>
          </div>
        </Card>
      )}

      {step === "payment" && (
        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl">
          <Card className="space-y-4">
            <h3 className="font-bold text-[var(--navy)] flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[var(--brand-red)]" />
              Advance Payment ({pct}%)
            </h3>
            <div className="p-4 rounded-xl bg-[var(--bg-alt)] space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">Total</span><span className="font-semibold">{formatCurrency(total)}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">Advance</span><span className="font-bold text-[var(--brand-red)]">{formatCurrency(advance)}</span></div>
              <div className="flex justify-between border-t border-[var(--border)] pt-2"><span className="text-[var(--text-muted)]">At stadium</span><span>{formatCurrency(remaining)}</span></div>
            </div>
            <Select value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value as "paid" | "pending" })}>
              <option value="paid">Advance paid online</option>
              <option value="pending">Pay advance at stadium</option>
            </Select>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("details")} disabled={submitting}>Back</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Booking Request
              </Button>
            </div>
          </Card>
          <Card className="h-fit">
            <h3 className="font-bold text-[var(--navy)] mb-4">Summary</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-[var(--text-muted)]">Date</dt><dd className="font-medium">{selectedDate}</dd></div>
              <div className="flex justify-between"><dt className="text-[var(--text-muted)]">Slot</dt><dd className="font-medium">{slot?.label}</dd></div>
              <div className="flex justify-between"><dt className="text-[var(--text-muted)]">Team</dt><dd className="font-medium">{form.teamName}</dd></div>
              <div className="flex justify-between"><dt className="text-[var(--text-muted)]">Players</dt><dd>{form.numberOfPlayers}</dd></div>
            </dl>
            <p className="mt-4 text-xs text-[var(--text-muted)] flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> Email confirmation on submit & after approval</p>
          </Card>
        </div>
      )}
    </div>
  );
}
