import { NextRequest, NextResponse } from "next/server";
import { readStore } from "@/lib/db";
import { getDefaultPublicData, toPublicPayload } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const store = await readStore();
    const date = req.nextUrl.searchParams.get("date") ?? undefined;
    return NextResponse.json(toPublicPayload(store, date ?? undefined));
  } catch (error) {
    console.error("GET /api/public error:", error);
    return NextResponse.json(getDefaultPublicData());
  }
}
