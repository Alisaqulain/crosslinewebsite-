import { NextResponse } from "next/server";
import { runHealthCheck } from "@/lib/health-check";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const report = await runHealthCheck();
    return NextResponse.json(report, { status: report.ok ? 200 : 503 });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        checkedAt: new Date().toISOString(),
        storage: "unknown",
        checks: [
          {
            name: "Health Check",
            status: "error",
            message: err instanceof Error ? err.message : "Unexpected error",
          },
        ],
      },
      { status: 500 }
    );
  }
}
