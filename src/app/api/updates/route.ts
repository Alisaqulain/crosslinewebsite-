import { NextResponse } from "next/server";
import { APP_NAME, APP_VERSION, CHANGELOG, getLatestUpdate } from "@/lib/updates";

export async function GET() {
  return NextResponse.json({
    app: APP_NAME,
    version: APP_VERSION,
    latest: getLatestUpdate(),
    changelog: CHANGELOG,
    checkedAt: new Date().toISOString(),
  });
}
