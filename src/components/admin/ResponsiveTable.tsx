"use client";

import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
}

export function ResponsiveTable<T>({ columns, data, rowKey, emptyMessage = "No records" }: Props<T>) {
  if (data.length === 0) {
    return <p className="text-center py-10 text-[var(--text-muted)]">{emptyMessage}</p>;
  }

  return (
    <>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-[var(--text-muted)] bg-[var(--bg-alt)]/50">
              {columns.map((col) => (
                <th key={col.key} className={cn("p-4 font-semibold text-xs uppercase tracking-wide", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={rowKey(row)}
                className="border-b border-[var(--border)] hover:bg-[var(--bg-alt)]/60 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn("p-4 text-[var(--navy)]", col.className)}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {data.map((row) => (
          <div
            key={rowKey(row)}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-alt)]/50 p-4 space-y-3 shadow-sm"
          >
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between gap-4 text-sm">
                <span className="text-[var(--text-muted)] shrink-0 font-medium">{col.header}</span>
                <span className="text-[var(--navy)] text-right font-medium">{col.render(row)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
