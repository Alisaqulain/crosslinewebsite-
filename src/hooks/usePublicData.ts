"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPublic } from "@/lib/api-client";
import { getDefaultPublicData, type PublicDataPayload } from "@/lib/public-data";

export function usePublicData(pollScore = false) {
  const [data, setData] = useState<PublicDataPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const json = (await fetchPublic()) as PublicDataPayload;
      setData(json);
      setError(null);
    } catch {
      setError("Failed to load live data");
      setData((prev) => prev ?? getDefaultPublicData());
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

  const resolved = data ?? getDefaultPublicData();

  return { data: resolved, loading, error, refresh: load };
}
