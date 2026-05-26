"use client";

import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { MediaImage } from "@/components/media/MediaImage";
import type { GalleryItem } from "@/lib/types";

interface Props {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({ items, index, onClose, onNavigate }: Props) {
  const item = items[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate(Math.max(0, index - 1));
      if (e.key === "ArrowRight") onNavigate(Math.min(items.length - 1, index + 1));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [index, items.length, onClose, onNavigate]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/95 p-4" onClick={onClose}>
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>
      {index > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(index - 1);
          }}
          className="absolute left-4 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      {index < items.length - 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(index + 1);
          }}
          className="absolute right-4 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
      <div className="relative max-h-[85vh] max-w-5xl w-full aspect-video" onClick={(e) => e.stopPropagation()}>
        <MediaImage src={item.src} alt={item.alt} fill className="object-contain" sizes="100vw" />
        <p className="absolute bottom-0 left-0 right-0 p-4 text-center text-sm text-white bg-gradient-to-t from-black/80">
          {item.alt}
        </p>
      </div>
    </div>
  );
}
