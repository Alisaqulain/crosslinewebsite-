"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Target, Trophy, GraduationCap, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { localMedia, videos } from "@/lib/media";
import { BackgroundVideo } from "@/components/media/BackgroundVideo";

const stats = [
  { icon: Target, label: "Professional Ground" },
  { icon: GraduationCap, label: "Academy Training" },
  { icon: Trophy, label: "Tournament Ready" },
  { icon: Calendar, label: "Easy Booking" },
];

export function Hero() {
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
            className="lg:col-span-8"
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
              Book your ground, train like a pro, and host unforgettable cricket tournaments at Muzaffarnagar&apos;s premium stadium.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/booking">
                <Button size="lg" className="btn-glow shadow-xl min-w-[160px]">
                  <Calendar className="h-5 w-5" />
                  Book Ground
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="!border-2 !border-white/40 !text-white hover:!bg-white/10 min-w-[160px]"
                >
                  <Phone className="h-5 w-5" />
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-4 hidden lg:block"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="glass-card rounded-2xl p-6 border-l-4 border-[var(--cricket-green-light)]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--cricket-green-light)] mb-3">
                Stadium Facilities
              </p>
              <ul className="space-y-3 text-sm text-slate-200">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-red)]" />
                  Professional turf wicket
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-red)]" />
                  Floodlights for night cricket
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-red)]" />
                  Practice nets &amp; academy
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-red)]" />
                  Tournament-ready venue
                </li>
              </ul>
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
