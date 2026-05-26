"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaImage } from "@/components/media/MediaImage";
import { CheckCircle } from "lucide-react";
import { images } from "@/lib/media";
import type { SiteContent } from "@/lib/types";

export function AboutSection({ content }: { content: SiteContent }) {
  return (
    <section id="about" className="section-padding bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <ScrollReveal direction="left">
            <SectionHeading
              badge="About Crossline"
              title={content.aboutTitle}
              description={content.aboutDescription}
              align="left"
            />
            <ul className="space-y-4">
              {content.aboutPoints.map((point) => (
                <li key={point} className="flex gap-3 text-[var(--text-muted)]">
                  <CheckCircle className="h-5 w-5 shrink-0 text-[var(--cricket-green)] mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
          <ScrollReveal direction="right" delay={0.15}>
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-[var(--shadow-lg)] ring-1 ring-[var(--border)]">
              <MediaImage src={images.about.story} alt="Crossline Cricket Stadium ground" fill className="object-cover" sizes="600px" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy)]/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white font-semibold text-lg">Professional Ground · Academy · Tournaments</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
