import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { localMedia } from "@/lib/media";

export function Logo({
  className,
  showText = true,
  size = "md",
}: {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-9 w-9",
    md: "h-11 w-11",
    lg: "h-16 w-16",
  };

  return (
    <Link href="/" className={cn("flex items-center gap-3 group", className)}>
      <div
        className={cn(
          "relative shrink-0 rounded-full bg-white p-0.5 shadow-md ring-2 ring-white/20 transition-all group-hover:ring-[#3A4EA1]/50",
          sizes[size]
        )}
      >
        <Image
          src={localMedia.logo}
          alt="Crossline Cricket Stadium & Sports Academy"
          fill
          className="object-contain rounded-full p-0.5"
          priority
        />
      </div>
      {showText && (
        <div className="hidden sm:block">
          <span className="block text-sm font-bold tracking-wide text-white leading-tight">Crossline</span>
          <span className="block text-[10px] font-medium text-[#F7931E] tracking-wide uppercase leading-snug">
            Cricket Stadium & Sports Academy
          </span>
        </div>
      )}
    </Link>
  );
}
