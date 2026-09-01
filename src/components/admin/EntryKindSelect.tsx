import { Label, Select } from "@/components/ui/Input";

export type EntryKind = "current" | "old";

export function isOldEntryId(id: string): boolean {
  return id.startsWith("OLD-");
}

export function EntryKindSelect({
  value,
  onChange,
  disabled,
  currentLabel = "Current (today / ongoing)",
  oldLabel = "Old (before system / backfill)",
}: {
  value: EntryKind;
  onChange: (value: EntryKind) => void;
  disabled?: boolean;
  currentLabel?: string;
  oldLabel?: string;
}) {
  return (
    <div>
      <Label>Entry type</Label>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as EntryKind)}
        disabled={disabled}
        className="mt-1"
      >
        <option value="current">{currentLabel}</option>
        <option value="old">{oldLabel}</option>
      </Select>
    </div>
  );
}
