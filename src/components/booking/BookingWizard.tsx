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
import { Calendar, CheckCircle, CreditCard, Loader2, Mail, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaImage } from "@/components/media/MediaImage";
import { images } from "@/lib/media";
import type { MatchType } from "@/lib/types";

type Step = "slot" | "details" | "payment" | "done";

const matchTypes: { value: MatchType; label: string }[] = [
  { value: "practice", label: "Practice" },
  { value: "friendly", label: "Friendly Match" },
  { value: "tournament", label: "Tournament" },
  { value: "corporate", label: "Corporate Event" },
  { value: "academy", label: "Academy Session" },
];

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
    playersOrTeam: "",
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
    const nameErr = validateRequired(form.name, "Full name");
    const emailErr = validateEmail(form.email);
    const phoneErr = validatePhone(form.phone);
    const addrErr = validateRequired(form.address, "Address");
    const teamErr = validateRequired(form.playersOrTeam, "Players / Team name");
    if (nameErr) e.name = nameErr;
    if (emailErr) e.email = emailErr;
    if (phoneErr) e.phone = phoneErr;
    if (addrErr) e.address = addrErr;
    if (teamErr) e.playersOrTeam = teamErr;
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
        playersOrTeam: form.playersOrTeam,
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
        <Loader2 className="h-10 w-10 animate-spin text-[#F7931E]" />
      </div>
    );
  }

  if (step === "done") {
    return (
      <Card className="max-w-lg mx-auto text-center py-12">
        <CheckCircle className="h-16 w-16 mx-auto text-[#39B54A]" />
        <h2 className="mt-6 text-2xl font-bold text-white">Booking Request Received!</h2>
        <p className="mt-3 text-slate-400">
          Confirmation email sent to <strong className="text-white">{form.email}</strong>.
          Admin will review and you&apos;ll receive approval email once confirmed.
        </p>
        <div className="mt-6 p-4 rounded-xl bg-white/5 text-left text-sm space-y-2">
          <p><span className="text-slate-500">Booking ID:</span> {bookingId}</p>
          <p><span className="text-slate-500">Date:</span> {selectedDate}</p>
          <p><span className="text-slate-500">Slot:</span> {slot?.label}</p>
          <p><span className="text-slate-500">Advance paid:</span> {formatCurrency(advance)}</p>
          <Badge status="pending">Pending Approval</Badge>
        </div>
        <Button
          className="mt-8"
          onClick={() => {
            setStep("slot");
            setSelectedSlot("");
            setSelectedDate("");
            setForm({
              name: "",
              email: "",
              phone: "",
              address: "",
              playersOrTeam: "",
              matchType: "friendly",
              specialRequest: "",
              paymentStatus: "paid",
            });
          }}
        >
          Book Another Slot
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex gap-2 mb-2">
          {(["slot", "details", "payment"] as const).map((s, i) => (
            <div
              key={s}
              className={cn(
                "flex-1 h-1 rounded-full",
                ["slot", "details", "payment"].indexOf(step) >= i
                  ? "bg-gradient-to-r from-[#ED1C24] to-[#F7931E]"
                  : "bg-white/10"
              )}
            />
          ))}
        </div>

        {step === "slot" && (
          <>
            <Card>
              <Label htmlFor="date">Booking Date</Label>
              <Input
                id="date"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-2"
              />
              {isBlocked && (
                <p className="mt-2 text-sm text-red-400">This date is unavailable. Please choose another date.</p>
              )}
            </Card>
            <div className="space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#F7931E]" />
                Available Slots
              </h3>
              {slots.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  disabled={!s.available || isBlocked}
                  onClick={() => setSelectedSlot(s.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all",
                    selectedSlot === s.id
                      ? "border-[#F7931E] bg-[#F7931E]/10"
                      : "border-white/10 bg-[#1a2736]/50 hover:border-white/20",
                    (!s.available || isBlocked) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-white">{s.label}</p>
                      <p className="text-sm text-slate-400">{s.start} – {s.end}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#FBB03B]">{formatCurrency(s.price)}</p>
                      {!s.available && <Badge className="mt-1">Unavailable</Badge>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <Button disabled={!selectedDate || !selectedSlot || isBlocked} onClick={() => setStep("details")}>
              Continue
            </Button>
          </>
        )}

        {step === "details" && (
          <Card className="space-y-4">
            <h3 className="font-semibold text-white">Personal & Match Details</h3>
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Mobile Number *</Label>
                <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile" />
                {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="address">Full Address *</Label>
              <Textarea id="address" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Complete address" />
              {errors.address && <p className="mt-1 text-xs text-red-400">{errors.address}</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="team">Number of Players / Team Name *</Label>
                <Input id="team" value={form.playersOrTeam} onChange={(e) => setForm({ ...form, playersOrTeam: e.target.value })} placeholder="e.g. 14 players or Team Lions" />
                {errors.playersOrTeam && <p className="mt-1 text-xs text-red-400">{errors.playersOrTeam}</p>}
              </div>
              <div>
                <Label htmlFor="matchType">Match Type</Label>
                <Select id="matchType" value={form.matchType} onChange={(e) => setForm({ ...form, matchType: e.target.value as MatchType })}>
                  {matchTypes.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="special">Special Request / Message</Label>
              <Textarea id="special" rows={3} value={form.specialRequest} onChange={(e) => setForm({ ...form, specialRequest: e.target.value })} placeholder="Any special requirements..." />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("slot")}>Back</Button>
              <Button onClick={() => { if (validateDetails()) setStep("payment"); }}>Continue to Payment</Button>
            </div>
          </Card>
        )}

        {step === "payment" && (
          <Card className="space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#F7931E]" />
              Advance Payment ({pct}%)
            </h3>
            <div className="p-4 rounded-xl bg-[#0b1219] border border-white/10 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Slot Price</span>
                <span className="text-white">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Advance ({pct}%)</span>
                <span className="text-[#FBB03B] font-semibold">{formatCurrency(advance)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-white/10 pt-2">
                <span className="text-slate-400">Balance at stadium</span>
                <span className="text-white">{formatCurrency(remaining)}</span>
              </div>
            </div>
            <div>
              <Label>Payment Status</Label>
              <Select
                value={form.paymentStatus}
                onChange={(e) => setForm({ ...form, paymentStatus: e.target.value as "paid" | "pending" })}
                className="mt-2"
              >
                <option value="paid">Advance Paid (Online)</option>
                <option value="pending">Pay at Stadium</option>
              </Select>
            </div>
            <div className="p-4 rounded-xl border border-dashed border-[#F7931E]/30 bg-[#F7931E]/5 text-center text-sm text-slate-400">
              Demo payment — in production, integrate Razorpay/UPI. Submitting marks advance as {form.paymentStatus === "paid" ? "paid" : "pending"}.
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("details")} disabled={submitting}>Back</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Pay {formatCurrency(advance)} & Submit Request
              </Button>
            </div>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-white/10 hidden lg:block">
          <MediaImage src={images.booking.ground} alt="Crossline cricket ground" fill className="object-cover" sizes="400px" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070d12]/90 to-transparent" />
          <p className="absolute bottom-4 left-4 right-4 text-sm font-medium text-white">Your match awaits at Crossline</p>
        </div>
        <Card className="sticky top-24">
          <h3 className="font-semibold text-white mb-4">Booking Summary</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500 shrink-0">Date</dt>
              <dd className="text-white text-right">{selectedDate || "—"}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Slot</dt>
              <dd className="text-white text-right">{slot?.label || "—"}</dd>
            </div>
            {form.playersOrTeam && (
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500 flex items-center gap-1"><Users className="h-3 w-3" /> Team</dt>
                <dd className="text-white text-right truncate max-w-[140px]">{form.playersOrTeam}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-slate-500">Advance</dt>
              <dd className="text-[#FBB03B] font-semibold">{total ? formatCurrency(advance) : "—"}</dd>
            </div>
          </dl>
          <div className="mt-6 pt-4 border-t border-white/10 space-y-2 text-xs text-slate-500">
            <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> Email on submission</p>
            <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {form.address ? "Address saved" : "Add your address"}</p>
            <p className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5" /> Approval email after review</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
