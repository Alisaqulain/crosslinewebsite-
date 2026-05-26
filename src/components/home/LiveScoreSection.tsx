"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { LiveScoreboard } from "@/components/score/LiveScoreboard";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import type { LiveScore } from "@/lib/types";

export function LiveScoreSection({ score }: { score: LiveScore }) {
  return (
    <section id="live-score" className="section-padding bg-[var(--bg-alt)] scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            badge="Live Score"
            title="Match Scoreboard"
            description="Real-time scores updated during matches at Crossline Cricket Stadium."
          />
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <LiveScoreboard score={score} variant="premium" />
        </ScrollReveal>
      </div>
    </section>
  );
}
