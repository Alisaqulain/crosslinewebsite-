"use client";

interface BackgroundVideoProps {
  src: string;
  poster?: string;
  className?: string;
  overlay?: "dark" | "darker";
}

export function BackgroundVideo({
  src,
  poster,
  className = "",
  overlay = "dark",
}: BackgroundVideoProps) {
  const overlayClass =
    overlay === "darker"
      ? "bg-gradient-to-b from-[#070d12]/95 via-[#070d12]/88 to-[#070d12]/95"
      : "bg-gradient-to-b from-[#070d12]/90 via-[#070d12]/75 to-[#070d12]/92";

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={poster}
        className="h-full w-full object-cover scale-105"
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className={`absolute inset-0 ${overlayClass}`} />
    </div>
  );
}
