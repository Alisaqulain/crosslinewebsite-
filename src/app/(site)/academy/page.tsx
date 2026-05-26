"use client";

import Link from "next/link";
import { PageHero } from "@/components/media/PageHero";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { usePublicData } from "@/hooks/usePublicData";
import { PageLoader } from "@/components/ui/PageLoader";
import { images } from "@/lib/media";
import { GraduationCap, Users, Award, Clock } from "lucide-react";

const benefits = [
  { icon: Award, title: "Certified Coaches", desc: "Structured training from experienced cricket coaches." },
  { icon: Users, title: "All Age Groups", desc: "Programs for young beginners through club-level players." },
  { icon: Clock, title: "Flexible Batches", desc: "Morning, evening, and weekend batches available." },
];

export default function AcademyPage() {
  const { data, loading } = usePublicData();

  if (loading || !data) return <PageLoader />;
  const { academy } = data;

  return (
    <div>
      <PageHero
        badge="Sports Academy"
        title={academy.headline}
        description={academy.description}
        image={images.about.practiceNets}
      />
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {benefits.map((b) => (
              <Card key={b.title} hover className="text-center">
                <b.icon className="h-10 w-10 mx-auto text-[var(--brand-red)]" />
                <h3 className="mt-4 font-bold text-[var(--navy)]">{b.title}</h3>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{b.desc}</p>
              </Card>
            ))}
          </div>
          <h2 className="font-[family-name:var(--font-sora)] text-3xl font-bold text-[var(--navy)] text-center mb-10">
            Coaching Programs
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {academy.programs.map((p) => (
              <Card key={p.id} hover className="h-full border-t-4 border-t-[var(--cricket-green)]">
                <span className="text-xs font-bold uppercase tracking-wide text-[var(--cricket-green)]">{p.level}</span>
                <h3 className="mt-3 text-xl font-bold text-[var(--navy)]">{p.title}</h3>
                <p className="mt-3 text-[var(--text-muted)] leading-relaxed">{p.description}</p>
                <p className="mt-4 font-semibold text-[var(--navy)]">{p.duration}</p>
              </Card>
            ))}
          </div>
          <div className="mt-16 text-center rounded-3xl bg-[var(--navy)] p-12 text-white">
            <GraduationCap className="h-12 w-12 mx-auto text-[var(--cricket-green-light)]" />
            <h3 className="mt-4 text-2xl font-bold font-[family-name:var(--font-sora)]">Start Your Cricket Journey</h3>
            <p className="mt-2 text-slate-300 max-w-lg mx-auto">Contact us to enrol in the next academy batch at Crossline.</p>
            <Link href="/contact" className="inline-block mt-8">
              <Button size="lg">Join Academy</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
