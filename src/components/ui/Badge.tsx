import { cn } from "@/lib/utils";
import { BookingStatus } from "@/lib/types";

const statusStyles: Record<BookingStatus, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  cancelled: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

export function Badge({
  status,
  children,
  className,
}: {
  status?: BookingStatus;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        status ? statusStyles[status] : "bg-white/10 text-white/80 border-white/10",
        className
      )}
    >
      {children ?? status}
    </span>
  );
}
