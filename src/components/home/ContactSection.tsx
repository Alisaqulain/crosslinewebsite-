"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { stadiumInfo, primaryPhone } from "@/lib/data";
import { MapPin, MessageCircle, Phone } from "lucide-react";

export function ContactSection() {
  const whatsapp = `https://wa.me/${primaryPhone.tel.replace(/\D/g, "")}`;

  return (
    <section className="py-20 bg-gradient-to-b from-[#0b1219] to-[#070d12]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-[#141f2b]/80 p-8 sm:p-12 overflow-hidden relative">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#39B54A]/10 blur-3xl" />
          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <ScrollReveal>
              <span className="text-sm font-semibold text-[#39B54A] uppercase tracking-widest">Contact</span>
              <h2 className="mt-2 font-[family-name:var(--font-sora)] text-3xl font-bold text-white">
                Visit Crossline Cricket Stadium
              </h2>
              <p className="mt-4 text-slate-400 flex items-start gap-2">
                <MapPin className="h-5 w-5 shrink-0 text-[#F7931E] mt-0.5" />
                {stadiumInfo.address}
              </p>
              <p className="mt-2 text-slate-400 flex items-center gap-2">
                <Phone className="h-5 w-5 text-[#FBB03B]" />
                {primaryPhone.name}: {primaryPhone.phone}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.15} className="flex flex-wrap gap-3 lg:justify-end">
              <Link href="/contact">
                <Button size="lg">Contact Us</Button>
              </Link>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline">
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp
                </Button>
              </a>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
