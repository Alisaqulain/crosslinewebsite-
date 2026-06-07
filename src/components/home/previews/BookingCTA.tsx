"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SectionCTA } from "@/components/ui/SectionCTA";
import { formatCurrency, formatTimeRange } from "@/lib/utils";
import type { TimeSlot } from "@/lib/types";
import { Calendar } from "lucide-react";

export function BookingCTA({ slots }: { slots: TimeSlot[] }) {
  const preview = slots.filter((s) => s.available).slice(0, 3);

  return (
    <section className="relative section-padding pitch-texture text-white overflow-hidden">
      <div className="absolute inset-0 hero-pattern opacity-50 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-12">
          <Calendar className="h-10 w-10 mx-auto text-[var(--cricket-green-light)] mb-4" />
          <h2 className="font-[family-name:var(--font-sora)] text-3xl sm:text-4xl font-extrabold">Reserve Your Match Slot</h2>
          <p className="mt-4 text-slate-200">Choose your session, submit your team details, and play at Crossline.</p>
        </ScrollReveal>
        <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-10">
          {preview.map((s, i) => (
            <ScrollReveal key={s.id} delay={i * 0.1}>
              <div className="glass-card rounded-2xl p-5 text-center hover:bg-white/15 transition-colors">
                <p className="font-bold">{s.label}</p>
                <p className="text-xs text-slate-300 mt-1">{formatTimeRange(s.start, s.end)}</p>
                <p className="mt-3 text-2xl font-extrabold text-[var(--cricket-green-light)]">{formatCurrency(s.price)}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <div className="text-center">
          <SectionCTA href="/booking" label="Book Your Slot Now" />
        </div>
      </div>
    </section>
  );
}
