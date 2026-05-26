"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Play, Target, Trophy, GraduationCap, Radio } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { localMedia, videos } from "@/lib/media";
import { BackgroundVideo } from "@/components/media/BackgroundVideo";
import type { LiveScore } from "@/lib/types";

const stats = [
  { icon: Target, label: "Professional Ground" },
  { icon: Radio, label: "Live Score" },
  { icon: GraduationCap, label: "Academy Training" },
  { icon: Trophy, label: "Tournament Ready" },
];

export function Hero({ liveScore }: { liveScore?: LiveScore }) {
  const miniScore = liveScore
    ? `${liveScore.teamA} vs ${liveScore.teamB}`
    : "Crossline XI vs Visitors";

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden floodlight-glow">
      <BackgroundVideo src={videos.heroBackground} overlay="custom" />
      <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
      <div className="absolute inset-0 hero-pattern" />
      <div className="absolute inset-0 circle-logo-pattern opacity-80" />

      <div className="absolute top-1/4 right-[10%] w-64 h-64 rounded-full bg-[var(--brand-red)]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-[5%] w-80 h-80 rounded-full bg-[var(--cricket-green)]/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white p-1.5 shadow-2xl ring-4 ring-white/20">
                <Image src={localMedia.logo} alt="Crossline" fill className="object-contain rounded-full" priority />
              </div>
              <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white">
                <span className="h-2 w-2 rounded-full bg-[var(--cricket-green-light)] animate-pulse" />
                Muzaffarnagar · NH 58
              </span>
            </div>

            <h1 className="font-[family-name:var(--font-sora)] text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.05] text-white tracking-tight">
              Crossline Cricket Stadium
              <span className="block mt-2 text-2xl sm:text-3xl xl:text-4xl font-bold text-white/90">
                &amp; Sports Academy
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-200 max-w-xl leading-relaxed">
              Book your ground, train like a pro, watch live matches, and host tournaments at Crossline.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/booking">
                <Button size="lg" className="btn-glow shadow-xl min-w-[160px]">
                  <Calendar className="h-5 w-5" />
                  Book Ground
                </Button>
              </Link>
              <Link href="/live">
                <Button
                  size="lg"
                  variant="outline"
                  className="!border-2 !border-white/40 !text-white hover:!bg-white/10 min-w-[180px]"
                >
                  <Play className="h-5 w-5" />
                  Watch Live Match
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-5 space-y-4"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="glass-card rounded-2xl p-4 float-slow">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--cricket-green-light)]">
                  Live Match
                </span>
                {liveScore?.matchStatus === "live" && (
                  <span className="live-pulse flex items-center gap-1 rounded-full bg-[var(--brand-red)] px-2 py-0.5 text-[10px] font-bold text-white">
                    LIVE
                  </span>
                )}
              </div>
              <p className="font-[family-name:var(--font-sora)] text-lg font-bold text-white">{miniScore}</p>
              {liveScore && (
                <p className="text-sm text-slate-300 mt-1 tabular-nums">
                  {liveScore.runs}/{liveScore.wickets} · {liveScore.overs}.{liveScore.balls} ov
                </p>
              )}
              <Link href="/live-score" className="mt-3 inline-block text-xs font-semibold text-[var(--cricket-green-light)] hover:text-white">
                Full scoreboard →
              </Link>
            </div>

            <div className="hidden lg:block relative h-48 w-48 mx-auto opacity-90">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/15 animate-[spin_30s_linear_infinite]" />
              <div className="absolute inset-4 rounded-full bg-white/5 backdrop-blur-sm" />
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {stats.map((s) => (
            <div key={s.label} className="glass-card rounded-xl p-4 sm:p-5 text-center hover:bg-white/12 transition-colors">
              <s.icon className="h-6 w-6 mx-auto text-[var(--cricket-green-light)] mb-2" />
              <p className="text-xs sm:text-sm font-semibold text-white">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
