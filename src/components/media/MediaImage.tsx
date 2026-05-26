"use client";

import Image, { ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { localMedia } from "@/lib/media";

type MediaImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
  fallbackSrc?: string;
};

export function MediaImage({
  src,
  alt,
  fallbackSrc = localMedia.logo,
  className,
  ...props
}: MediaImageProps) {
  const mountedRef = useRef(false);
  const attemptRef = useRef(0);
  const [displaySrc, setDisplaySrc] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    attemptRef.current = 0;
    setDisplaySrc(src);
    setFailed(false);

    return () => {
      mountedRef.current = false;
    };
  }, [src]);

  const handleError = () => {
    if (!mountedRef.current) return;

    attemptRef.current += 1;

    if (attemptRef.current === 1) {
      setDisplaySrc(fallbackSrc);
      return;
    }

    setFailed(true);
  };

  if (failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-[#1a2736] to-[#0b1219]",
          className
        )}
      >
        <span className="text-xs text-slate-500 px-4 text-center">{alt}</span>
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={displaySrc}
      alt={alt}
      className={className}
      unoptimized
      onError={handleError}
    />
  );
}
