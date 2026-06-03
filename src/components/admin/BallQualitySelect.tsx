"use client";

import { Select } from "@/components/ui/Input";
import type { AppStore, BallQuality } from "@/lib/types";
import { getBallQualityOptions } from "@/lib/ball-stock";

export function BallQualitySelect({
  store,
  value,
  onChange,
  excludeBookingId,
  excludeUsageId,
  className,
}: {
  store: AppStore;
  value: BallQuality;
  onChange: (quality: BallQuality) => void;
  excludeBookingId?: string;
  excludeUsageId?: string;
  className?: string;
}) {
  const options = getBallQualityOptions(store, excludeBookingId, excludeUsageId);

  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value as BallQuality)}
      className={className}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label} — {opt.available} available{opt.disabled ? " (out of stock)" : ""}
        </option>
      ))}
    </Select>
  );
}
