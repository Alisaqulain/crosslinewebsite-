"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionCTA } from "@/components/ui/SectionCTA";
import { MediaImage } from "@/components/media/MediaImage";
import { images } from "@/lib/media";
import type { AcademyContent } from "@/lib/types";
import { GraduationCap } from "lucide-react";

export function AcademyPreview({ academy }: { academy: AcademyContent }) {
  return (
    <section className="section-padding bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-[var(--shadow-lg)]">
              <MediaImage src={images.about.practiceNets} alt="Academy" fill className="object-cover" sizes="600px" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--navy)]/70 to-transparent" />
              <div className="absolute bottom-6 left-6 glass-card rounded-xl px-4 py-3">
                <GraduationCap className="h-6 w-6 text-[var(--cricket-green-light)]" />
                <p className="text-sm font-bold text-white mt-1">Pro Coaching</p>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <SectionHeading badge="Sports Academy" title={academy.headline} description={academy.description} align="left" />
            <div className="grid gap-3 mb-8">
              {academy.programs.slice(0, 2).map((p) => (
                <div key={p.id} className="rounded-xl border border-[var(--border)] p-4 bg-[var(--bg-alt)]">
                  <p className="font-bold text-[var(--navy)]">{p.title}</p>
                  <p className="text-sm text-[var(--text-muted)] mt-1">{p.duration}</p>
                </div>
              ))}
            </div>
            <SectionCTA href="/academy" label="Join Academy" />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
