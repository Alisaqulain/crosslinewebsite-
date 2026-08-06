"use client";

import { OwnerSelect } from "@/components/admin/OwnerSelect";
import { Label } from "@/components/ui/Input";
import type { StadiumOwner } from "@/lib/types";

/** Owner field locked to logged-in co-owner; main owner gets normal dropdown */
export function SessionOwnerSelect({
  owners,
  value,
  onChange,
  lockedOwnerId,
  lockedOwnerName,
  label = "Owner / partner",
  required,
  className,
}: {
  owners: StadiumOwner[];
  value: string;
  onChange: (ownerId: string) => void;
  lockedOwnerId?: string;
  lockedOwnerName?: string;
  label?: string;
  required?: boolean;
  className?: string;
}) {
  if (lockedOwnerId) {
    const name =
      lockedOwnerName ??
      owners.find((o) => o.id === lockedOwnerId)?.name ??
      lockedOwnerId;
    return (
      <div>
        <Label>{label}</Label>
        <p className={`text-sm font-semibold text-[var(--navy)] ${className ?? "mt-1"}`}>{name}</p>
        <p className="text-xs text-slate-500 mt-1">
          Logged in as this owner — all entries save under your name.
        </p>
      </div>
    );
  }

  return (
    <OwnerSelect
      owners={owners}
      value={value}
      onChange={onChange}
      label={label}
      required={required}
      className={className}
    />
  );
}
