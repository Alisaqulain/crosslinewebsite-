"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { APP_NAME, APP_VERSION } from "@/lib/updates";
import type { UpdateEntry } from "@/lib/updates";
import {
  Sparkles,
  Loader2,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Wrench,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface UpdatesPayload {
  app: string;
  version: string;
  latest: UpdateEntry;
  changelog: UpdateEntry[];
  checkedAt: string;
}

export default function UpdatesPage() {
  const [data, setData] = useState<UpdatesPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/updates", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");
      setData(await res.json());
    } catch {
      setError("Could not load update information");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-[80vh] bg-[var(--bg-alt)] py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[var(--brand-red)]/10 mb-4">
            <Sparkles className="h-7 w-7 text-[var(--brand-red)]" />
          </div>
          <h1 className="font-[family-name:var(--font-sora)] text-3xl font-extrabold text-[var(--navy)]">
            Latest Updates
          </h1>
          <p className="mt-3 text-[var(--text-muted)] max-w-lg mx-auto">
            See what&apos;s new in {APP_NAME}. Use this page after deploying or refreshing the site.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Button onClick={load} disabled={loading} variant="outline">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
          <Link href="/check">
            <Button variant="ghost">
              <Wrench className="h-4 w-4" />
              Environment check
            </Button>
          </Link>
        </div>

        {error && (
          <Card className="mb-6 border-[var(--brand-red)]/30 bg-red-50">
            <p className="text-[var(--brand-red)] font-medium">{error}</p>
          </Card>
        )}

        {loading && !data && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-[var(--brand-red)]" />
          </div>
        )}

        {data && (
          <>
            <Card className="mb-8 text-center py-8 border-[var(--cricket-green)]/25 bg-gradient-to-br from-white to-green-50/30">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cricket-green)]">
                Current version
              </p>
              <p className="mt-2 text-4xl font-extrabold text-[var(--navy)] font-[family-name:var(--font-sora)]">
                v{data.version}
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--navy)]">{data.latest.title}</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Released {formatDate(data.latest.date)}
              </p>
              <p className="text-xs text-slate-400 mt-4">
                Loaded {new Date(data.checkedAt).toLocaleString()}
              </p>
            </Card>

            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--navy)] mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--cricket-green)]" />
              What&apos;s included in v{data.latest.version}
            </h2>
            <Card className="mb-10 !p-5">
              <ul className="space-y-2.5">
                {data.latest.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-[var(--navy)]">
                    <span className="text-[var(--cricket-green)] font-bold shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--text-muted)] mb-4">
              Full changelog
            </h2>
            <div className="space-y-6">
              {data.changelog.map((entry, i) => (
                <Card key={entry.version} className={i === 0 ? "ring-2 ring-[var(--brand-red)]/15" : ""}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                    <div>
                      <span className="text-xs font-bold text-[var(--brand-red)]">v{entry.version}</span>
                      <h3 className="font-semibold text-[var(--navy)]">{entry.title}</h3>
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">{formatDate(entry.date)}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {entry.items.map((item) => (
                      <li key={item} className="text-sm text-[var(--text-muted)] pl-4 border-l-2 border-slate-200">
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>

            <p className="mt-10 text-center text-sm text-[var(--text-muted)]">
              Admin panel:{" "}
              <Link href="/admin/login" className="text-[var(--brand-red)] font-semibold hover:underline">
                /admin/login
              </Link>
              {" · "}
              System status:{" "}
              <Link href="/check" className="text-[var(--brand-red)] font-semibold hover:underline inline-flex items-center gap-1">
                /check
                <ExternalLink className="h-3 w-3" />
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
