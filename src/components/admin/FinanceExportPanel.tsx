"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/utils";
import type { AppStore } from "@/lib/types";
import {
  buildFinanceReport,
  downloadExcelReport,
  downloadPdfReport,
  getReportDateRange,
} from "@/lib/finance-export";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";

export function FinanceExportPanel({ store }: { store: AppStore }) {
  const { toast } = useToast();
  const [months, setMonths] = useState(1);
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);

  const range = getReportDateRange(months);
  const report = buildFinanceReport(store, range.from, range.to, range.label);
  const rowCount = report.incomeRows.length + report.expenseRows.length;

  const runExport = async (kind: "pdf" | "excel") => {
    if (rowCount === 0 && report.udhariRows.length === 0) {
      toast("No data in this period", "error");
      return;
    }
    setExporting(kind);
    try {
      if (kind === "excel") {
        await downloadExcelReport(report);
      } else {
        await downloadPdfReport(report);
      }
      toast(`${kind === "excel" ? "Excel" : "PDF"} downloaded`, "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Export failed", "error");
    } finally {
      setExporting(null);
    }
  };

  return (
    <Card className="mb-8 !p-5 border-2 border-[var(--navy)]/10">
      <h3 className="font-semibold text-[var(--navy)] mb-1 flex items-center gap-2">
        <Download className="h-5 w-5 text-[#F7931E]" />
        Download report (PDF / Excel)
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        Separate sheets: Income (with session price / received / udhari), Expenses, and Udhari pending.
      </p>
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[180px]">
          <Label>Period</Label>
          <Select value={months} onChange={(e) => setMonths(Number(e.target.value))} className="mt-1">
            {[1, 2, 3, 4, 5, 6, 9, 12].map((n) => (
              <option key={n} value={n}>
                {n === 1 ? "This month only" : `Last ${n} months`}
              </option>
            ))}
          </Select>
        </div>
        <div className="text-sm text-slate-600 pb-1">
          <p>
            Income {formatCurrency(report.summary.totalIncome)} · Expense{" "}
            {formatCurrency(report.summary.totalExpense)} · Net{" "}
            <span className={report.summary.net >= 0 ? "text-green-700" : "text-red-600"}>
              {formatCurrency(report.summary.net)}
            </span>
            {" · "}
            Udhari {formatCurrency(report.summary.totalUdhari)}
          </p>
          <p className="text-xs text-slate-400">
            {report.incomeRows.length} income · {report.expenseRows.length} expense ·{" "}
            {report.udhariRows.length} udhari · {range.from} → {range.to}
          </p>
        </div>
        <div className="flex gap-2 ml-auto">
          <Button
            size="sm"
            variant="secondary"
            disabled={!!exporting}
            onClick={() => runExport("excel")}
          >
            {exporting === "excel" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            Excel
          </Button>
          <Button size="sm" disabled={!!exporting} onClick={() => runExport("pdf")}>
            {exporting === "pdf" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            PDF
          </Button>
        </div>
      </div>
    </Card>
  );
}
