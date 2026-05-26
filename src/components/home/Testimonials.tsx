"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Card } from "@/components/ui/Card";
import { Star } from "lucide-react";
import type { SiteContent } from "@/lib/types";

export function Testimonials({ items }: { items: SiteContent["testimonials"] }) {
  return (
    <section className="py-20 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-sm font-semibold text-[#8CC63F] uppercase tracking-widest">Testimonials</span>
          <h2 className="mt-2 font-[family-name:var(--font-sora)] text-3xl font-bold text-white">
            What Players Say
          </h2>
        </ScrollReveal>
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 0.1}>
              <Card className="h-full">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-[#FBB03B] text-[#FBB03B]" />
                  ))}
                </div>
                <p className="mt-4 text-slate-300 text-sm leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
