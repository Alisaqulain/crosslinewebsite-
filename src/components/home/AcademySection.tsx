"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { GraduationCap, Users } from "lucide-react";
import type { AcademyContent } from "@/lib/types";
import { MediaImage } from "@/components/media/MediaImage";
import { images } from "@/lib/media";

const levelColors: Record<string, string> = {
  beginner: "bg-[var(--cricket-green)]/10 text-[var(--cricket-green)]",
  intermediate: "bg-[var(--navy)]/10 text-[var(--navy)]",
  advanced: "bg-[var(--brand-red)]/10 text-[var(--brand-red)]",
  all: "bg-slate-100 text-slate-600",
};

export function AcademySection({ academy }: { academy: AcademyContent }) {
  return (
    <section id="academy" className="section-padding bg-white scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-12">
          <ScrollReveal>
            <SectionHeading
              badge="Sports Academy"
              title={academy.headline}
              description={academy.description}
              align="left"
            />
            <Link href="#contact">
              <Button size="lg">
                <GraduationCap className="h-5 w-5" />
                Join Academy
              </Button>
            </Link>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-[var(--shadow-lg)]">
              <MediaImage src={images.about.practiceNets} alt="Academy training at Crossline" fill className="object-cover" sizes="600px" />
            </div>
          </ScrollReveal>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {academy.programs.map((program, i) => (
            <ScrollReveal key={program.id} delay={i * 0.1}>
              <Card hover className="h-full">
                <span className={`inline-block text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full ${levelColors[program.level]}`}>
                  {program.level}
                </span>
                <h3 className="mt-4 font-bold text-[var(--navy)] text-lg">{program.title}</h3>
                <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">{program.description}</p>
                <p className="mt-4 text-sm font-semibold text-[var(--navy)] flex items-center gap-2">
                  <Users className="h-4 w-4 text-[var(--cricket-green)]" />
                  {program.duration}
                </p>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
