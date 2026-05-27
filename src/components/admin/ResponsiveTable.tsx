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
    return <p className="text-center py-8 text-slate-500">{emptyMessage}</p>;
  }

  return (
    <>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-slate-400">
              {columns.map((col) => (
                <th key={col.key} className={cn("p-4 font-medium", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={rowKey(row)} className="border-b border-white/5 hover:bg-white/[0.02]">
                {columns.map((col) => (
                  <td key={col.key} className={cn("p-4", col.className)}>
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
          <div key={rowKey(row)} className="rounded-xl bg-[#0b1219] p-4 space-y-3">
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between gap-4 text-sm">
                <span className="text-slate-500 shrink-0">{col.header}</span>
                <span className="text-white text-right">{col.render(row)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
