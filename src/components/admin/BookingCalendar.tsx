"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/lib/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const STATUS_STYLE: Record<
  BookingStatus,
  { bg: string; text: string; border?: string }
> = {
  approved: { bg: "bg-[#1a73e8]", text: "text-white" },
  pending: { bg: "bg-[#f9ab00]", text: "text-[#3c2f00]" },
  rejected: { bg: "bg-slate-200", text: "text-slate-600" },
  cancelled: { bg: "bg-slate-200", text: "text-slate-500" },
};

function toDateKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleString("en-IN", { month: "long", year: "numeric" });
}

function shortMonth(year: number, month: number) {
  return new Date(year, month, 1).toLocaleString("en-IN", { month: "short" });
}

type BookingCalendarProps = {
  bookings: Booking[];
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
  onDateClick?: (date: string) => void;
  onAddBooking?: (date: string) => void;
};

export function BookingCalendar({
  bookings,
  year,
  month,
  onMonthChange,
  onDateClick,
  onAddBooking,
}: BookingCalendarProps) {
  const today = new Date();
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const byDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      if (b.status === "rejected" || b.status === "cancelled") continue;
      const list = map.get(b.date) ?? [];
      list.push(b);
      map.set(b.date, list);
    }
    for (const [, list] of map) {
      list.sort((a, b) => a.slotLabel.localeCompare(b.slotLabel));
    }
    return map;
  }, [bookings]);

  const monthTabs = useMemo(() => {
    const tabs: { year: number; month: number }[] = [];
    const base = new Date(year, month, 1);
    for (let i = -3; i <= 8; i++) {
      const d = new Date(base.getFullYear(), base.getMonth() + i, 1);
      tabs.push({ year: d.getFullYear(), month: d.getMonth() });
    }
    return tabs;
  }, [year, month]);

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result: { key: string; day: number; inMonth: boolean }[] = [];

    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startPad - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const pm = month === 0 ? 11 : month - 1;
      const py = month === 0 ? year - 1 : year;
      result.push({ key: toDateKey(py, pm, d), day: d, inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ key: toDateKey(year, month, d), day: d, inMonth: true });
    }
    while (result.length % 7 !== 0) {
      const next = result.length - startPad - daysInMonth + 1;
      const nm = month === 11 ? 0 : month + 1;
      const ny = month === 11 ? year + 1 : year;
      result.push({ key: toDateKey(ny, nm, next), day: next, inMonth: false });
    }
    return result;
  }, [year, month]);

  const prevMonth = () => {
    if (month === 0) onMonthChange(year - 1, 11);
    else onMonthChange(year, month - 1);
  };

  const nextMonth = () => {
    if (month === 11) onMonthChange(year + 1, 0);
    else onMonthChange(year, month + 1);
  };

  return (
    <div className="booking-cal rounded-2xl border border-[var(--border)] bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
        <button
          type="button"
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-600"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="font-semibold text-[var(--navy)] text-base">{monthLabel(year, month)}</h3>
        <button
          type="button"
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-600"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Month tabs — scrollable like Google Calendar */}
      <div className="flex gap-1 overflow-x-auto px-3 py-2 border-b border-slate-100 scrollbar-thin">
        {monthTabs.map((t) => {
          const active = t.year === year && t.month === month;
          return (
            <button
              key={`${t.year}-${t.month}`}
              type="button"
              onClick={() => onMonthChange(t.year, t.month)}
              className={cn(
                "shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors",
                active
                  ? "bg-[#1a73e8] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {shortMonth(t.year, t.month)}
            </button>
          );
        })}
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/80">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 auto-rows-fr min-h-[420px] md:min-h-[520px]">
        {cells.map((cell) => {
          const dayBookings = byDate.get(cell.key) ?? [];
          const isToday = cell.key === todayKey;
          const visible = dayBookings.slice(0, 3);
          const more = dayBookings.length - visible.length;

          return (
            <div
              key={cell.key}
              role="button"
              tabIndex={0}
              onClick={() => cell.inMonth && onDateClick?.(cell.key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && cell.inMonth) onDateClick?.(cell.key);
              }}
              className={cn(
                "min-h-[72px] md:min-h-[88px] border-b border-r border-slate-100 p-1 flex flex-col cursor-pointer transition-colors",
                !cell.inMonth && "bg-slate-50/60",
                cell.inMonth && "hover:bg-blue-50/40"
              )}
            >
              <div className="flex justify-center mb-0.5">
                <span
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                    isToday && cell.inMonth && "bg-[#1a73e8] text-white",
                    !isToday && cell.inMonth && "text-[var(--navy)]",
                    !cell.inMonth && "text-slate-300"
                  )}
                >
                  {cell.day}
                </span>
              </div>

              <div className="flex-1 space-y-0.5 overflow-hidden">
                {visible.map((b) => {
                  const style = STATUS_STYLE[b.status];
                  const phoneSnippet =
                    b.phone && b.phone.length > 4
                      ? b.phone.replace(/\s/g, "").slice(0, 10)
                      : "";
                  return (
                    <div
                      key={b.id}
                      title={`${b.customerName} · ${b.slotLabel}${b.phone ? ` · ${b.phone}` : ""} · ${b.status}`}
                      className={cn(
                        "truncate rounded px-1 py-0.5 text-[10px] md:text-[11px] font-medium leading-tight",
                        style.bg,
                        style.text
                      )}
                    >
                      {b.customerName}
                      {phoneSnippet ? ` ${phoneSnippet}…` : ""}
                      {b.walkIn ? " · W" : ""}
                    </div>
                  );
                })}
                {more > 0 && (
                  <p className="text-[10px] text-slate-500 font-medium px-0.5">+{more} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-4 py-3 border-t border-slate-100 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-6 rounded bg-[#1a73e8]" /> Approved
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-6 rounded bg-[#f9ab00]" /> Pending
        </span>
        <span className="text-slate-400">Click a date to see list · W = walk-in</span>
      </div>

      {/* FAB — add booking on today or selected */}
      {onAddBooking && (
        <button
          type="button"
          onClick={() => onAddBooking(todayKey)}
          className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#1a73e8] text-white shadow-lg shadow-blue-500/30 hover:bg-[#1557b0] transition-colors lg:absolute lg:bottom-4 lg:right-4"
          aria-label="Add walk-in booking"
        >
          <Plus className="h-7 w-7" />
        </button>
      )}
    </div>
  );
}
