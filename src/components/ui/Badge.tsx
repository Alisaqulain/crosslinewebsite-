import { cn } from "@/lib/utils";
import { BookingStatus } from "@/lib/types";

const statusStylesDark: Record<BookingStatus, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  cancelled: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const statusStylesLight: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
};

export function Badge({
  status,
  children,
  className,
  theme = "light",
}: {
  status?: BookingStatus;
  children?: React.ReactNode;
  className?: string;
  theme?: "light" | "dark";
}) {
  const styles = theme === "light" ? statusStylesLight : statusStylesDark;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        status ? styles[status] : theme === "light" ? "bg-[var(--bg-alt)] text-[var(--navy)] border-[var(--border)]" : "bg-white/10 text-white/80 border-white/10",
        className
      )}
    >
      {children ?? status}
    </span>
  );
}
