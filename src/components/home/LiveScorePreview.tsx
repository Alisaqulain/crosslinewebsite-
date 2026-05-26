"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { LiveScoreboard } from "@/components/score/LiveScoreboard";
import type { LiveScore } from "@/lib/types";

export function LiveScorePreview({ score }: { score: LiveScore }) {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#ED1C24]/5 via-transparent to-[#39B54A]/5 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-sm font-semibold text-[#ED1C24] uppercase tracking-widest">Live Scoring</span>
          <h2 className="mt-2 font-[family-name:var(--font-sora)] text-3xl sm:text-4xl font-bold text-white">
            Live Scoreboard
          </h2>
          <p className="mt-3 text-slate-400">Real-time match updates from Crossline Cricket Stadium</p>
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <LiveScoreboard score={score} />
        </ScrollReveal>
        <p className="text-center mt-6">
          <Link href="/live" className="text-[#FBB03B] font-semibold hover:text-[#F7931E] text-sm">
            Watch live match & full scoreboard →
          </Link>
        </p>
      </div>
    </section>
  );
}
