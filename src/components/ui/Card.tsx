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
        "rounded-2xl border p-6 shadow-[var(--shadow)] transition-all duration-300",
        dark
          ? "border-white/10 bg-[var(--navy)] text-white"
          : "border-[var(--border)] bg-white",
        hover &&
          "hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] hover:border-[var(--cricket-green)]/25 hover:ring-1 hover:ring-[var(--cricket-green)]/10",
        className
      )}
    >
      {children}
    </div>
  );
}
