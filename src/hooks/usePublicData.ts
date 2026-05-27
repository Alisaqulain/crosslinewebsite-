"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPublic } from "@/lib/api-client";
import { getDefaultPublicData, type PublicDataPayload } from "@/lib/public-data";

export function usePublicData(bookingDate?: string) {
  const [data, setData] = useState<PublicDataPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const json = (await fetchPublic(bookingDate)) as PublicDataPayload;
      setData(json);
      setError(null);
    } catch {
      setError("Failed to load data");
      setData((prev) => prev ?? getDefaultPublicData());
    } finally {
      setLoading(false);
    }
  }, [bookingDate]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const resolved = data ?? getDefaultPublicData();

  return { data: resolved, loading, error, refresh: load };
}
