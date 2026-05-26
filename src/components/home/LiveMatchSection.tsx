"use client";

import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Calendar, Radio } from "lucide-react";
import type { LiveStream } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function LiveMatchSection({ stream }: { stream: LiveStream }) {
  const showLive = stream.enabled && stream.isLive;

  return (
    <section className="section-padding section-dark text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            badge="Live Match Center"
            title="Watch Live Cricket"
            description="Follow Crossline matches with our live stream and on-ground experience."
            light
          />
        </ScrollReveal>

        <div className="grid lg:grid-cols-3 gap-8">
          <ScrollReveal className="lg:col-span-2">
            <Card dark className="!p-0 overflow-hidden !shadow-2xl">
              <div className="flex items-center justify-between gap-4 p-4 border-b border-white/10">
                <h3 className="font-semibold flex items-center gap-2">
                  <Radio className="h-5 w-5 text-[var(--brand-red)]" />
                  {stream.title}
                </h3>
                {showLive && (
                  <span className="flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-400/40 px-3 py-1 text-xs font-bold text-red-300 uppercase">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    Live Now
                  </span>
                )}
              </div>
              {showLive && stream.youtubeUrl ? (
                <VideoEmbed src={stream.youtubeUrl} title={stream.title} className="rounded-none" />
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center bg-black/30 text-slate-400 gap-2">
                  <Radio className="h-12 w-12 opacity-30" />
                  <p>No live stream right now. Check back on match day.</p>
                </div>
              )}
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <Card dark className="h-full">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-[var(--cricket-green-light)]" />
                Upcoming Match
              </h3>
              {stream.upcomingTitle ? (
                <>
                  <p className="font-semibold text-white text-xl">{stream.upcomingTitle}</p>
                  {stream.upcomingDate && (
                    <p className="mt-2 text-sm text-slate-300">
                      {formatDate(stream.upcomingDate.split("T")[0])}
                    </p>
                  )}
                  <p className="mt-4 text-sm text-slate-400 leading-relaxed">
                    {stream.upcomingDescription ?? "Join us at Crossline Cricket Stadium for the next big match."}
                  </p>
                </>
              ) : (
                <p className="text-slate-400 text-sm">Tournament and league schedules will be announced here.</p>
              )}
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
