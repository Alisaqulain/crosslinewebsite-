import { cn } from "@/lib/utils";

export function SectionHeading({
  badge,
  title,
  description,
  align = "center",
  light = false,
}: {
  badge?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  light?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl mb-12", align === "center" && "mx-auto text-center")}>
      {badge && (
        <span
          className={cn(
            "inline-block text-xs font-bold uppercase tracking-[0.2em] mb-3",
            light ? "text-[#7dd3fc]" : "text-[var(--cricket-green)]"
          )}
        >
          {badge}
        </span>
      )}
      <h2
        className={cn(
          "font-[family-name:var(--font-sora)] text-3xl sm:text-4xl font-bold tracking-tight",
          light ? "text-white" : "text-[var(--navy)]"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-lg leading-relaxed",
            light ? "text-slate-300" : "text-[var(--text-muted)]"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
