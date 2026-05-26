"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { LiveScore, MatchStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Radio, Target } from "lucide-react";

const statusLabels: Record<MatchStatus, string> = {
  upcoming: "Upcoming",
  live: "Live",
  innings_break: "Innings Break",
  completed: "Completed",
};

const statusColors: Record<MatchStatus, string> = {
  upcoming: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  live: "bg-red-500/20 text-red-400 border-red-500/40",
  innings_break: "bg-[#F7931E]/20 text-[#FBB03B] border-[#F7931E]/40",
  completed: "bg-[#39B54A]/20 text-[#8CC63F] border-[#39B54A]/40",
};

function runRate(runs: number, overs: number, balls: number) {
  const totalBalls = overs * 6 + balls;
  if (totalBalls === 0) return "0.00";
  return ((runs / totalBalls) * 6).toFixed(2);
}

function ballColor(ball: string) {
  if (ball === "W" || ball === "w") return "bg-red-500 text-white";
  if (ball === "4") return "bg-blue-500 text-white";
  if (ball === "6") return "bg-[#39B54A] text-white";
  if (ball === "0") return "bg-white/10 text-slate-400";
  return "bg-white/15 text-white";
}

interface Props {
  score: LiveScore;
  compact?: boolean;
  className?: string;
}

export function LiveScoreboard({ score, compact, className }: Props) {
  const battingName = score.battingTeam === "A" ? score.teamA : score.teamB;
  const bowlingName = score.battingTeam === "A" ? score.teamB : score.teamA;
  const rr = runRate(score.runs, score.overs, score.balls);
  const oversDisplay = `${score.overs}.${score.balls}`;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b1219] via-[#141f2b] to-[#0f1a14]",
        className
      )}
    >
      <div className="absolute inset-0 hero-pattern opacity-60 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#ED1C24]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#39B54A]/5 rounded-full blur-3xl" />

      <div className="relative p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            {score.matchStatus === "live" && (
              <span className="flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-500/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-400">
                <Radio className="h-3 w-3 animate-pulse" />
                Live
              </span>
            )}
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                statusColors[score.matchStatus]
              )}
            >
              {statusLabels[score.matchStatus]}
            </span>
          </div>
          {score.target != null && score.target > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Target className="h-3.5 w-3.5 text-[#FBB03B]" />
              Target: <span className="font-bold text-[#FBB03B]">{score.target}</span>
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <TeamCard
            name={score.teamA}
            active={score.battingTeam === "A"}
            runs={score.battingTeam === "A" ? score.runs : undefined}
            wickets={score.battingTeam === "A" ? score.wickets : undefined}
            overs={score.battingTeam === "A" ? oversDisplay : undefined}
          />
          <TeamCard
            name={score.teamB}
            active={score.battingTeam === "B"}
            runs={score.battingTeam === "B" ? score.runs : undefined}
            wickets={score.battingTeam === "B" ? score.wickets : undefined}
            overs={score.battingTeam === "B" ? oversDisplay : undefined}
          />
        </div>

        {score.battingTeam && (
          <div className="rounded-xl bg-black/30 border border-white/5 p-4 mb-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Now Batting — {battingName}</p>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <motion.div
                  key={`${score.runs}-${score.wickets}`}
                  initial={{ scale: 1.05, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-baseline gap-2"
                >
                  <span className="text-4xl sm:text-5xl font-extrabold font-[family-name:var(--font-sora)] text-white tabular-nums">
                    {score.runs}
                  </span>
                  <span className="text-2xl text-slate-500 font-light">/</span>
                  <span className="text-3xl font-bold text-[#ED1C24] tabular-nums">{score.wickets}</span>
                </motion.div>
                <p className="text-sm text-slate-400 mt-1">
                  Overs: <span className="text-white font-semibold">{oversDisplay}</span>
                  {!compact && (
                    <>
                      {" "}
                      · RR: <span className="text-[#FBB03B] font-semibold">{rr}</span>
                    </>
                  )}
                </p>
              </div>
              {!compact && (
                <div className="text-right text-sm space-y-1">
                  <p className="text-slate-500">
                    <span className="text-white">{score.batsman1}</span> *
                  </p>
                  <p className="text-slate-500">
                    <span className="text-white">{score.batsman2}</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-2">
                    vs <span className="text-slate-400">{score.bowler}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Recent Balls</p>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence mode="popLayout">
              {score.recentBalls.slice(-12).map((ball, i) => (
                <motion.span
                  key={`${ball}-${i}-${score.updatedAt}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0 }}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold",
                    ballColor(ball)
                  )}
                >
                  {ball.toUpperCase()}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {!compact && (
          <p className="mt-4 text-center text-[10px] text-slate-600">
            {bowlingName} bowling · Updated live from stadium
          </p>
        )}
      </div>
    </div>
  );
}

function TeamCard({
  name,
  active,
  runs,
  wickets,
  overs,
}: {
  name: string;
  active: boolean;
  runs?: number;
  wickets?: number;
  overs?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition-all",
        active ? "border-[#F7931E]/50 bg-[#F7931E]/10" : "border-white/5 bg-white/[0.02]"
      )}
    >
      <p className={cn("text-sm font-semibold truncate", active ? "text-[#FBB03B]" : "text-slate-400")}>
        {name}
        {active && <span className="ml-1 text-[10px] text-[#F7931E]">● BAT</span>}
      </p>
      {active && runs != null && (
        <p className="mt-1 text-lg font-bold text-white tabular-nums">
          {runs}/{wickets} <span className="text-xs font-normal text-slate-500">({overs})</span>
        </p>
      )}
    </div>
  );
}
