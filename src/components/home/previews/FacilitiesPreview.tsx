"use client";

import {
  Car, Droplets, Lamp, LayoutGrid, Monitor, Sofa, Target, Toilet, Trophy, Users,
} from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionCTA } from "@/components/ui/SectionCTA";
import { facilityItems } from "@/lib/data";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ground: Target, nets: LayoutGrid, lights: Lamp, seating: Sofa, parking: Car,
  changing: Users, water: Droplets, washroom: Toilet, scoreboard: Monitor, tournament: Trophy,
};

export function FacilitiesPreview() {
  const items = facilityItems.slice(0, 6);

  return (
    <section className="section-padding bg-[var(--bg-alt)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-12">
          <div className="accent-line mx-auto mb-4" />
          <SectionHeading badge="Facilities" title="World-Class Stadium Amenities" description="Everything teams and families need for a complete match-day experience." />
        </ScrollReveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const Icon = iconMap[item.icon] ?? Target;
            return (
              <ScrollReveal key={item.title} delay={i * 0.06}>
                <div className="group h-full rounded-2xl bg-white p-6 shadow-[var(--shadow)] border border-[var(--border)] hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] transition-all duration-300">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--navy)] text-white group-hover:bg-[var(--brand-red)] transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="mt-4 h-1 w-8 rounded-full bg-[var(--cricket-green)]" />
                  <h3 className="mt-3 font-bold text-[var(--navy)]">{item.title}</h3>
                  <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">{item.description}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
        <div className="text-center mt-12">
          <SectionCTA href="/about" label="View All Facilities" variant="navy" />
        </div>
      </div>
    </section>
  );
}
