import { NextRequest, NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/db";
import {
  canPatchSection,
  forbidden,
  getAdminSession,
  sanitizeStoreForClient,
  unauthorized,
} from "@/lib/auth";
import { syncBallUsageFromOtherIncomes } from "@/lib/ball-stock";
import { getFinanceSummary } from "@/lib/finance";
import type { AppStore, OtherIncome } from "@/lib/types";

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) return unauthorized();
  const store = await readStore();
  const safeStore = sanitizeStoreForClient(store);
  const summary = req.nextUrl.searchParams.get("summary");
  if (summary === "finance") {
    return NextResponse.json({ finance: getFinanceSummary(store), session });
  }
  return NextResponse.json({
    store: safeStore,
    finance: getFinanceSummary(store),
    session,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) return unauthorized();
  try {
    const { section, data } = await req.json();
    if (!section) return NextResponse.json({ error: "Section required" }, { status: 400 });
    if (!canPatchSection(session, section)) {
      return forbidden("Your account cannot change this section");
    }

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
        case "savedMonthlyReports":
          next.savedMonthlyReports = data;
          break;
        case "owners":
          next.owners = data;
          break;
        case "otherIncomes": {
          const incomes = data as OtherIncome[];
          const synced = syncBallUsageFromOtherIncomes(s, incomes);
          if (synced.error) throw new Error(synced.error);
          next.otherIncomes = incomes;
          next.ballUsage = synced.ballUsage;
          break;
        }
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

    return NextResponse.json({
      store: sanitizeStoreForClient(store),
      finance: getFinanceSummary(store),
      session,
    });
  } catch (err) {
    console.error("Admin PATCH failed:", err);
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
