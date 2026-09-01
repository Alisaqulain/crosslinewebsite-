import type { AppStore, OtherIncome } from "./types";
import { dieselAmount } from "./diesel";
import { getOwnerName, resolveOwners } from "./owners";
import { completedMatches, matchAmountReceived, matchUdhari } from "./matches";
import { bookingAmountReceived, bookingUdhari, getStoreUdhariSummary } from "./udhari";
import { getQualityLabel } from "./qualities";
import { getBallStock } from "./finance";
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

export interface OwnerExportRow {
  name: string;
  bookingIncome: number;
  oldSessionIncome: number;
  otherIncome: number;
  incomeTotal: number;
  dieselExpense: number;
  ballPurchaseExpense: number;
  otherExpense: number;
  expenseTotal: number;
  net: number;
}

export interface StockExportRow {
  quality: string;
  label: string;
  purchasedAllTime: number;
  usedAllTime: number;
  remainingNow: number;
  purchasedThisMonth: number;
  usedThisMonth: number;
}

export interface FinanceReportData {
  rangeLabel: string;
  from: string;
  to: string;
  incomeRows: IncomeExportRow[];
  expenseRows: ExpenseExportRow[];
  udhariRows: UdhariExportRow[];
  ownerRows: OwnerExportRow[];
  stockRows: StockExportRow[];
  summary: {
    totalIncome: number;
    totalExpense: number;
    net: number;
    totalUdhari: number;
    incomeBreakdown: {
      bookings: number;
      oldSessions: number;
      otherIncome: number;
      manual: number;
    };
    expenseBreakdown: {
      diesel: number;
      ballPurchase: number;
      other: number;
      manual: number;
    };
    totalBallsRemaining: number;
    approvedBookings: number;
  };
}

export function getDateRangeLabel(from: string, to: string): string {
  try {
    const f = formatDate(from);
    const t = formatDate(to);
    return from === to ? f : `${f} → ${t}`;
  } catch {
    return `${from} → ${to}`;
  }
}

export function getCalendarMonthRange(year: number, month: number): { from: string; to: string; label: string } {
  const pad = (n: number) => String(n).padStart(2, "0");
  const lastDay = new Date(year, month, 0).getDate();
  const from = `${year}-${pad(month)}-01`;
  const to = `${year}-${pad(month)}-${pad(lastDay)}`;
  const label = new Date(year, month - 1, 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
  return { from, to, label };
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

function buildOwnerRows(store: AppStore, from: string, to: string): OwnerExportRow[] {
  const rows = resolveOwners(store).map((owner) => ({
    name: owner.name,
    bookingIncome: 0,
    oldSessionIncome: 0,
    otherIncome: 0,
    incomeTotal: 0,
    dieselExpense: 0,
    ballPurchaseExpense: 0,
    otherExpense: 0,
    expenseTotal: 0,
    net: 0,
    _id: owner.id,
  }));

  const byId = new Map(rows.map((r) => [r._id, r]));

  for (const b of store.bookings.filter((x) => x.status === "approved" && inRange(x.date, from, to))) {
    if (!b.receivedByOwnerId) continue;
    const row = byId.get(b.receivedByOwnerId);
    if (!row) continue;
    const amt = bookingAmountReceived(b);
    row.bookingIncome += amt;
    row.incomeTotal += amt;
  }

  for (const m of completedMatches(store).filter((x) => inRange(x.date, from, to))) {
    if (!m.receivedByOwnerId) continue;
    const row = byId.get(m.receivedByOwnerId);
    if (!row) continue;
    const amt = matchAmountReceived(m);
    row.oldSessionIncome += amt;
    row.incomeTotal += amt;
  }

  for (const i of (store.otherIncomes ?? []).filter((x) => inRange(x.date, from, to))) {
    if (!i.ownerId) continue;
    const row = byId.get(i.ownerId);
    if (!row) continue;
    row.otherIncome += i.amount;
    row.incomeTotal += i.amount;
  }

  for (const i of (store.oldIncomes ?? []).filter((x) => inRange(x.date, from, to))) {
    if (!i.ownerId) continue;
    const row = byId.get(i.ownerId);
    if (!row) continue;
    row.otherIncome += i.amount;
    row.incomeTotal += i.amount;
  }

  for (const d of store.dieselExpenses.filter((x) => inRange(x.date, from, to))) {
    if (!d.ownerId) continue;
    const row = byId.get(d.ownerId);
    if (!row) continue;
    const amt = dieselAmount(d);
    row.dieselExpense += amt;
    row.expenseTotal += amt;
  }

  for (const d of (store.oldDieselExpenses ?? []).filter((x) => inRange(x.date, from, to))) {
    if (!d.ownerId) continue;
    const row = byId.get(d.ownerId);
    if (!row) continue;
    const amt = dieselAmount(d);
    row.dieselExpense += amt;
    row.expenseTotal += amt;
  }

  for (const o of (store.otherExpenses ?? []).filter((x) => inRange(x.date, from, to))) {
    if (!o.ownerId) continue;
    const row = byId.get(o.ownerId);
    if (!row) continue;
    row.otherExpense += o.amount;
    row.expenseTotal += o.amount;
  }

  for (const o of (store.oldExpenses ?? []).filter((x) => inRange(x.date, from, to))) {
    if (!o.ownerId) continue;
    const row = byId.get(o.ownerId);
    if (!row) continue;
    row.otherExpense += o.amount;
    row.expenseTotal += o.amount;
  }

  for (const p of store.ballPurchases.filter((x) => inRange(x.date, from, to))) {
    if (!p.ownerId) continue;
    const row = byId.get(p.ownerId);
    if (!row) continue;
    row.ballPurchaseExpense += p.purchasePrice;
    row.expenseTotal += p.purchasePrice;
  }

  return rows
    .map(({ _id: _unused, ...r }) => ({ ...r, net: r.incomeTotal - r.expenseTotal }))
    .sort((a, b) => b.incomeTotal - a.incomeTotal);
}

function buildStockRows(store: AppStore, from: string, to: string): StockExportRow[] {
  const stock = getBallStock(store);
  return stock.map((s) => ({
    quality: s.quality,
    label: s.label,
    purchasedAllTime: s.purchased,
    usedAllTime: s.used,
    remainingNow: s.remaining,
    purchasedThisMonth: store.ballPurchases
      .filter((p) => p.quality === s.quality && inRange(p.date, from, to))
      .reduce((sum, p) => sum + p.quantity, 0),
    usedThisMonth: store.ballUsage
      .filter((u) => u.quality === s.quality && inRange(u.date, from, to))
      .reduce((sum, u) => sum + u.quantity, 0),
  }));
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
      udhari: bookingUdhari(b),
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
      udhari: matchUdhari(m),
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

  for (const i of store.oldIncomes ?? []) {
    if (!inRange(i.date, from, to)) continue;
    incomeRows.push({
      date: i.date,
      dateLabel: fmtDate(i.date),
      category: "Old income",
      description: i.title,
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
      description: d.purpose || "Night match diesel",
      amount: dieselAmount(d),
      owner: getOwnerName(store, d.ownerId),
    });
  }

  for (const d of store.oldDieselExpenses ?? []) {
    if (!inRange(d.date, from, to)) continue;
    expenseRows.push({
      date: d.date,
      dateLabel: fmtDate(d.date),
      category: "Old diesel",
      description: d.purpose || "Past diesel (backfill)",
      amount: dieselAmount(d),
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

  for (const o of store.oldExpenses ?? []) {
    if (!inRange(o.date, from, to)) continue;
    expenseRows.push({
      date: o.date,
      dateLabel: fmtDate(o.date),
      category: "Old expense",
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
      owner: getOwnerName(store, p.ownerId),
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

  const incomeBreakdown = {
    bookings: incomeRows
      .filter((r) => r.category === "Booking")
      .reduce((s, r) => s + (typeof r.received === "number" ? r.received : 0), 0),
    oldSessions: incomeRows
      .filter((r) => r.category === "Old session")
      .reduce((s, r) => s + (typeof r.received === "number" ? r.received : 0), 0),
    otherIncome: incomeRows
      .filter((r) => r.category !== "Booking" && r.category !== "Old session" && r.category !== "Manual income")
      .reduce((s, r) => s + (typeof r.received === "number" ? r.received : 0), 0),
    manual: incomeRows
      .filter((r) => r.category === "Manual income")
      .reduce((s, r) => s + (typeof r.received === "number" ? r.received : 0), 0),
  };

  const expenseBreakdown = {
    diesel: expenseRows.filter((r) => r.category === "Diesel").reduce((s, r) => s + r.amount, 0),
    ballPurchase: expenseRows.filter((r) => r.category === "Ball purchase").reduce((s, r) => s + r.amount, 0),
    other: expenseRows
      .filter((r) => r.category !== "Diesel" && r.category !== "Ball purchase" && r.category !== "Manual expense")
      .reduce((s, r) => s + r.amount, 0),
    manual: expenseRows.filter((r) => r.category === "Manual expense").reduce((s, r) => s + r.amount, 0),
  };

  const stockRows = buildStockRows(store, from, to);
  const ownerRows = buildOwnerRows(store, from, to);
  const totalBallsRemaining = stockRows.reduce((s, r) => s + r.remainingNow, 0);
  const approvedBookings = store.bookings.filter(
    (b) => b.status === "approved" && inRange(b.date, from, to)
  ).length;

  return {
    rangeLabel,
    from,
    to,
    incomeRows,
    expenseRows,
    udhariRows,
    ownerRows,
    stockRows,
    summary: {
      totalIncome: sessionIncome,
      totalExpense,
      net: sessionIncome - totalExpense,
      totalUdhari: udhariRows.reduce((s, r) => s + r.udhari, 0),
      incomeBreakdown,
      expenseBreakdown,
      totalBallsRemaining,
      approvedBookings,
    },
  };
}

export async function downloadExcelReport(data: FinanceReportData) {
  const XLSX = await import("xlsx");
  const fmt = (n: number) => n;

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

  const ownerSheet = data.ownerRows.map((r) => ({
    Owner: r.name,
    "Booking income (₹)": fmt(r.bookingIncome),
    "Old session income (₹)": fmt(r.oldSessionIncome),
    "Other income (₹)": fmt(r.otherIncome),
    "Total earned (₹)": fmt(r.incomeTotal),
    "Diesel expense (₹)": fmt(r.dieselExpense),
    "Ball purchase (₹)": fmt(r.ballPurchaseExpense),
    "Other expense (₹)": fmt(r.otherExpense),
    "Total expense (₹)": fmt(r.expenseTotal),
    "Net (₹)": fmt(r.net),
  }));

  const stockSheet = data.stockRows.map((r) => ({
    Quality: r.label,
    "Purchased (all time)": r.purchasedAllTime,
    "Used (all time)": r.usedAllTime,
    "Remaining now": r.remainingNow,
    "Purchased this month": r.purchasedThisMonth,
    "Used this month": r.usedThisMonth,
  }));

  const wb = XLSX.utils.book_new();
  const ib = data.summary.incomeBreakdown;
  const eb = data.summary.expenseBreakdown;

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ["Crossline Cricket Stadium — Full Finance Summary"],
      ["Period", data.rangeLabel],
      ["Date range", `${data.from} to ${data.to}`],
      ["Generated", new Date().toLocaleString("en-IN")],
      [],
      ["—— TOTALS ——"],
      ["Total income (cash received)", data.summary.totalIncome],
      ["Total expenses", data.summary.totalExpense],
      ["Net profit / loss", data.summary.net],
      ["Udhari pending", data.summary.totalUdhari],
      ["Approved bookings", data.summary.approvedBookings],
      ["Ball stock remaining (all qualities)", data.summary.totalBallsRemaining],
      [],
      ["—— INCOME BREAKDOWN ——"],
      ["Bookings", ib.bookings],
      ["Old sessions", ib.oldSessions],
      ["Other income", ib.otherIncome],
      ["Manual income", ib.manual],
      [],
      ["—— EXPENSE BREAKDOWN ——"],
      ["Diesel", eb.diesel],
      ["Ball purchases", eb.ballPurchase],
      ["Other expenses", eb.other],
      ["Manual expenses", eb.manual],
      [],
      ["Sheets: Summary | Owners | Ball Stock | Income | Expenses | Udhari"],
    ]),
    "Summary"
  );

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      ownerSheet.length ? ownerSheet : [{ Owner: "—", "Total earned (₹)": "No owner data" }]
    ),
    "Owners"
  );

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      stockSheet.length ? stockSheet : [{ Quality: "—", "Remaining now": 0 }]
    ),
    "Ball Stock"
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

  XLSX.writeFile(wb, `crossline-finance-${data.rangeLabel.replace(/\s+/g, "-").toLowerCase()}.xlsx`);
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
  doc.text(`Period: ${data.rangeLabel} (${data.from} → ${data.to})`, 14, y);
  y += 5;
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 14, y);
  y += 5;
  doc.text(
    `Income: ₹${data.summary.totalIncome.toLocaleString("en-IN")}  |  Expense: ₹${data.summary.totalExpense.toLocaleString("en-IN")}  |  Net: ₹${data.summary.net.toLocaleString("en-IN")}  |  Udhari: ₹${data.summary.totalUdhari.toLocaleString("en-IN")}`,
    14,
    y
  );
  y += 5;
  doc.text(
    `Bookings: ${data.summary.approvedBookings}  |  Ball stock left: ${data.summary.totalBallsRemaining} balls`,
    14,
    y
  );
  y += 8;

  heading("INCOME & EXPENSE BREAKDOWN");
  autoTable(doc, {
    startY: y,
    head: [["Type", "Category", "Amount (₹)"]],
    body: [
      ["Income", "Bookings", data.summary.incomeBreakdown.bookings.toLocaleString("en-IN")],
      ["Income", "Old sessions", data.summary.incomeBreakdown.oldSessions.toLocaleString("en-IN")],
      ["Income", "Other income", data.summary.incomeBreakdown.otherIncome.toLocaleString("en-IN")],
      ["Income", "Manual", data.summary.incomeBreakdown.manual.toLocaleString("en-IN")],
      ["Income", "TOTAL", data.summary.totalIncome.toLocaleString("en-IN")],
      ["Expense", "Diesel", data.summary.expenseBreakdown.diesel.toLocaleString("en-IN")],
      ["Expense", "Ball purchases", data.summary.expenseBreakdown.ballPurchase.toLocaleString("en-IN")],
      ["Expense", "Other", data.summary.expenseBreakdown.other.toLocaleString("en-IN")],
      ["Expense", "Manual", data.summary.expenseBreakdown.manual.toLocaleString("en-IN")],
      ["Expense", "TOTAL", data.summary.totalExpense.toLocaleString("en-IN")],
    ],
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 60, 120], textColor: 255 },
    theme: "grid",
    margin: { left: 14, right: 14 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  heading("OWNERS — who earned & spent how much");
  autoTable(doc, {
    startY: y,
    head: [["Owner", "Earned", "Expense", "Net", "Bookings", "Other inc.", "Diesel", "Ball purchase", "Other exp."]],
    body: data.ownerRows.length
      ? data.ownerRows.map((r) => [
          r.name,
          `₹${r.incomeTotal.toLocaleString("en-IN")}`,
          `₹${r.expenseTotal.toLocaleString("en-IN")}`,
          `₹${r.net.toLocaleString("en-IN")}`,
          `₹${r.bookingIncome.toLocaleString("en-IN")}`,
          `₹${r.otherIncome.toLocaleString("en-IN")}`,
          `₹${r.dieselExpense.toLocaleString("en-IN")}`,
          `₹${r.ballPurchaseExpense.toLocaleString("en-IN")}`,
          `₹${r.otherExpense.toLocaleString("en-IN")}`,
        ])
      : [["—", "No owner data", "", "", "", "", "", "", ""]],
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [100, 50, 150], textColor: 255 },
    theme: "grid",
    margin: { left: 14, right: 14 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  heading("BALL STOCK");
  autoTable(doc, {
    startY: y,
    head: [["Quality", "Remaining", "Purchased (all)", "Used (all)", "Bought (month)", "Used (month)"]],
    body: data.stockRows.length
      ? data.stockRows.map((r) => [
          r.label,
          String(r.remainingNow),
          String(r.purchasedAllTime),
          String(r.usedAllTime),
          String(r.purchasedThisMonth),
          String(r.usedThisMonth),
        ])
      : [["—", "0", "0", "0", "0", "0"]],
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [50, 120, 180], textColor: 255 },
    theme: "grid",
    margin: { left: 14, right: 14 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  heading("INCOME DETAIL");
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

  heading("EXPENSES DETAIL");
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

  doc.save(`crossline-finance-${data.rangeLabel.replace(/\s+/g, "-").toLowerCase()}.pdf`);
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
