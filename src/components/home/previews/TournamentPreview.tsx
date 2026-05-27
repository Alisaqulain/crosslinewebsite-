"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionCTA } from "@/components/ui/SectionCTA";
import { formatDate } from "@/lib/utils";
import type { StadiumMatch, Tournament } from "@/lib/types";
import { Calendar, Trophy } from "lucide-react";

export function TournamentPreview({
  tournaments,
  matches = [],
}: {
  tournaments: Tournament[];
  matches?: StadiumMatch[];
}) {
  const upcomingMatches = matches.slice(0, 2);
  const upcomingTournaments = tournaments.filter((t) => t.status !== "completed").slice(0, 2);

  return (
    <section className="section-padding section-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            badge="Tournaments & Matches"
            title="Upcoming at Crossline"
            description="Leagues, cups, and scheduled matches on our professional ground."
            light
          />
        </ScrollReveal>
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {upcomingMatches.map((m, i) => (
            <ScrollReveal key={m.id} delay={i * 0.1}>
              <div className="glass-card rounded-2xl p-6 h-full hover:bg-white/12 transition-colors border-l-4 border-[var(--brand-red)]">
                <Trophy className="h-8 w-8 text-[var(--cricket-green-light)]" />
                <h3 className="mt-4 text-xl font-bold">{m.title}</h3>
                <p className="text-sm text-[var(--brand-red)] font-semibold mt-1">
                  {m.teamA} vs {m.teamB}
                </p>
                <p className="text-sm text-slate-400 flex items-center gap-2 mt-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(m.date)} · {m.time}
                </p>
              </div>
            </ScrollReveal>
          ))}
          {upcomingTournaments.map((t, i) => (
            <ScrollReveal key={t.id} delay={(upcomingMatches.length + i) * 0.1}>
              <div className="glass-card rounded-2xl p-6 h-full hover:bg-white/12 transition-colors">
                <Trophy className="h-8 w-8 text-[var(--cricket-green-light)]" />
                <h3 className="mt-4 text-xl font-bold">{t.title}</h3>
                <p className="text-sm text-slate-400 flex items-center gap-2 mt-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(t.date)}
                </p>
                <p className="mt-3 text-sm text-slate-300 line-clamp-2">{t.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <div className="text-center">
          <SectionCTA href="/tournaments" label="View All Matches" />
        </div>
      </div>
    </section>
  );
}
