"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionCTA } from "@/components/ui/SectionCTA";
import { MediaImage } from "@/components/media/MediaImage";
import { CheckCircle } from "lucide-react";
import { images } from "@/lib/media";
import type { SiteContent } from "@/lib/types";

export function AboutPreview({ content }: { content: SiteContent }) {
  return (
    <section className="section-padding bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal direction="left">
            <div className="accent-line mb-4" />
            <SectionHeading
              badge="About Crossline"
              title={content.aboutTitle}
              description={content.aboutDescription}
              align="left"
            />
            <ul className="space-y-3 mb-8">
              {content.aboutPoints.slice(0, 3).map((p) => (
                <li key={p} className="flex gap-3 text-[var(--text-muted)]">
                  <CheckCircle className="h-5 w-5 shrink-0 text-[var(--cricket-green)]" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <SectionCTA href="/about" label="Learn More About Us" />
          </ScrollReveal>
          <ScrollReveal direction="right" delay={0.15}>
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-[var(--shadow-lg)] ring-1 ring-[var(--border)] group">
              <MediaImage src={images.about.story} alt="Crossline Stadium" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="600px" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy)]/60 to-transparent" />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
