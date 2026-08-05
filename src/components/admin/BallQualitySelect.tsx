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
  excludeOtherIncomeId,
  forPurchase,
  className,
  placeholder = "e.g. Practice, Tonk, Match ball",
}: {
  store: AppStore;
  value: BallQuality;
  onChange: (quality: BallQuality) => void;
  excludeBookingId?: string;
  excludeUsageId?: string;
  excludeOtherIncomeId?: string;
  /** On Ball Stock purchase form — new types are allowed without existing stock */
  forPurchase?: boolean;
  className?: string;
  placeholder?: string;
}) {
  const trimmed = value.trim();
  const available = trimmed
    ? getAvailableBalls(store, trimmed, excludeBookingId, excludeUsageId, excludeOtherIncomeId)
    : 0;

  const hint = (() => {
    if (!trimmed) return null;
    if (forPurchase) {
      if (available > 0) {
        return (
          <>
            Currently <strong>{available}</strong> in stock for &quot;{trimmed}&quot; — this purchase
            will add more
          </>
        );
      }
      return (
        <span className="text-green-700">
          New ball type &quot;{trimmed}&quot; — enter quantity below and save to add stock
        </span>
      );
    }
    if (available > 0) {
      return (
        <>
          <strong>{available}</strong> in stock for &quot;{trimmed}&quot;
        </>
      );
    }
    return (
      <span className="text-amber-700">
        No stock for &quot;{trimmed}&quot; — add purchase in Ball Stock first
      </span>
    );
  })();

  return (
    <div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
      />
      {hint ? <p className="text-xs text-slate-500 mt-1">{hint}</p> : null}
    </div>
  );
}
