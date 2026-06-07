"use client";

import { Input } from "@/components/ui/Input";

/** Whole rupee amounts — avoids browser number input clamping (e.g. 3000 → 2999). */
export function AmountInput({
  value,
  onChange,
  className,
  placeholder,
  id,
}: {
  value: string | number;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  id?: string;
}) {
  const display = value === "" || value === 0 || value === "0" ? "" : String(value);

  return (
    <Input
      id={id}
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      className={className}
      value={display}
      onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
    />
  );
}

export function parseAmount(value: string | number | undefined | null): number {
  if (value === "" || value === undefined || value === null) return 0;
  const n = typeof value === "number" ? value : parseInt(String(value).replace(/[^\d]/g, ""), 10);
  return Number.isNaN(n) ? 0 : n;
}
