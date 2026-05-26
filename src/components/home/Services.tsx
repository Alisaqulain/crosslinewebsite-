"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Card } from "@/components/ui/Card";
import { Calendar, CreditCard, Radio, Trophy, Video, Wifi } from "lucide-react";

const services = [
  { icon: Calendar, title: "Online Slot Booking", desc: "Pick date & session, pay advance online, get instant email confirmation." },
  { icon: CreditCard, title: "Secure Advance Payment", desc: "Pay 20–30% advance to reserve. Balance at stadium on match day." },
  { icon: Radio, title: "Live Match Streaming", desc: "Watch unlisted YouTube live streams during tournaments and finals." },
  { icon: Trophy, title: "Live Scoring", desc: "Real-time scoreboard with runs, wickets, overs & ball-by-ball updates." },
  { icon: Video, title: "Floodlit Sessions", desc: "Evening & night slots under professional stadium floodlights." },
  { icon: Wifi, title: "Full Amenities", desc: "Parking, nets, changing rooms, refreshments & event support." },
];

export function Services() {
  return (
    <section className="py-20 bg-[#0b1219]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-sm font-semibold text-[#ED1C24] uppercase tracking-widest">Services</span>
          <h2 className="mt-2 font-[family-name:var(--font-sora)] text-3xl sm:text-4xl font-bold text-white">
            Everything You Need
          </h2>
        </ScrollReveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <ScrollReveal key={s.title} delay={i * 0.08}>
              <Card hover className="h-full">
                <s.icon className="h-8 w-8 text-[#F7931E]" />
                <h3 className="mt-4 font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
