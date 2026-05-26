"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Calendar, Trophy } from "lucide-react";
import type { Tournament } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function TournamentSection({ tournaments }: { tournaments: Tournament[] }) {
  const upcoming = tournaments.filter((t) => t.status === "upcoming" || t.status === "ongoing");

  return (
    <section id="tournaments" className="section-padding bg-[var(--bg-alt)] scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            badge="Tournaments"
            title="Upcoming Tournaments"
            description="Register your team for leagues and cups hosted at Crossline Cricket Stadium."
          />
        </ScrollReveal>
        <div className="grid md:grid-cols-2 gap-6">
          {upcoming.map((t, i) => (
            <ScrollReveal key={t.id} delay={i * 0.1}>
              <Card hover className="flex flex-col h-full">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--navy)] text-white">
                    <Trophy className="h-6 w-6" />
                  </div>
                  {t.registrationOpen && (
                    <span className="text-xs font-bold uppercase tracking-wide text-[var(--cricket-green)] bg-[var(--cricket-green)]/10 px-2 py-1 rounded-full">
                      Registration Open
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-xl font-bold text-[var(--navy)]">{t.title}</h3>
                <p className="mt-2 text-sm text-[var(--text-muted)] flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(t.date)}
                </p>
                <p className="mt-3 text-sm text-[var(--text-muted)] leading-relaxed flex-1">{t.description}</p>
                <Link href="#contact" className="mt-6">
                  <Button variant="navy" className="w-full sm:w-auto">
                    Register Team
                  </Button>
                </Link>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
