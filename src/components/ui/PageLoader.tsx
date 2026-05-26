"use client";

import { Loader2 } from "lucide-react";

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-[var(--brand-red)]" />
    </div>
  );
}
