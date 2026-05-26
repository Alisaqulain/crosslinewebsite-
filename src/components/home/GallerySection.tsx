"use client";

import { useState } from "react";
import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaImage } from "@/components/media/MediaImage";
import { Lightbox } from "@/components/gallery/Lightbox";
import { Button } from "@/components/ui/Button";
import type { GalleryItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const categories = ["All", "Stadium", "Practice", "Match", "Tournament"];

export function GallerySection({ items }: { items: GalleryItem[] }) {
  const [filter, setFilter] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = filter === "All" ? items : items.filter((g) => g.category === filter);
  const imageItems = filtered.filter((g) => g.type === "image");

  return (
    <section className="section-padding bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            badge="Gallery"
            title="Stadium & Match Photos"
            description="Moments from our ground, academy sessions, league matches, and tournaments."
          />
        </ScrollReveal>
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold transition-colors",
                filter === cat
                  ? "bg-[var(--navy)] text-white"
                  : "bg-[var(--bg-alt)] text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {imageItems.slice(0, 8).map((item, i) => (
            <ScrollReveal key={item.id} delay={i * 0.04}>
              <button
                type="button"
                onClick={() => setLightboxIndex(imageItems.findIndex((g) => g.id === item.id))}
                className={cn(
                  "relative block w-full overflow-hidden rounded-xl ring-1 ring-[var(--border)] group cursor-zoom-in",
                  i === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-[4/3]" : "aspect-square"
                )}
              >
                <MediaImage
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="400px"
                />
                <div className="absolute inset-0 bg-[var(--navy)]/0 group-hover:bg-[var(--navy)]/30 transition-colors" />
              </button>
            </ScrollReveal>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/gallery">
            <Button variant="outline">View Full Gallery</Button>
          </Link>
        </div>
      </div>
      {lightboxIndex !== null && (
        <Lightbox
          items={imageItems}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </section>
  );
}
