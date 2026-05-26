import { NextResponse } from "next/server";
import { readStore } from "@/lib/db";
import { getDefaultPublicData, toPublicPayload } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const store = await readStore();
    return NextResponse.json(toPublicPayload(store));
  } catch (error) {
    console.error("GET /api/public error:", error);
    return NextResponse.json(getDefaultPublicData());
  }
}
