import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/8 bg-[#1a2736]/80 p-6",
        hover && "transition-all duration-300 hover:border-[#F7931E]/30 hover:shadow-lg hover:shadow-[#ED1C24]/5",
        className
      )}
    >
      {children}
    </div>
  );
}
