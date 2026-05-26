"use client";

import {
  Car, Droplets, Lamp, LayoutGrid, Monitor, Sofa, Target, Toilet, Trophy, Users,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { facilityItems } from "@/lib/data";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ground: Target, nets: LayoutGrid, lights: Lamp, seating: Sofa, parking: Car,
  changing: Users, water: Droplets, washroom: Toilet, scoreboard: Monitor, tournament: Trophy,
};

export function StadiumFacilities() {
  return (
    <section className="section-padding bg-[var(--bg-alt)]" id="facilities">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="accent-line mx-auto mb-4" />
          <SectionHeading
            badge="Facilities"
            title="Complete Stadium Facilities"
            description="Professional amenities for players, teams, and spectators."
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {facilityItems.map((item) => {
            const Icon = iconMap[item.icon] ?? Target;
            return (
              <div
                key={item.title}
                className="group rounded-2xl bg-white p-5 border border-[var(--border)] shadow-[var(--shadow)] hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] hover:border-[var(--cricket-green)]/40 transition-all duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--navy)] text-white group-hover:bg-[var(--brand-red)] transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="mt-3 h-1 w-10 rounded-full bg-[var(--cricket-green)]" />
                <h3 className="mt-3 font-bold text-[var(--navy)] text-sm leading-snug">{item.title}</h3>
                <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
