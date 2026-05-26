"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionCTA } from "@/components/ui/SectionCTA";
import { LiveScoreboard } from "@/components/score/LiveScoreboard";
import type { LiveScore } from "@/lib/types";

export function LiveScorePreview({ score }: { score: LiveScore }) {
  return (
    <section className="section-padding bg-[var(--bg-alt)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-10">
          <div className="accent-line mx-auto mb-4" />
          <SectionHeading badge="Live Score" title="Stadium Scoreboard" description="Real-time runs, wickets, and ball-by-ball updates." />
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <LiveScoreboard score={score} variant="premium" />
        </ScrollReveal>
        <div className="text-center mt-10">
          <SectionCTA href="/live-score" label="Full Live Scoreboard" variant="navy" />
        </div>
      </div>
    </section>
  );
}
