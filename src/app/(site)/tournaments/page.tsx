"use client";

import Link from "next/link";
import { PageHero } from "@/components/media/PageHero";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { usePublicData } from "@/hooks/usePublicData";
import { PageLoader } from "@/components/ui/PageLoader";
import { formatDate } from "@/lib/utils";
import { images } from "@/lib/media";
import { Calendar, Clock, MapPin, Trophy, Users } from "lucide-react";

export default function TournamentsPage() {
  const { data, loading } = usePublicData();

  if (loading) return <PageLoader />;

  const matches = data.matches ?? [];
  const tournaments = data.tournaments;

  return (
    <div>
      <PageHero
        badge="Tournaments & Matches"
        title="Cricket at Crossline"
        description="Upcoming matches, leagues, and corporate cups on our professional ground."
        image={images.about.tournament}
      />
      <section className="section-padding bg-[var(--bg-alt)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          {matches.length > 0 && (
            <div>
              <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-[var(--navy)] mb-8">
                Upcoming Matches
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {matches.map((m) => (
                  <Card key={m.id} hover className="overflow-hidden !p-0">
                    <div className="bg-[var(--navy)] p-6 text-white">
                      <Trophy className="h-10 w-10 text-[var(--cricket-green-light)]" />
                      <h3 className="mt-4 text-2xl font-bold font-[family-name:var(--font-sora)]">{m.title}</h3>
                      <p className="mt-3 text-lg font-semibold text-[var(--brand-red)]">
                        {m.teamA} vs {m.teamB}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300">
                        <span className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(m.date)}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {m.time}
                        </span>
                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {m.ground}
                        </span>
                      </div>
                    </div>
                    {m.notes && (
                      <div className="p-6">
                        <p className="text-[var(--text-muted)]">{m.notes}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-[var(--navy)] mb-8">
              Tournaments
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {tournaments.map((t) => (
                <Card key={t.id} hover className="overflow-hidden !p-0">
                  <div className="bg-[var(--navy)] p-6 text-white">
                    <div className="flex justify-between items-start">
                      <Trophy className="h-10 w-10 text-[var(--cricket-green-light)]" />
                      {t.registrationOpen && (
                        <span className="text-xs font-bold uppercase bg-[var(--brand-red)] px-2 py-1 rounded-full">
                          Open
                        </span>
                      )}
                    </div>
                    <h3 className="mt-4 text-2xl font-bold font-[family-name:var(--font-sora)]">{t.title}</h3>
                    <p className="mt-2 text-sm text-slate-300 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(t.date)}
                    </p>
                  </div>
                  <div className="p-6">
                    <p className="text-[var(--text-muted)] leading-relaxed">{t.description}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-[var(--navy)] font-semibold">
                      <Users className="h-4 w-4" />
                      Team registration available
                    </div>
                    <Link href="/contact" className="block mt-6">
                      <Button className="w-full" variant="navy">
                        Register Your Team
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
