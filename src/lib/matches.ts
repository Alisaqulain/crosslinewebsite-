import type { AppStore, StadiumMatch } from "./types";

export function matchAmountReceived(m: StadiumMatch): number {
  return typeof m.amountReceived === "number" ? m.amountReceived : 0;
}

export function suggestedMatchUdhari(m: StadiumMatch): number {
  return Math.max(0, (m.slotPrice ?? 0) - matchAmountReceived(m));
}

export function matchUdhari(m: StadiumMatch): number {
  if (m.status === "cancelled") return 0;
  if (typeof m.udhariAmount === "number" && !Number.isNaN(m.udhariAmount)) {
    return Math.max(0, m.udhariAmount);
  }
  return suggestedMatchUdhari(m);
}

export function completedMatches(store: AppStore): StadiumMatch[] {
  return (store.matches ?? [])
    .map((m) => normalizeMatch(m as unknown as Record<string, unknown>))
    .filter((m): m is StadiumMatch => m !== null && m.status === "completed");
}

/** Skip old website team-match rows; only keep real booking-style sessions */
export function normalizeMatch(raw: Record<string, unknown>): StadiumMatch | null {
  if (typeof raw.customerName === "string" && raw.customerName && !raw.teamA && !raw.title) {
    return raw as unknown as StadiumMatch;
  }
  if (raw.teamA || raw.title) {
    return null;
  }
  if (typeof raw.customerName === "string" && raw.customerName) {
    return raw as unknown as StadiumMatch;
  }
  return null;
}
