"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { Calendar, CheckCircle, CreditCard, Mail } from "lucide-react";

const steps = [
  { icon: Calendar, title: "Select Slot", desc: "Choose available date & time session from our live calendar." },
  { icon: CreditCard, title: "Pay Advance", desc: "Pay 20–30% advance securely to submit your booking request." },
  { icon: Mail, title: "Request Received", desc: "Get email confirmation that your request is pending admin review." },
  { icon: CheckCircle, title: "Admin Approval", desc: "Once approved, receive final confirmation email for your match." },
];

export function BookingProcess() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-sm font-semibold text-[#F7931E] uppercase tracking-widest">How It Works</span>
          <h2 className="mt-2 font-[family-name:var(--font-sora)] text-3xl sm:text-4xl font-bold text-white">
            Simple Booking Process
          </h2>
        </ScrollReveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <ScrollReveal key={step.title} delay={i * 0.12}>
              <div className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ED1C24] to-[#F7931E] shadow-lg shadow-[#ED1C24]/20">
                  <step.icon className="h-7 w-7 text-white" />
                </div>
                <span className="absolute top-0 right-1/2 translate-x-8 -translate-y-1 text-4xl font-black text-white/5 font-[family-name:var(--font-sora)]">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{step.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal className="text-center mt-10">
          <Link href="/booking">
            <Button size="lg">Start Booking</Button>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
