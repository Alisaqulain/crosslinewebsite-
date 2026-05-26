"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { stadiumInfo, primaryPhone } from "@/lib/data";
import { MapPin, MessageCircle, Phone, Mail } from "lucide-react";

export function ContactCTA() {
  const whatsapp = `https://wa.me/${primaryPhone.tel.replace(/\D/g, "")}`;

  return (
    <section className="section-padding bg-[var(--navy)] text-white relative overflow-hidden">
      <div className="absolute inset-0 circle-logo-pattern opacity-20" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <h2 className="font-[family-name:var(--font-sora)] text-3xl sm:text-4xl font-extrabold">Ready to Play at Crossline?</h2>
          <p className="mt-4 text-slate-300 max-w-xl mx-auto">Book your ground, join the academy, or register for tournaments — we are here to help.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <Button size="lg" className="btn-glow">Contact Us</Button>
            </Link>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="!bg-[#25D366] hover:!bg-[#20bd5a]">
                <MessageCircle className="h-5 w-5" />
                WhatsApp
              </Button>
            </a>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-slate-400">
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--cricket-green-light)]" /> Muzaffarnagar</span>
            <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> {primaryPhone.phone}</span>
            <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> {stadiumInfo.email}</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
