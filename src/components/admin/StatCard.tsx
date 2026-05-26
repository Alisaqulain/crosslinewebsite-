import { Card } from "@/components/ui/Card";
import { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color = "#F7931E",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-white font-[family-name:var(--font-sora)]">{value}</p>
          {trend && <p className="mt-1 text-xs text-[#39B54A]">{trend}</p>}
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
    </Card>
  );
}
