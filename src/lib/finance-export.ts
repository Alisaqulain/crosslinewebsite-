import type { AppStore, OtherIncome } from "./types";
import { getOwnerName } from "./owners";
import { completedMatches, matchAmountReceived } from "./matches";
import { bookingAmountReceived, getStoreUdhariSummary } from "./udhari";
import { getQualityLabel } from "./qualities";
import { formatDate } from "./utils";

function ballPricePerUnitFromIncome(i: OtherIncome): number {
  if (i.pricePerBall && i.pricePerBall > 0) return i.pricePerBall;
  if (i.ballsSold && i.ballsSold > 0) return Math.round(i.amount / i.ballsSold);
  return i.amount;
}

function fmtDate(iso: string): string {
  try {
    return formatDate(iso);
  } catch {
    return iso;
  }
}

export interface IncomeExportRow {
  date: string;
  dateLabel: string;
  category: string;
  description: string;
  customer: string;
  session: string;
  sessionPrice: number | "";
  received: number | "";
  udhari: number | "";
  owner: string;
}

export interface ExpenseExportRow {
  date: string;
  dateLabel: string;
  category: string;
  description: string;
  amount: number;
  owner: string;
}

export interface UdhariExportRow {
  date: string;
  dateLabel: string;
  customer: string;
  session: string;
  type: string;
  sessionPrice: number;
  received: number;
  udhari: number;
  owner: string;
}

export interface FinanceReportData {
  rangeLabel: string;
  incomeRows: IncomeExportRow[];
  expenseRows: ExpenseExportRow[];
  udhariRows: UdhariExportRow[];
  summary: {
    totalIncome: number;
    totalExpense: number;
    net: number;
    totalUdhari: number;
  };
}

export function getReportDateRange(monthCount: number): { from: string; to: string; label: string } {
  const to = new Date();
  const from = new Date(to.getFullYear(), to.getMonth() - (monthCount - 1), 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  const fromStr = `${from.getFullYear()}-${pad(from.getMonth() + 1)}-${pad(from.getDate())}`;
  const toStr = `${to.getFullYear()}-${pad(to.getMonth() + 1)}-${pad(to.getDate())}`;
  const label =
    monthCount === 1
      ? "Current month"
      : `Last ${monthCount} months (${fromStr} to ${toStr})`;
  return { from: fromStr, to: toStr, label };
}

function inRange(date: string, from: string, to: string) {
  return date >= from && date <= to;
}

export function buildFinanceReport(store: AppStore, from: string, to: string, rangeLabel: string): FinanceReportData {
  const incomeRows: IncomeExportRow[] = [];
  const expenseRows: ExpenseExportRow[] = [];

  for (const b of store.bookings.filter((x) => x.status === "approved")) {
    if (!inRange(b.date, from, to)) continue;
    incomeRows.push({
      date: b.date,
      dateLabel: fmtDate(b.date),
      category: "Booking",
      description: b.walkIn ? "Walk-in booking" : "Online booking",
      customer: b.customerName,
      session: b.slotLabel,
      sessionPrice: b.slotPrice,
      received: bookingAmountReceived(b),
      udhari: Math.max(0, b.slotPrice - bookingAmountReceived(b)),
      owner: getOwnerName(store, b.receivedByOwnerId),
    });
  }

  for (const m of completedMatches(store)) {
    if (!inRange(m.date, from, to)) continue;
    incomeRows.push({
      date: m.date,
      dateLabel: fmtDate(m.date),
      category: "Old session",
      description: "Past session (backfill)",
      customer: m.customerName,
      session: m.slotLabel,
      sessionPrice: m.slotPrice,
      received: matchAmountReceived(m),
      udhari: Math.max(0, m.slotPrice - matchAmountReceived(m)),
      owner: getOwnerName(store, m.receivedByOwnerId),
    });
  }

  for (const i of store.otherIncomes ?? []) {
    if (!inRange(i.date, from, to)) continue;
    const desc =
      i.category === "Ball sale" && i.ballsSold
        ? `${i.ballsSold} balls × ${i.ballQuality} @ ₹${ballPricePerUnitFromIncome(i)} = ₹${i.amount}`
        : i.title;
    incomeRows.push({
      date: i.date,
      dateLabel: fmtDate(i.date),
      category: i.category,
      description: desc,
      customer: "—",
      session: "—",
      sessionPrice: "",
      received: i.amount,
      udhari: "",
      owner: getOwnerName(store, i.ownerId),
    });
  }

  for (const e of store.financeEntries.filter((x) => x.type === "income")) {
    if (!inRange(e.date, from, to)) continue;
    incomeRows.push({
      date: e.date,
      dateLabel: fmtDate(e.date),
      category: "Manual income",
      description: e.note,
      customer: "—",
      session: "—",
      sessionPrice: "",
      received: e.amount,
      udhari: "",
      owner: "—",
    });
  }

  for (const d of store.dieselExpenses) {
    if (!inRange(d.date, from, to)) continue;
    expenseRows.push({
      date: d.date,
      dateLabel: fmtDate(d.date),
      category: "Diesel",
      description: `${d.purpose} (${d.liters}L × ₹${d.pricePerLiter})`,
      amount: d.totalCost,
      owner: getOwnerName(store, d.ownerId),
    });
  }

  for (const o of store.otherExpenses ?? []) {
    if (!inRange(o.date, from, to)) continue;
    expenseRows.push({
      date: o.date,
      dateLabel: fmtDate(o.date),
      category: o.category,
      description: o.title,
      amount: o.amount,
      owner: getOwnerName(store, o.ownerId),
    });
  }

  for (const p of store.ballPurchases) {
    if (!inRange(p.date, from, to)) continue;
    expenseRows.push({
      date: p.date,
      dateLabel: fmtDate(p.date),
      category: "Ball purchase",
      description: `${p.quantity} × ${getQualityLabel(store, p.quality)} — ${p.supplier}`,
      amount: p.purchasePrice,
      owner: "—",
    });
  }

  for (const e of store.financeEntries.filter((x) => x.type === "expense")) {
    if (!inRange(e.date, from, to)) continue;
    expenseRows.push({
      date: e.date,
      dateLabel: fmtDate(e.date),
      category: "Manual expense",
      description: e.note,
      amount: e.amount,
      owner: "—",
    });
  }

  incomeRows.sort((a, b) => b.date.localeCompare(a.date));
  expenseRows.sort((a, b) => b.date.localeCompare(a.date));

  const udhariAll = getStoreUdhariSummary(store);
  const udhariRows: UdhariExportRow[] = udhariAll.accounts
    .filter((a) => inRange(a.date, from, to))
    .map((a) => ({
      date: a.date,
      dateLabel: fmtDate(a.date),
      customer: a.customerName,
      session: a.slotLabel,
      type: a.source === "old-session" ? "Old session" : a.source === "walk-in" ? "Walk-in" : "Website",
      sessionPrice: a.sessionPrice,
      received: a.received,
      udhari: a.udhari,
      owner:
        a.kind === "booking"
          ? getOwnerName(store, a.booking?.receivedByOwnerId)
          : getOwnerName(store, a.oldSession?.receivedByOwnerId),
    }));

  const sessionIncome = incomeRows.reduce(
    (s, r) => s + (typeof r.received === "number" ? r.received : 0),
    0
  );
  const totalExpense = expenseRows.reduce((s, r) => s + r.amount, 0);

  return {
    rangeLabel,
    incomeRows,
    expenseRows,
    udhariRows,
    summary: {
      totalIncome: sessionIncome,
      totalExpense,
      net: sessionIncome - totalExpense,
      totalUdhari: udhariRows.reduce((s, r) => s + r.udhari, 0),
    },
  };
}

export async function downloadExcelReport(data: FinanceReportData) {
  const XLSX = await import("xlsx");

  const incomeSheet = data.incomeRows.map((r) => ({
    Date: r.dateLabel,
    Category: r.category,
    Customer: r.customer,
    Session: r.session,
    "Session price (₹)": r.sessionPrice === "" ? "" : r.sessionPrice,
    "Received (₹)": r.received === "" ? "" : r.received,
    "Udhari (₹)": r.udhari === "" ? "" : r.udhari,
    Owner: r.owner,
    Details: r.description,
  }));

  const expenseSheet = data.expenseRows.map((r) => ({
    Date: r.dateLabel,
    Category: r.category,
    Description: r.description,
    "Amount (₹)": r.amount,
    "Paid by": r.owner,
  }));

  const udhariSheet = data.udhariRows.map((r) => ({
    Date: r.dateLabel,
    Customer: r.customer,
    Session: r.session,
    Type: r.type,
    "Session price (₹)": r.sessionPrice,
    "Received (₹)": r.received,
    "Udhari pending (₹)": r.udhari,
    Owner: r.owner,
  }));

  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ["Crossline Cricket Stadium — Finance Summary"],
      ["Period", data.rangeLabel],
      ["Generated", new Date().toLocaleString("en-IN")],
      [],
      ["Total income (cash received)", data.summary.totalIncome],
      ["Total expenses", data.summary.totalExpense],
      ["Net profit / loss", data.summary.net],
      ["Udhari pending (in period)", data.summary.totalUdhari],
      [],
      ["Sheets: Income | Expenses | Udhari Pending"],
    ]),
    "Summary"
  );

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      incomeSheet.length ? incomeSheet : [{ Date: "—", Category: "No income in this period" }]
    ),
    "Income"
  );

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      expenseSheet.length ? expenseSheet : [{ Date: "—", Category: "No expenses in this period" }]
    ),
    "Expenses"
  );

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      udhariSheet.length
        ? udhariSheet
        : [{ Customer: "—", "Udhari pending (₹)": "No pending udhari in this period" }]
    ),
    "Udhari"
  );

  XLSX.writeFile(wb, `crossline-finance-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export async function downloadPdfReport(data: FinanceReportData) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  let y = 14;

  const heading = (title: string) => {
    if (y > 170) {
      doc.addPage();
      y = 14;
    }
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, y);
    y += 6;
  };

  doc.setFontSize(16);
  doc.text("Crossline Cricket Stadium — Finance Report", 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Period: ${data.rangeLabel}`, 14, y);
  y += 5;
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 14, y);
  y += 5;
  doc.text(
    `Income: ₹${data.summary.totalIncome.toLocaleString("en-IN")}  |  Expense: ₹${data.summary.totalExpense.toLocaleString("en-IN")}  |  Net: ₹${data.summary.net.toLocaleString("en-IN")}  |  Udhari: ₹${data.summary.totalUdhari.toLocaleString("en-IN")}`,
    14,
    y
  );
  y += 10;

  heading("INCOME");
  autoTable(doc, {
    startY: y,
    head: [
      [
        "Date",
        "Category",
        "Customer",
        "Session",
        "Price",
        "Received",
        "Udhari",
        "Owner",
      ],
    ],
    body: data.incomeRows.length
      ? data.incomeRows.map((r) => [
          r.dateLabel,
          r.category,
          r.customer,
          r.session,
          r.sessionPrice === "" ? "—" : `₹${r.sessionPrice.toLocaleString("en-IN")}`,
          r.received === "" ? "—" : `₹${r.received.toLocaleString("en-IN")}`,
          r.udhari === "" ? "—" : `₹${r.udhari.toLocaleString("en-IN")}`,
          r.owner,
        ])
      : [["—", "No income in this period", "", "", "", "", "", ""]],
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [16, 120, 60], textColor: 255 },
    theme: "grid",
    margin: { left: 14, right: 14 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  heading("EXPENSES");
  autoTable(doc, {
    startY: y,
    head: [["Date", "Category", "Description", "Amount", "Paid by"]],
    body: data.expenseRows.length
      ? data.expenseRows.map((r) => [
          r.dateLabel,
          r.category,
          r.description,
          `₹${r.amount.toLocaleString("en-IN")}`,
          r.owner,
        ])
      : [["—", "No expenses in this period", "", "", ""]],
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [200, 30, 40], textColor: 255 },
    theme: "grid",
    margin: { left: 14, right: 14 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  heading("UDHARI PENDING (who still owes money)");
  autoTable(doc, {
    startY: y,
    head: [["Date", "Customer", "Session", "Type", "Price", "Received", "Udhari", "Owner"]],
    body: data.udhariRows.length
      ? data.udhariRows.map((r) => [
          r.dateLabel,
          r.customer,
          r.session,
          r.type,
          `₹${r.sessionPrice.toLocaleString("en-IN")}`,
          `₹${r.received.toLocaleString("en-IN")}`,
          `₹${r.udhari.toLocaleString("en-IN")}`,
          r.owner,
        ])
      : [["—", "No pending udhari", "", "", "", "", "", ""]],
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [180, 100, 0], textColor: 255 },
    theme: "grid",
    margin: { left: 14, right: 14 },
  });

  doc.save(`crossline-finance-${new Date().toISOString().slice(0, 10)}.pdf`);
}

/** @deprecated use buildFinanceReport */
export function buildAllFinanceTransactions(store: AppStore) {
  const { from, to, label } = getReportDateRange(12);
  const report = buildFinanceReport(store, from, to, label);
  return [
    ...report.incomeRows.map((r) => ({
      id: r.date + r.category,
      date: r.date,
      type: "income" as const,
      category: r.category,
      source: r.description,
      amount: typeof r.received === "number" ? r.received : 0,
      note: r.description,
      shift: "day" as const,
      owner: r.owner,
    })),
    ...report.expenseRows.map((r) => ({
      id: r.date + r.category,
      date: r.date,
      type: "expense" as const,
      category: r.category,
      source: r.category,
      amount: r.amount,
      note: r.description,
      shift: "day" as const,
      owner: r.owner,
    })),
  ];
}

export function filterTransactionsByRange<T extends { date: string }>(rows: T[], from: string, to: string) {
  return rows.filter((r) => r.date >= from && r.date <= to);
}

export function summarizeTransactions(rows: { type?: string; amount: number }[]) {
  const income = rows.filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0);
  const expense = rows.filter((r) => r.type === "expense").reduce((s, r) => s + r.amount, 0);
  return { income, expense, net: income - expense, count: rows.length };
}
