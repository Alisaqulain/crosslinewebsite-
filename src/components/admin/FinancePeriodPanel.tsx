"use client";

import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import type { PeriodFinance } from "@/lib/finance";
import {
  TrendingUp,
  TrendingDown,
  Fuel,
  Package,
  Globe,
  UserRound,
  IndianRupee,
} from "lucide-react";

function Row({
  label,
  value,
  positive,
  icon,
}: {
  label: string;
  value: number;
  positive?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-[var(--border)] last:border-0">
      <span className="text-sm text-[var(--text-muted)] flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span
        className={`text-sm font-semibold tabular-nums ${
          positive === true ? "text-green-600" : positive === false ? "text-red-600" : "text-[var(--navy)]"
        }`}
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}

export function FinancePeriodPanel({
  period,
  highlight,
}: {
  period: PeriodFinance;
  highlight?: boolean;
}) {
  return (
    <Card
      className={
        highlight
          ? "!p-5 ring-2 ring-[var(--brand-red)]/20 border-[var(--brand-red)]/30"
          : "!p-5"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
        <div>
          <h3 className="font-semibold text-[var(--navy)] font-[family-name:var(--font-sora)]">
            {period.label}
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {period.approvedBookings} approved booking
            {period.approvedBookings !== 1 ? "s" : ""}
            {period.walkInBookings > 0 || period.onlineBookings > 0
              ? ` · ${period.onlineBookings} online, ${period.walkInBookings} walk-in`
              : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--text-muted)]">Net profit / loss</p>
          <p
            className={`text-xl font-bold ${
              period.netProfit >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatCurrency(period.netProfit)}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-green-700 mb-2 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            Income
          </p>
          <Row
            label="Online bookings (website)"
            value={period.income.onlineBooking}
            positive
            icon={<Globe className="h-3.5 w-3.5" />}
          />
          <Row
            label="Walk-in / direct matches"
            value={period.income.walkInBooking}
            positive
            icon={<UserRound className="h-3.5 w-3.5" />}
          />
          <Row label="Other manual income" value={period.income.manual} positive />
          <Row label="Total income" value={period.income.total} positive />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-red-700 mb-2 flex items-center gap-1">
            <TrendingDown className="h-3.5 w-3.5" />
            Expenses
          </p>
          <Row
            label="Diesel"
            value={period.expense.diesel}
            positive={false}
            icon={<Fuel className="h-3.5 w-3.5" />}
          />
          <Row
            label="Ball purchase"
            value={period.expense.ballPurchase}
            positive={false}
            icon={<Package className="h-3.5 w-3.5" />}
          />
          <Row label="Other manual expense" value={period.expense.manual} positive={false} />
          <Row label="Total expense" value={period.expense.total} positive={false} />
        </div>
      </div>
    </Card>
  );
}

export function FinanceAllTimeStrip({
  income,
  expense,
  net,
  walkIn,
  online,
  diesel,
  balls,
}: {
  income: number;
  expense: number;
  net: number;
  walkIn: number;
  online: number;
  diesel: number;
  balls: number;
}) {
  return (
    <Card className="!p-5 mb-8">
      <h3 className="font-semibold text-[var(--navy)] mb-4 flex items-center gap-2">
        <IndianRupee className="h-5 w-5 text-[#F7931E]" />
        All-time summary
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total income", value: income, color: "text-green-600" },
          { label: "Total expense", value: expense, color: "text-red-600" },
          { label: "Net profit", value: net, color: net >= 0 ? "text-green-600" : "text-red-600" },
          { label: "Online match income", value: online, color: "text-[var(--navy)]" },
          { label: "Walk-in match income", value: walkIn, color: "text-[var(--navy)]" },
          { label: "Diesel expense", value: diesel, color: "text-red-600" },
          { label: "Ball expense", value: balls, color: "text-red-600" },
        ].map((item) => (
          <div key={item.label} className="p-3 rounded-xl admin-subtle">
            <p className="text-xs text-[var(--text-muted)]">{item.label}</p>
            <p className={`text-lg font-bold mt-1 ${item.color}`}>{formatCurrency(item.value)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
