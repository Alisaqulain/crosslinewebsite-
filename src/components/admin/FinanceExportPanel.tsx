"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  patchAdmin,
  clearPeriodData as clearPeriodApi,
  previewClearPeriod as previewClearPeriodApi,
} from "@/lib/api-client";
import type { AppStore, SavedMonthlyReport } from "@/lib/types";
import type { ClearPeriodPreview } from "@/lib/clear-month";
import { reportRangeKey } from "@/lib/clear-month";
import {
  buildFinanceReport,
  downloadExcelReport,
  downloadPdfReport,
  getCalendarMonthRange,
  getDateRangeLabel,
} from "@/lib/finance-export";
import { AlertTriangle, Download, FileSpreadsheet, Loader2, Trash2 } from "lucide-react";

function defaultDateRange() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const from = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
  const to = now.toISOString().split("T")[0];
  return { from, to };
}

function resolveSavedReportRange(r: SavedMonthlyReport): { from: string; to: string; label: string } {
  if (r.from && r.to) {
    return { from: r.from, to: r.to, label: r.label || getDateRangeLabel(r.from, r.to) };
  }
  if (r.year && r.month) {
    return getCalendarMonthRange(r.year, r.month);
  }
  return { from: r.from ?? "", to: r.to ?? "", label: r.label };
}

export function FinanceExportPanel({
  store,
  onReportsChange,
  onStoreRefresh,
}: {
  store: AppStore;
  onReportsChange?: (reports: SavedMonthlyReport[]) => void;
  onStoreRefresh?: (store: AppStore) => void;
}) {
  const { toast } = useToast();
  const defaults = defaultDateRange();
  const [fromDate, setFromDate] = useState(defaults.from);
  const [toDate, setToDate] = useState(defaults.to);
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [clearPreview, setClearPreview] = useState<ClearPeriodPreview | null>(null);

  const dateInvalid = fromDate > toDate;
  const rangeLabel = dateInvalid ? "Invalid range" : getDateRangeLabel(fromDate, toDate);
  const report = dateInvalid
    ? null
    : buildFinanceReport(store, fromDate, toDate, rangeLabel);
  const rowCount = report ? report.incomeRows.length + report.expenseRows.length : 0;

  const savedReports = [...(store.savedMonthlyReports ?? [])]
    .map((r) => ({ ...r, ...resolveSavedReportRange(r) }))
    .sort((a, b) => b.from.localeCompare(a.from));

  const currentKey = reportRangeKey(fromDate, toDate);
  const hasSavedReport = savedReports.some((r) => reportRangeKey(r.from, r.to) === currentKey);

  const upsertSavedReport = async (kind: "pdf" | "excel") => {
    const existing = savedReports.find((r) => reportRangeKey(r.from, r.to) === currentKey);
    let next: SavedMonthlyReport[];

    if (existing) {
      next = (store.savedMonthlyReports ?? []).map((r) => {
        const range = resolveSavedReportRange(r);
        if (reportRangeKey(range.from, range.to) !== currentKey) return r;
        return {
          ...r,
          from: fromDate,
          to: toDate,
          label: rangeLabel,
          pdfGenerated: kind === "pdf" ? true : r.pdfGenerated,
          excelGenerated: kind === "excel" ? true : r.excelGenerated,
          createdAt: new Date().toISOString(),
        };
      });
    } else {
      const entry: SavedMonthlyReport = {
        id: `MR-${Date.now().toString(36).toUpperCase()}`,
        from: fromDate,
        to: toDate,
        label: rangeLabel,
        createdAt: new Date().toISOString(),
        pdfGenerated: kind === "pdf",
        excelGenerated: kind === "excel",
      };
      next = [entry, ...(store.savedMonthlyReports ?? [])];
    }

    await patchAdmin("savedMonthlyReports", next);
    onReportsChange?.(next);
  };

  const runExport = async (kind: "pdf" | "excel") => {
    if (dateInvalid || !report) {
      toast("Fix date range — From must be before To", "error");
      return;
    }
    if (rowCount === 0 && report.udhariRows.length === 0) {
      toast("No data in this date range", "error");
      return;
    }
    setExporting(kind);
    try {
      if (kind === "excel") await downloadExcelReport(report);
      else await downloadPdfReport(report);
      await upsertSavedReport(kind);
      toast(`${kind === "excel" ? "Excel" : "PDF"} downloaded — ${rangeLabel}`, "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Export failed", "error");
    } finally {
      setExporting(null);
    }
  };

  const redownload = async (saved: SavedMonthlyReport, kind: "pdf" | "excel") => {
    const r = resolveSavedReportRange(saved);
    const data = buildFinanceReport(store, r.from, r.to, r.label);
    setExporting(kind);
    try {
      if (kind === "excel") await downloadExcelReport(data);
      else await downloadPdfReport(data);
      toast(`${kind === "excel" ? "Excel" : "PDF"} downloaded — ${r.label}`, "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Export failed", "error");
    } finally {
      setExporting(null);
    }
  };

  const deleteSavedReport = async (id: string) => {
    if (!confirm("Remove this from saved reports list? (Does not delete stadium data)")) return;
    setDeletingId(id);
    try {
      const next = (store.savedMonthlyReports ?? []).filter((r) => r.id !== id);
      await patchAdmin("savedMonthlyReports", next);
      onReportsChange?.(next);
      toast("Removed from saved list", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Delete failed", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const loadClearPreview = async () => {
    if (dateInvalid) {
      toast("Fix date range first", "error");
      return;
    }
    try {
      const preview = await previewClearPeriodApi(fromDate, toDate);
      setClearPreview(preview);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Preview failed", "error");
    }
  };

  const runClearPeriod = async () => {
    if (dateInvalid) {
      toast("Fix date range first", "error");
      return;
    }
    if (!hasSavedReport) {
      toast("Download PDF or Excel first, then clear data", "error");
      return;
    }

    let preview = clearPreview;
    if (!preview) {
      try {
        preview = await previewClearPeriodApi(fromDate, toDate);
        setClearPreview(preview);
      } catch (err) {
        toast(err instanceof Error ? err.message : "Preview failed", "error");
        return;
      }
    }

    if (preview.totalRecords === 0) {
      toast("No records to clear for this date range", "error");
      return;
    }

    const msg = [
      `Clear ALL data from ${preview.label}?`,
      "",
      `This will permanently delete:`,
      `• ${preview.bookings} booking(s)`,
      `• ${preview.oldSessions} old session(s)`,
      `• ${preview.dieselExpenses} diesel entry(ies)`,
      `• ${preview.otherExpenses} other expense(s)`,
      `• ${preview.otherIncomes} other income(s)`,
      `• ${preview.financeEntries} manual finance entry(ies)`,
      `• ${preview.ballPurchases} ball purchase(s)`,
      `• ${preview.ballUsage} ball usage record(s)`,
      "",
      `Make sure you already downloaded PDF/Excel backup.`,
      `This cannot be undone.`,
    ].join("\n");

    if (!confirm(msg)) return;

    setClearing(true);
    try {
      const result = await clearPeriodApi(fromDate, toDate, true);
      onStoreRefresh?.(result.store);
      onReportsChange?.(result.store.savedMonthlyReports ?? []);
      setClearPreview(null);
      toast(`Data cleared for ${preview.label}`, "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Clear failed", "error");
    } finally {
      setClearing(false);
    }
  };

  const setThisMonth = () => {
    const d = defaultDateRange();
    setFromDate(d.from);
    setToDate(d.to);
    setClearPreview(null);
  };

  const setLastMonth = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last = new Date(now.getFullYear(), now.getMonth(), 0);
    setFromDate(`${first.getFullYear()}-${pad(first.getMonth() + 1)}-${pad(first.getDate())}`);
    setToDate(`${last.getFullYear()}-${pad(last.getMonth() + 1)}-${pad(last.getDate())}`);
    setClearPreview(null);
  };

  return (
    <Card className="mb-8 !p-5 border-2 border-[var(--navy)]/10">
      <h3 className="font-semibold text-[var(--navy)] mb-1 flex items-center gap-2">
        <Download className="h-5 w-5 text-[#F7931E]" />
        Download &amp; clear by date range
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        Pick <strong>From date</strong> and <strong>To date</strong>. Download full PDF/Excel report, then clear
        that period from the system.
      </p>

      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[160px]">
          <Label>From date</Label>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setClearPreview(null);
            }}
            className="mt-1"
          />
        </div>
        <div className="min-w-[160px]">
          <Label>To date</Label>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setClearPreview(null);
            }}
            className="mt-1"
          />
        </div>
        <div className="flex gap-2 pb-0.5">
          <Button size="sm" variant="ghost" onClick={setThisMonth}>
            This month
          </Button>
          <Button size="sm" variant="ghost" onClick={setLastMonth}>
            Last month
          </Button>
        </div>
        <div className="flex gap-2 ml-auto">
          <Button
            size="sm"
            variant="secondary"
            disabled={!!exporting || dateInvalid}
            onClick={() => runExport("excel")}
          >
            {exporting === "excel" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            Download Excel
          </Button>
          <Button size="sm" disabled={!!exporting || dateInvalid} onClick={() => runExport("pdf")}>
            {exporting === "pdf" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download PDF
          </Button>
        </div>
      </div>

      {dateInvalid && (
        <p className="text-xs text-red-600 mt-2">From date must be on or before To date.</p>
      )}

      {report && !dateInvalid && (
        <>
          <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-green-50 border border-green-200">
              <p className="text-xs text-green-700">Total earned</p>
              <p className="text-lg font-bold text-green-800">{formatCurrency(report.summary.totalIncome)}</p>
            </div>
            <div className="p-3 rounded-xl bg-red-50 border border-red-200">
              <p className="text-xs text-red-700">Total expense</p>
              <p className="text-lg font-bold text-red-800">{formatCurrency(report.summary.totalExpense)}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-600">Net profit</p>
              <p className={`text-lg font-bold ${report.summary.net >= 0 ? "text-green-700" : "text-red-700"}`}>
                {formatCurrency(report.summary.net)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-xs text-blue-700">Ball stock left</p>
              <p className="text-lg font-bold text-blue-800">{report.summary.totalBallsRemaining} balls</p>
            </div>
          </div>

          {report.ownerRows.some((o) => o.incomeTotal > 0 || o.expenseTotal > 0) && (
            <div className="mt-4 p-3 rounded-xl bg-violet-50 border border-violet-200">
              <p className="text-xs font-semibold text-violet-800 mb-2">Owner-wise ({rangeLabel})</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {report.ownerRows
                  .filter((o) => o.incomeTotal > 0 || o.expenseTotal > 0)
                  .map((o) => (
                    <span key={o.name} className="text-violet-900">
                      <strong>{o.name}</strong>: earned {formatCurrency(o.incomeTotal)}, expense{" "}
                      {formatCurrency(o.expenseTotal)}, net {formatCurrency(o.net)}
                    </span>
                  ))}
              </div>
            </div>
          )}

          <p className="text-xs text-slate-400 mt-3">
            {report.incomeRows.length} income · {report.expenseRows.length} expense ·{" "}
            {report.udhariRows.length} udhari · {fromDate} → {toDate}
            {hasSavedReport && " · ✓ Backup downloaded"}
          </p>
        </>
      )}

      {/* Clear period data */}
      <div className="mt-6 pt-5 border-t border-red-200/80">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red-800">Clear data — {rangeLabel}</h4>
            <p className="text-xs text-red-700/80 mt-1">
              Step 1: Download PDF or Excel for the dates above. Step 2: Delete all records between{" "}
              <strong>{formatDate(fromDate)}</strong> and <strong>{formatDate(toDate)}</strong> from the system.
            </p>
            {clearPreview && clearPreview.totalRecords > 0 && (
              <p className="text-xs text-red-600 mt-2 font-medium">
                Will delete: {clearPreview.bookings} bookings, {clearPreview.dieselExpenses} diesel,{" "}
                {clearPreview.otherExpenses} expenses, {clearPreview.otherIncomes} income,{" "}
                {clearPreview.ballPurchases} ball purchases, {clearPreview.ballUsage} ball usage —{" "}
                {clearPreview.totalRecords} total records
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-600"
                onClick={loadClearPreview}
                disabled={clearing || dateInvalid}
              >
                Preview what will be deleted
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="!bg-red-600 !text-white hover:!bg-red-700 border-red-700"
                disabled={clearing || !hasSavedReport || dateInvalid}
                onClick={runClearPeriod}
                title={!hasSavedReport ? "Download PDF or Excel first" : undefined}
              >
                {clearing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Clear data ({rangeLabel})
              </Button>
            </div>
            {!hasSavedReport && !dateInvalid && (
              <p className="text-[10px] text-amber-700 mt-2">
                Download PDF or Excel first — then clear button will unlock.
              </p>
            )}
          </div>
        </div>
      </div>

      {savedReports.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-[var(--navy)] mb-3">Downloaded backups</h4>
          <div className="space-y-2">
            {savedReports.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl admin-subtle"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--navy)]">{r.label}</p>
                  <p className="text-xs text-slate-400">
                    {r.from} → {r.to} · Downloaded {formatDate(r.createdAt.slice(0, 10))}
                    {r.excelGenerated && " · Excel"}
                    {r.pdfGenerated && " · PDF"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {r.excelGenerated && (
                    <Button size="sm" variant="secondary" disabled={!!exporting} onClick={() => redownload(r, "excel")}>
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                      Excel
                    </Button>
                  )}
                  {r.pdfGenerated && (
                    <Button size="sm" variant="secondary" disabled={!!exporting} onClick={() => redownload(r, "pdf")}>
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-500"
                    disabled={deletingId === r.id}
                    onClick={() => deleteSavedReport(r.id)}
                  >
                    {deletingId === r.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Remove from list
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
