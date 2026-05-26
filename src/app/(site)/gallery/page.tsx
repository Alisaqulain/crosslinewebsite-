"use client";

import { useState } from "react";
import { PageHero } from "@/components/media/PageHero";
import { GalleryMediaCard } from "@/components/media/GalleryMediaCard";
import { Lightbox } from "@/components/gallery/Lightbox";
import { usePublicData } from "@/hooks/usePublicData";
import { images } from "@/lib/media";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { GalleryItem } from "@/lib/types";

export default function GalleryPage() {
  const { data, loading } = usePublicData();
  const [filter, setFilter] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const gallery = data?.gallery ?? [];
  const categories = ["All", ...Array.from(new Set(gallery.map((g) => g.category)))];
  const filtered = filter === "All" ? gallery : gallery.filter((g) => g.category === filter);
  const imageItems = filtered.filter((g) => g.type === "image") as GalleryItem[];

  return (
    <div>
      <PageHero
        badge="Gallery"
        title="Stadium Gallery"
        description="Photos from matches, events, and our world-class cricket facilities."
        image={images.gallery.hero}
      />
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-[#F7931E]" />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-10">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilter(cat)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                      filter === cat
                        ? "bg-gradient-to-r from-[#ED1C24] to-[#F7931E] text-white"
                        : "bg-white/5 text-slate-400 hover:bg-white/10"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((item, i) => (
                  <div
                    key={item.id}
                    role={item.type === "image" ? "button" : undefined}
                    tabIndex={item.type === "image" ? 0 : undefined}
                    onClick={() => {
                      if (item.type === "image") {
                        const idx = imageItems.findIndex((g) => g.id === item.id);
                        if (idx >= 0) setLightboxIndex(idx);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && item.type === "image") {
                        const idx = imageItems.findIndex((g) => g.id === item.id);
                        if (idx >= 0) setLightboxIndex(idx);
                      }
                    }}
                    className={item.type === "image" ? "cursor-zoom-in" : undefined}
                  >
                    <GalleryMediaCard
                      item={item}
                      className={
                        i === 0 && filter === "All"
                          ? "sm:col-span-2 sm:row-span-2 sm:aspect-[16/10] sm:min-h-[400px]"
                          : undefined
                      }
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
      {lightboxIndex !== null && (
        <Lightbox
          items={imageItems}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
}
