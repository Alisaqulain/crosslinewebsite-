import type { ReactNode } from "react";

export function AdminSectionTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <h2 className="admin-section-title">{children}</h2>
      {action}
    </div>
  );
}
