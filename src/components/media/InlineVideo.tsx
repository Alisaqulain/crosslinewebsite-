"use client";

import { useState } from "react";
import { MediaImage } from "@/components/media/MediaImage";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineVideoProps {
  mp4?: string;
  youtube?: string;
  poster: string;
  title: string;
  className?: string;
}

export function InlineVideo({ mp4, youtube, poster, title, className }: InlineVideoProps) {
  const [playing, setPlaying] = useState(false);

  if (youtube && playing) {
    return (
      <div className={cn("relative aspect-video rounded-2xl overflow-hidden ring-1 ring-white/10", className)}>
        <iframe
          src={`${youtube}?autoplay=1`}
          title={title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (mp4 && playing) {
    return (
      <div className={cn("relative aspect-video rounded-2xl overflow-hidden ring-1 ring-white/10", className)}>
        <video src={mp4} controls autoPlay className="h-full w-full object-cover" poster={poster}>
          <track kind="captions" />
        </video>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className={cn(
        "group relative aspect-video w-full rounded-2xl overflow-hidden ring-1 ring-white/10 text-left",
        className
      )}
    >
      <MediaImage src={poster} alt={title} fill className="object-cover transition-transform group-hover:scale-105" sizes="800px" />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ED1C24]/90 shadow-lg shadow-[#ED1C24]/30 group-hover:scale-110 transition-transform">
          <Play className="h-7 w-7 text-white ml-1" fill="white" />
        </span>
        <p className="mt-4 text-sm font-semibold text-white px-4 text-center">{title}</p>
      </div>
    </button>
  );
}
