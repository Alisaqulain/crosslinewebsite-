import type { AppStore, BallQuality, BallQualityOption } from "./types";
import { DEFAULT_BALL_QUALITIES } from "./types";

/** Uses your saved list only. Defaults apply only when ballQualities was never set (old data). */
export function resolveBallQualities(store: AppStore): BallQualityOption[] {
  if (Array.isArray(store.ballQualities)) {
    return store.ballQualities.filter((q) => q.id && q.label);
  }
  return DEFAULT_BALL_QUALITIES;
}

export function getQualityLabel(store: AppStore, qualityId: BallQuality): string {
  const id = qualityId.trim();
  return (
    resolveBallQualities(store).find((q) => q.id === id)?.label ?? id
  );
}
