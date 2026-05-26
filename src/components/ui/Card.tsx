import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  hover = false,
  dark = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  dark?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-6 shadow-[var(--shadow)]",
        dark
          ? "border-white/10 bg-[var(--navy)] text-white"
          : "border-[var(--border)] bg-white",
        hover &&
          "transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] hover:border-[var(--cricket-green)]/30",
        className
      )}
    >
      {children}
    </div>
  );
}
