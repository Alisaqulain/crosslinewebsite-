"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, X } from "lucide-react";

export function AdminCollapsibleForm({
  open,
  onOpenChange,
  title,
  addLabel,
  editing,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  addLabel: string;
  editing?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) {
    return (
      <Button type="button" onClick={() => onOpenChange(true)} className="mb-6 min-h-[44px]">
        <Plus className="h-4 w-4" />
        {addLabel}
      </Button>
    );
  }

  return (
    <Card className="mb-6 border-[var(--brand-red)]/20 ring-1 ring-[var(--brand-red)]/10">
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="text-base font-semibold text-[var(--navy)]">
          {editing ? `Edit — ${title}` : title}
        </h3>
        {!editing && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
            Close
          </Button>
        )}
      </div>
      {children}
      {footer}
    </Card>
  );
}
