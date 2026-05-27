import { Card } from "@/components/ui/Card";
import { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color = "#e31837",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}) {
  return (
    <Card className="!p-5 hover:border-[var(--cricket-green)]/20">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--text-muted)]">{label}</p>
          <p className="mt-2 text-2xl font-bold text-[var(--navy)] font-[family-name:var(--font-sora)] truncate">
            {value}
          </p>
          {trend && <p className="mt-1 text-xs font-semibold text-[var(--cricket-green)]">{trend}</p>}
        </div>
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
    </Card>
  );
}
