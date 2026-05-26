"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionCTA } from "@/components/ui/SectionCTA";
import { MediaImage } from "@/components/media/MediaImage";
import type { GalleryItem } from "@/lib/types";

export function GalleryPreview({ items }: { items: GalleryItem[] }) {
  const images = items.filter((i) => i.type === "image").slice(0, 6);

  return (
    <section className="section-padding bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-12">
          <SectionHeading badge="Gallery" title="Stadium & Match Moments" description="Cricket action, training, and tournament memories at Crossline." />
        </ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((item, i) => (
            <ScrollReveal key={item.id} delay={i * 0.05}>
              <Link
                href="/gallery"
                className={`relative block overflow-hidden rounded-2xl ring-1 ring-[var(--border)] group ${
                  i === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-auto md:min-h-[320px]" : "aspect-square"
                }`}
              >
                <MediaImage src={item.src} alt={item.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="400px" />
                <div className="absolute inset-0 bg-[var(--navy)]/0 group-hover:bg-[var(--navy)]/30 transition-colors" />
              </Link>
            </ScrollReveal>
          ))}
        </div>
        <div className="text-center mt-10">
          <SectionCTA href="/gallery" label="View Full Gallery" variant="navy" />
        </div>
      </div>
    </section>
  );
}
