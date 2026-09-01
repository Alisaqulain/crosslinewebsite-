"use client";

import { useMemo, useState } from "react";
import { Input, Label, Select } from "@/components/ui/Input";
import type { AppStore, BallQuality } from "@/lib/types";
import { getAvailableBalls } from "@/lib/ball-stock";
import { getBallStock } from "@/lib/finance";
import { resolveBallQualities } from "@/lib/qualities";

/** Pick ball type from your Ball Stock list — no typing unless adding a new purchase type. */
export function BallQualitySelect({
  store,
  value,
  onChange,
  excludeBookingId,
  excludeUsageId,
  excludeOtherIncomeId,
  forPurchase,
  className,
  label,
}: {
  store: AppStore;
  value: BallQuality;
  onChange: (quality: BallQuality) => void;
  excludeBookingId?: string;
  excludeUsageId?: string;
  excludeOtherIncomeId?: string;
  /** On Ball Stock purchase — pick existing type or add a new name */
  forPurchase?: boolean;
  className?: string;
  label?: string;
}) {
  const [newTypeMode, setNewTypeMode] = useState(false);

  const options = useMemo(() => {
    const stock = getBallStock(store);
    const qualities = resolveBallQualities(store);
    const seen = new Set<string>();
    const list: { id: string; label: string; available: number }[] = [];

    for (const q of qualities) {
      if (!seen.has(q.id)) {
        seen.add(q.id);
        const row = stock.find((s) => s.quality === q.id);
        list.push({ id: q.id, label: q.label, available: row?.remaining ?? 0 });
      }
    }
    for (const row of stock) {
      if (!seen.has(row.quality)) {
        seen.add(row.quality);
        list.push({ id: row.quality, label: row.label, available: row.remaining });
      }
    }
    return list.sort((a, b) => a.label.localeCompare(b.label));
  }, [store]);

  const trimmed = value.trim();
  const available = trimmed
    ? getAvailableBalls(store, trimmed, excludeBookingId, excludeUsageId, excludeOtherIncomeId)
    : 0;

  const showNewTypeInput =
    forPurchase &&
    (newTypeMode || value === "__new__" || (trimmed && !options.some((o) => o.id === trimmed)));

  const hint = (() => {
    if (!trimmed || trimmed === "__new__") return null;
    if (forPurchase) {
      if (available > 0) {
        return (
          <>
            Currently <strong>{available}</strong> in stock — this purchase adds more
          </>
        );
      }
      if (options.some((o) => o.id === trimmed)) {
        return <span className="text-green-700">Adding stock for this ball type</span>;
      }
      return (
        <span className="text-green-700">
          New ball type &quot;{trimmed}&quot; — save purchase to add to stock
        </span>
      );
    }
    if (available > 0) {
      return (
        <>
          <strong>{available}</strong> available
        </>
      );
    }
    return (
      <span className="text-amber-700">
        No stock — add purchase in Ball Stock first
      </span>
    );
  })();

  if (showNewTypeInput) {
    return (
      <div>
        {label ? <Label>{label}</Label> : null}
        <Input
          value={trimmed === "__new__" ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="New ball name, e.g. Club red"
          className={className ?? (label ? "mt-1" : undefined)}
        />
        {options.length > 0 && (
          <button
            type="button"
            className="text-xs text-[var(--brand-red)] mt-1 font-medium"
            onClick={() => {
              setNewTypeMode(false);
              onChange(options[0]?.id ?? "");
            }}
          >
            Pick from existing list instead
          </button>
        )}
        {hint ? <p className="text-xs text-slate-500 mt-1">{hint}</p> : null}
      </div>
    );
  }

  const saleOptions = forPurchase
    ? options
    : options.filter((o) => {
        const avail = getAvailableBalls(
          store,
          o.id,
          excludeBookingId,
          excludeUsageId,
          excludeOtherIncomeId
        );
        return avail > 0 || o.id === trimmed;
      });

  return (
    <div>
      {label ? <Label>{label}</Label> : null}
      <Select
        value={trimmed || ""}
        onChange={(e) => {
          const next = e.target.value;
          if (next === "__new__") {
            setNewTypeMode(true);
            onChange("");
            return;
          }
          setNewTypeMode(false);
          onChange(next);
        }}
        className={className ?? (label ? "mt-1" : undefined)}
      >
        <option value="">— Select ball —</option>
        {saleOptions.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
            {!forPurchase ? ` (${getAvailableBalls(store, o.id, excludeBookingId, excludeUsageId, excludeOtherIncomeId)} available)` : o.available > 0 ? ` (${o.available} in stock)` : ""}
          </option>
        ))}
        {forPurchase && <option value="__new__">+ Add new ball type</option>}
      </Select>
      {hint ? <p className="text-xs text-slate-500 mt-1">{hint}</p> : null}
    </div>
  );
}
