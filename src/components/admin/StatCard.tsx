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
    <Card className="!p-4">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}12` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-[var(--text-muted)]">{label}</p>
          <p className="text-xl font-bold text-[var(--navy)] font-[family-name:var(--font-sora)] truncate">
            {value}
          </p>
          {trend && <p className="text-xs text-[var(--text-muted)] mt-0.5">{trend}</p>}
        </div>
      </div>
    </Card>
  );
}
