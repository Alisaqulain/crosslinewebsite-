"use client";

import { Button } from "@/components/ui/Button";
import { Pencil, Trash2 } from "lucide-react";

export function EntryActions({
  onEdit,
  onDelete,
  deleteLabel = "Delete",
}: {
  onEdit: () => void;
  onDelete: () => void;
  deleteLabel?: string;
}) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <Button size="sm" variant="ghost" onClick={onEdit} title="Edit" className="min-h-[36px] min-w-[36px] p-2">
        <Pencil className="h-4 w-4 text-[var(--navy)]" />
      </Button>
      <Button size="sm" variant="ghost" onClick={onDelete} title={deleteLabel} className="min-h-[36px] min-w-[36px] p-2">
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
}
