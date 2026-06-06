"use client";

import { Label, Select } from "@/components/ui/Input";
import type { StadiumOwner } from "@/lib/types";

export function OwnerSelect({
  owners,
  value,
  onChange,
  className,
  required,
  label = "Owner / partner",
}: {
  owners: StadiumOwner[];
  value: string;
  onChange: (ownerId: string) => void;
  className?: string;
  required?: boolean;
  label?: string;
}) {
  if (owners.length === 0) {
    return (
      <p className="text-sm text-amber-700">
        Add owners first in{" "}
        <a href="/admin/owners" className="font-semibold underline">
          Admin → Owners
        </a>
      </p>
    );
  }

  return (
    <div>
      <Label>{label}</Label>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className ?? "mt-1"}
        required={required}
      >
        {!required && <option value="">— Select owner —</option>}
        {owners.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
