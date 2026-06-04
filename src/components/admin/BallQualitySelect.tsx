"use client";

import { Input } from "@/components/ui/Input";
import type { AppStore, BallQuality } from "@/lib/types";
import { getAvailableBalls } from "@/lib/ball-stock";

/** Free-text ball quality (replaces dropdown). */
export function BallQualitySelect({
  store,
  value,
  onChange,
  excludeBookingId,
  excludeUsageId,
  className,
  placeholder = "e.g. Practice, Tonk, Match ball",
}: {
  store: AppStore;
  value: BallQuality;
  onChange: (quality: BallQuality) => void;
  excludeBookingId?: string;
  excludeUsageId?: string;
  className?: string;
  placeholder?: string;
}) {
  const trimmed = value.trim();
  const available = trimmed
    ? getAvailableBalls(store, trimmed, excludeBookingId, excludeUsageId)
    : 0;

  return (
    <div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
      />
      {trimmed ? (
        <p className="text-xs text-slate-500 mt-1">
          {available > 0 ? (
            <>
              <strong>{available}</strong> in stock for &quot;{trimmed}&quot;
            </>
          ) : (
            <span className="text-amber-700">
              No stock for &quot;{trimmed}&quot; — add purchase in Ball Stock first
            </span>
          )}
        </p>
      ) : null}
    </div>
  );
}
