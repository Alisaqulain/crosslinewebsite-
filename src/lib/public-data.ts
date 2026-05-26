import type { AppStore } from "./types";
import { defaultStore } from "./seed";

export type PublicDataPayload = Pick<
  AppStore,
  | "slots"
  | "blockedDates"
  | "advancePercentage"
  | "liveStream"
  | "liveScore"
  | "gallery"
  | "siteContent"
  | "tournaments"
  | "academy"
> & { allSlots: AppStore["slots"] };

export function toPublicPayload(store: AppStore): PublicDataPayload {
  return {
    slots: store.slots.filter((s) => s.available),
    allSlots: store.slots,
    blockedDates: store.blockedDates,
    advancePercentage: store.advancePercentage,
    liveStream: store.liveStream,
    liveScore: store.liveScore,
    gallery: store.gallery,
    siteContent: store.siteContent,
    tournaments: store.tournaments,
    academy: store.academy,
  };
}

export function getDefaultPublicData(): PublicDataPayload {
  return toPublicPayload(defaultStore);
}
