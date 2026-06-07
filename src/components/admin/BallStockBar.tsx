"use client";

import { Package } from "lucide-react";
import { getBallStock } from "@/lib/finance";
import type { AppStore } from "@/lib/types";

export function BallStockBar({ store }: { store: AppStore }) {
  const stock = getBallStock(store);
  if (stock.length === 0) {
    return (
      <p className="text-sm text-amber-700 mb-4">No ball stock — add purchases in Ball Stock first.</p>
    );
  }
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      {stock.map((s) => (
        <div
          key={s.quality}
          className="flex items-center gap-2 px-3 py-2 rounded-xl admin-subtle text-sm"
        >
          <Package className="h-4 w-4 text-[#F7931E]" />
          <span className="text-[var(--text-muted)]">{s.label}:</span>
          <span className={`font-bold ${s.remaining > 0 ? "text-[var(--navy)]" : "text-red-600"}`}>
            {s.remaining}
          </span>
          <span className="text-xs text-slate-400">available</span>
        </div>
      ))}
    </div>
  );
}

export function BallStockTable({ store }: { store: AppStore }) {
  const stock = getBallStock(store);
  if (stock.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)] mb-4">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-3 py-2">Ball type</th>
            <th className="px-3 py-2">Purchased</th>
            <th className="px-3 py-2">Used</th>
            <th className="px-3 py-2">Available</th>
          </tr>
        </thead>
        <tbody>
          {stock.map((s) => (
            <tr key={s.quality} className="border-t border-[var(--border)]">
              <td className="px-3 py-2 font-medium text-[var(--navy)]">{s.label}</td>
              <td className="px-3 py-2">{s.purchased}</td>
              <td className="px-3 py-2">{s.used}</td>
              <td className="px-3 py-2 font-bold text-[var(--navy)]">{s.remaining}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
