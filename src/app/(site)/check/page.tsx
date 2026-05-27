"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { HealthReport, CheckStatus } from "@/lib/health-check";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MinusCircle,
  Loader2,
  RefreshCw,
  Database,
  Mail,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  CheckStatus,
  { icon: typeof CheckCircle2; color: string; bg: string; label: string }
> = {
  ok: {
    icon: CheckCircle2,
    color: "text-[var(--cricket-green)]",
    bg: "bg-[var(--cricket-green)]/10",
    label: "OK",
  },
  warn: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
    label: "Warning",
  },
  error: {
    icon: XCircle,
    color: "text-[var(--brand-red)]",
    bg: "bg-[var(--brand-red)]/10",
    label: "Error",
  },
  skip: {
    icon: MinusCircle,
    color: "text-[var(--text-muted)]",
    bg: "bg-[var(--bg-alt)]",
    label: "Skipped",
  },
};

function groupIcon(name: string) {
  if (name.includes("Mongo") || name.includes("MONGODB") || name.includes("Storage"))
    return Database;
  if (name.includes("Email") || name.includes("EMAIL") || name.includes("SMTP")) return Mail;
  if (name.includes("ADMIN")) return Shield;
  return CheckCircle2;
}

export default function CheckPage() {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runCheck = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/check", { cache: "no-store" });
      const data = (await res.json()) as HealthReport;
      setReport(data);
    } catch {
      setError("Could not reach /api/check");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runCheck();
  }, [runCheck]);

  return (
    <div className="min-h-[80vh] bg-[var(--bg-alt)] py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="font-[family-name:var(--font-sora)] text-3xl font-extrabold text-[var(--navy)]">
            Environment Check
          </h1>
          <p className="mt-3 text-[var(--text-muted)]">
            Verifies your <code className="text-sm bg-white px-1.5 py-0.5 rounded">.env.local</code>{" "}
            database and email setup. No secrets are exposed.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <Button onClick={runCheck} disabled={loading} variant="outline">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Run Check Again
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-[var(--brand-red)]/30 bg-red-50">
            <p className="text-[var(--brand-red)] font-medium">{error}</p>
          </Card>
        )}

        {loading && !report && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-[var(--brand-red)]" />
          </div>
        )}

        {report && (
          <>
            <Card
              className={cn(
                "mb-6 text-center py-8",
                report.ok ? "border-[var(--cricket-green)]/30" : "border-[var(--brand-red)]/30"
              )}
            >
              {report.ok ? (
                <CheckCircle2 className="h-14 w-14 mx-auto text-[var(--cricket-green)]" />
              ) : (
                <XCircle className="h-14 w-14 mx-auto text-[var(--brand-red)]" />
              )}
              <h2 className="mt-4 text-xl font-bold text-[var(--navy)]">
                {report.ok ? "All critical checks passed" : "Some checks failed"}
              </h2>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Storage:{" "}
                <strong className="text-[var(--navy)]">
                  {report.storage === "mongodb" ? "MongoDB" : "Local file (fallback)"}
                </strong>
                {" · "}
                Checked {new Date(report.checkedAt).toLocaleString()}
              </p>
            </Card>

            <div className="space-y-3">
              {report.checks.map((check) => {
                const cfg = statusConfig[check.status];
                const Icon = cfg.icon;
                const GroupIcon = groupIcon(check.name);
                return (
                  <Card key={check.name} className="!p-4">
                    <div className="flex gap-4">
                      <div
                        className={cn(
                          "shrink-0 h-10 w-10 rounded-xl flex items-center justify-center",
                          cfg.bg
                        )}
                      >
                        <GroupIcon className={cn("h-5 w-5", cfg.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-[var(--navy)]">{check.name}</span>
                          <span
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                              cfg.bg,
                              cfg.color
                            )}
                          >
                            {cfg.label}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">{check.message}</p>
                        {check.hint && (
                          <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                            💡 {check.hint}
                          </p>
                        )}
                      </div>
                      <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", cfg.color)} />
                    </div>
                  </Card>
                );
              })}
            </div>

            <p className="mt-8 text-center text-xs text-[var(--text-muted)]">
              Remove or protect this route in production if you don&apos;t want it public.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
