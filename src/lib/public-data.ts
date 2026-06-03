import type { AppStore } from "./types";
import { defaultStore } from "./seed";
import { getBookingSlotsForDate } from "./slots";

export type PublicDataPayload = Pick<
  AppStore,
  "blockedDates" | "gallery" | "siteContent" | "tournaments" | "academy" | "matches"
> & {
  slots: AppStore["slots"];
};

export function toPublicPayload(store: AppStore, date?: string): PublicDataPayload {
  const slots = date
    ? getBookingSlotsForDate(store, date)
    : store.slots
        .filter((s) => s.available)
        .map((s) => ({ ...s, bookable: true }));

  return {
    slots,
    blockedDates: store.blockedDates,
    gallery: store.gallery,
    siteContent: store.siteContent,
    tournaments: store.tournaments,
    academy: store.academy,
    matches: store.matches.filter((m) => m.status === "upcoming"),
  };
}

export function getDefaultPublicData(): PublicDataPayload {
  return toPublicPayload(defaultStore);
}
