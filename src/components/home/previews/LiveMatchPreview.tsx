"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionCTA } from "@/components/ui/SectionCTA";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import type { LiveStream } from "@/lib/types";
import { Radio } from "lucide-react";

export function LiveMatchPreview({ stream }: { stream: LiveStream }) {
  const showLive = stream.enabled && stream.isLive;

  return (
    <section className="section-dark section-padding">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading badge="Live Cricket" title="Watch Matches Live" description="Stream Crossline tournaments and league games from anywhere." light />
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <div className="flex items-center justify-between p-4 bg-black/40 border-b border-white/10">
              <span className="font-semibold flex items-center gap-2">
                <Radio className="h-5 w-5 text-[var(--brand-red)]" />
                {stream.title}
              </span>
              {showLive && (
                <span className="live-pulse rounded-full bg-[var(--brand-red)] px-3 py-1 text-xs font-bold">LIVE NOW</span>
              )}
            </div>
            {showLive && stream.youtubeUrl ? (
              <VideoEmbed src={stream.youtubeUrl} title={stream.title} className="rounded-none" />
            ) : (
              <div className="aspect-video flex items-center justify-center bg-[var(--navy-deep)] text-slate-500">
                Stream starts on match day
              </div>
            )}
          </div>
          <div className="text-center mt-8">
            <SectionCTA href="/live" label="Watch Live Match" />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
