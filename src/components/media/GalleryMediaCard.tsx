"use client";

import { useState } from "react";
import { MediaImage } from "@/components/media/MediaImage";
import { Play, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryItem } from "@/lib/types";

interface GalleryMediaCardProps {
  item: GalleryItem;
  className?: string;
}

export function GalleryMediaCard({ item, className }: GalleryMediaCardProps) {
  const [lightbox, setLightbox] = useState(false);

  if (item.type === "video") {
    return (
      <>
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className={cn(
            "relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-white/10 group w-full text-left",
            className
          )}
        >
          <MediaImage
            src={item.poster || item.src}
            alt={item.alt}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-black/35 group-hover:bg-black/25 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ED1C24]/90">
              <Play className="h-6 w-6 text-white ml-0.5" fill="white" />
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
            <span className="text-xs text-[#FBB03B] font-medium">Video</span>
            <p className="text-white font-medium text-sm">{item.alt}</p>
          </div>
        </button>
        {lightbox && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90" onClick={() => setLightbox(false)}>
            <button
              type="button"
              className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full"
              onClick={() => setLightbox(false)}
            >
              <X className="h-6 w-6" />
            </button>
            <div className="w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
              <iframe src={item.src} title={item.alt} className="h-full w-full rounded-xl" allowFullScreen />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className={cn("relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-white/10 group", className)}>
      <MediaImage
        src={item.src}
        alt={item.alt}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
        <span className="text-xs text-[#FBB03B] font-medium">{item.category}</span>
        <p className="text-white font-medium">{item.alt}</p>
      </div>
    </div>
  );
}
