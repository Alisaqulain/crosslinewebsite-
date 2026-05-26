import { NextRequest, NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/db";
import { isAdminRequest, unauthorized } from "@/lib/auth";
import type { AppStore } from "@/lib/types";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  const store = await readStore();
  return NextResponse.json({ store });
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
        case "advancePercentage":
          next.advancePercentage = data;
          break;
        case "liveStream":
          next.liveStream = { ...s.liveStream, ...data };
          break;
        case "liveScore":
          next.liveScore = { ...s.liveScore, ...data, updatedAt: new Date().toISOString() };
          break;
        case "ballPurchases":
          next.ballPurchases = data;
          break;
        case "ballUsage":
          next.ballUsage = data;
          break;
        case "gallery":
          next.gallery = data;
          break;
        case "siteContent":
          next.siteContent = { ...s.siteContent, ...data };
          break;
        default:
          return s;
      }
      return next;
    });

    return NextResponse.json({ store });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
