import { NextResponse } from "next/server";
import { readStore } from "@/lib/db";

export async function GET() {
  const store = await readStore();
  return NextResponse.json({
    slots: store.slots.filter((s) => s.available),
    allSlots: store.slots,
    blockedDates: store.blockedDates,
    advancePercentage: store.advancePercentage,
    liveStream: store.liveStream,
    liveScore: store.liveScore,
    gallery: store.gallery,
    siteContent: store.siteContent,
  });
}
