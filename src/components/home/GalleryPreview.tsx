"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { MediaImage } from "@/components/media/MediaImage";
import type { GalleryItem } from "@/lib/types";

export function GalleryPreview({ items }: { items: GalleryItem[] }) {
  const preview = items.filter((i) => i.type === "image").slice(0, 6);

  return (
    <section className="py-20 bg-[#0b1219]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <span className="text-sm font-semibold text-[#FBB03B] uppercase tracking-widest">Gallery</span>
            <h2 className="mt-2 font-[family-name:var(--font-sora)] text-3xl font-bold text-white">Stadium & Match Photos</h2>
          </div>
          <Link href="/gallery" className="text-[#FBB03B] font-semibold text-sm hover:text-[#F7931E]">
            View full gallery →
          </Link>
        </ScrollReveal>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
          {preview.map((item, i) => (
            <ScrollReveal key={item.id} delay={i * 0.06}>
              <Link
                href="/gallery"
                className={`relative block overflow-hidden rounded-xl ring-1 ring-white/10 group ${
                  i === 0 ? "col-span-2 row-span-2 aspect-[16/10]" : "aspect-square"
                }`}
              >
                <MediaImage
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width:768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
