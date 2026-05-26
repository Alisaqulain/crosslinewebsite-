"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPublic } from "@/lib/api-client";
import type { AppStore } from "@/lib/types";

type PublicData = Pick<
  AppStore,
  "slots" | "blockedDates" | "advancePercentage" | "liveStream" | "liveScore" | "gallery" | "siteContent"
> & { allSlots?: AppStore["slots"] };

export function usePublicData(pollScore = false) {
  const [data, setData] = useState<PublicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const json = await fetchPublic();
      setData(json);
      setError(null);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    if (!pollScore) return;
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [load, pollScore]);

  return { data, loading, error, refresh: load };
}
