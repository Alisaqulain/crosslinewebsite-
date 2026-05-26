"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Play, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CountUp } from "@/components/animations/CountUp";
import { stadiumInfo } from "@/lib/data";
import { videos } from "@/lib/media";
import { BackgroundVideo } from "@/components/media/BackgroundVideo";

const stats = [
  { label: "Bookings", end: 500, suffix: "+" },
  { label: "Matches Hosted", end: 120, suffix: "+" },
  { label: "Floodlit Sessions", end: 24, suffix: "/7" },
  { label: "Satisfaction", end: 98, suffix: "%" },
];

export function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      <BackgroundVideo src={videos.heroBackground} overlay="darker" />
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-[#ED1C24]/10 blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 h-96 w-96 rounded-full bg-[#39B54A]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#39B54A]/30 bg-[#39B54A]/10 px-4 py-1.5 text-xs font-semibold text-[#8CC63F] mb-6">
            <span className="h-2 w-2 rounded-full bg-[#39B54A] animate-pulse" />
            Premium Cricket Venue
          </span>
          <h1 className="font-[family-name:var(--font-sora)] text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-white">
            Book Your Cricket
            <br />
            <span className="gradient-text">Slot Online</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-xl leading-relaxed">
            {stadiumInfo.tagline}. Premium cricket ground in Muzaffarnagar — book sessions, pay advance, watch live matches & scores.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/booking">
              <Button size="lg">
                <Calendar className="h-5 w-5" />
                Book Now
              </Button>
            </Link>
            <Link href="/live">
              <Button size="lg" variant="outline">
                <Play className="h-5 w-5" />
                Watch Live Match
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 32, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="glass rounded-2xl p-4 sm:p-6 text-center"
            >
              <div className="text-2xl sm:text-3xl font-bold gradient-text font-[family-name:var(--font-sora)] tabular-nums">
                <CountUp
                  end={stat.end}
                  suffix={stat.suffix}
                  duration={2 + index * 0.15}
                />
              </div>
              <div className="mt-1 text-xs sm:text-sm text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12 flex items-center gap-2 text-sm text-slate-500"
        >
          <span>Explore features</span>
          <ChevronRight className="h-4 w-4 animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
}
