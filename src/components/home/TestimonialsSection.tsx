"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Star } from "lucide-react";
import type { SiteContent } from "@/lib/types";

const typeLabels = {
  player: "Player",
  team: "Team",
  academy: "Academy Student",
};

export function TestimonialsSection({ items }: { items: SiteContent["testimonials"] }) {
  return (
    <section className="section-padding bg-[var(--bg-alt)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            badge="Testimonials"
            title="What Our Community Says"
            description="Reviews from players, teams, and academy families who train and play at Crossline."
          />
        </ScrollReveal>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 0.1}>
              <Card hover className="h-full">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-4 text-[var(--text-muted)] text-sm leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-6 pt-4 border-t border-[var(--border)]">
                  <p className="font-bold text-[var(--navy)]">{t.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{t.role}</p>
                  {t.type && (
                    <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-wide text-[var(--cricket-green)]">
                      {typeLabels[t.type]}
                    </span>
                  )}
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
