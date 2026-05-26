import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "./Button";

export function SectionCTA({
  href,
  label,
  variant = "primary",
}: {
  href: string;
  label: string;
  variant?: "primary" | "outline" | "navy";
}) {
  return (
    <Link href={href}>
      <Button variant={variant} className="btn-glow group">
        {label}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>
    </Link>
  );
}
