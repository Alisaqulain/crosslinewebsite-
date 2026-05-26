"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Card } from "@/components/ui/Card";
import { Lightbulb, MapPin, Shield, Users } from "lucide-react";
import type { SiteContent } from "@/lib/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  turf: MapPin,
  lights: Lightbulb,
  nets: Users,
  amenities: Shield,
};

export function StadiumHighlights({ highlights }: { highlights: SiteContent["stadiumHighlights"] }) {
  return (
    <section className="py-20 border-y border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-sm font-semibold text-[#39B54A] uppercase tracking-widest">Why Crossline</span>
          <h2 className="mt-2 font-[family-name:var(--font-sora)] text-3xl sm:text-4xl font-bold text-white">
            Stadium Highlights
          </h2>
        </ScrollReveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item, i) => {
            const Icon = iconMap[item.icon] ?? Shield;
            return (
              <ScrollReveal key={item.title} delay={i * 0.1}>
                <Card hover className="h-full text-center p-6">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ED1C24]/20 to-[#39B54A]/20">
                    <Icon className="h-7 w-7 text-[#FBB03B]" />
                  </div>
                  <h3 className="mt-4 font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">{item.description}</p>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
