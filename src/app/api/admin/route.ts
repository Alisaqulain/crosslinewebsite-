import { NextRequest, NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/db";
import { isAdminRequest, unauthorized } from "@/lib/auth";
import { getFinanceSummary } from "@/lib/finance";
import type { AppStore } from "@/lib/types";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  const store = await readStore();
  const summary = req.nextUrl.searchParams.get("summary");
  if (summary === "finance") {
    return NextResponse.json({ finance: getFinanceSummary(store) });
  }
  return NextResponse.json({ store, finance: getFinanceSummary(store) });
}

export async function PATCH(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const { section, data } = await req.json();
    if (!section) return NextResponse.json({ error: "Section required" }, { status: 400 });

    const store = await updateStore((s) => {
      const next = { ...s };
      switch (section as keyof AppStore) {
        case "slots":
          next.slots = data;
          break;
        case "blockedDates":
          next.blockedDates = data;
          break;
        case "ballPurchases":
          next.ballPurchases = data;
          break;
        case "ballUsage":
          next.ballUsage = data;
          break;
        case "matches":
          next.matches = data;
          break;
        case "dieselExpenses":
          next.dieselExpenses = data;
          break;
        case "otherExpenses":
          next.otherExpenses = data;
          break;
        case "ballQualities":
          next.ballQualities = data;
          break;
        case "financeEntries":
          next.financeEntries = data;
          break;
        case "gallery":
          next.gallery = data;
          break;
        case "siteContent":
          next.siteContent = { ...s.siteContent, ...data };
          break;
        case "tournaments":
          next.tournaments = data;
          break;
        case "academy":
          next.academy = { ...s.academy, ...data };
          break;
        default:
          return s;
      }
      return next;
    });

    return NextResponse.json({ store, finance: getFinanceSummary(store) });
  } catch (err) {
    console.error("Admin PATCH failed:", err);
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
