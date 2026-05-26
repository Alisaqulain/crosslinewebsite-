import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { localMedia } from "@/lib/media";

export function Logo({
  className,
  showText = true,
  size = "md",
  light = false,
}: {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  light?: boolean;
}) {
  const sizes = {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  return (
    <Link href="/" className={cn("flex items-center gap-3 group", className)}>
      <div
        className={cn(
          "relative shrink-0 rounded-full bg-white p-1 shadow-md ring-2 transition-all",
          light ? "ring-white/30 group-hover:ring-white/60" : "ring-[var(--navy)]/10 group-hover:ring-[var(--brand-red)]/40",
          sizes[size]
        )}
      >
        <Image
          src={localMedia.logo}
          alt="Crossline Cricket Stadium & Sports Academy"
          fill
          className="object-contain rounded-full"
          priority
        />
      </div>
      {showText && (
        <div className="hidden sm:block">
          <span
            className={cn(
              "block text-sm font-bold tracking-wide leading-tight",
              light ? "text-white" : "text-[var(--navy)]"
            )}
          >
            Crossline
          </span>
          <span
            className={cn(
              "block text-[10px] font-semibold tracking-wide uppercase leading-snug",
              light ? "text-white/80" : "text-[var(--cricket-green)]"
            )}
          >
            Cricket Stadium & Sports Academy
          </span>
        </div>
      )}
    </Link>
  );
}
