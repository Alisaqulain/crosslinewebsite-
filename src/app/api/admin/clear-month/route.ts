import { NextRequest, NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/db";
import { getAdminSession, unauthorized } from "@/lib/auth";
import { clearPeriodData, previewClearPeriod } from "@/lib/clear-month";
import { getCalendarMonthRange } from "@/lib/finance-export";
import { getFinanceSummary } from "@/lib/finance";

function resolveRange(body: { from?: string; to?: string; year?: number; month?: number }) {
  if (body.from && body.to) {
    return { from: body.from, to: body.to };
  }
  const year = Number(body.year);
  const month = Number(body.month);
  if (year && month >= 1 && month <= 12) {
    const r = getCalendarMonthRange(year, month);
    return { from: r.from, to: r.to };
  }
  return null;
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) return unauthorized();
  try {
    const body = await req.json();
    const range = resolveRange(body);
    const confirm = body.confirm === true;

    if (!range) {
      return NextResponse.json({ error: "Valid from and to dates required (YYYY-MM-DD)" }, { status: 400 });
    }
    if (range.from > range.to) {
      return NextResponse.json({ error: "From date must be on or before To date" }, { status: 400 });
    }

    const store = await readStore();
    const preview = previewClearPeriod(store, range.from, range.to);

    if (!confirm) {
      return NextResponse.json({ preview });
    }

    if (preview.totalRecords === 0) {
      return NextResponse.json({ error: "No records to clear for this date range" }, { status: 400 });
    }

    const next = clearPeriodData(store, range.from, range.to);
    await writeStore(next);

    return NextResponse.json({
      ok: true,
      preview,
      store: next,
      finance: getFinanceSummary(next),
    });
  } catch (err) {
    console.error("Clear period failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Clear failed" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) return unauthorized();
  const from = req.nextUrl.searchParams.get("from") ?? "";
  const to = req.nextUrl.searchParams.get("to") ?? "";
  const year = Number(req.nextUrl.searchParams.get("year"));
  const month = Number(req.nextUrl.searchParams.get("month"));

  let range: { from: string; to: string } | null = null;
  if (from && to) {
    range = { from, to };
  } else if (year && month) {
    const r = getCalendarMonthRange(year, month);
    range = { from: r.from, to: r.to };
  }

  if (!range) {
    return NextResponse.json(
      { error: "from & to query params required (YYYY-MM-DD), or year & month" },
      { status: 400 }
    );
  }

  const store = await readStore();
  return NextResponse.json({ preview: previewClearPeriod(store, range.from, range.to) });
}
