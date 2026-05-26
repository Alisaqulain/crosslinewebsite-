"use client";

import { PageHero } from "@/components/media/PageHero";
import { StadiumFacilities } from "@/components/home/StadiumFacilities";
import { Card } from "@/components/ui/Card";
import { stadiumInfo } from "@/lib/data";
import { images, videos } from "@/lib/media";
import { InlineVideo } from "@/components/media/InlineVideo";
import { MediaImage } from "@/components/media/MediaImage";
import { usePublicData } from "@/hooks/usePublicData";
import { PageLoader } from "@/components/ui/PageLoader";
import { Target, Users, Trophy, Zap } from "lucide-react";

const highlights = [
  { icon: Trophy, title: "Tournament Ready", desc: "Host leagues, corporate matches, and academy tournaments.", image: images.about.tournament },
  { icon: Zap, title: "Floodlit Nights", desc: "Evening and night sessions with professional floodlighting.", image: images.about.floodlit },
  { icon: Users, title: "Team Friendly", desc: "Changing rooms, seating, and parking for full squads.", image: images.about.facilities },
  { icon: Target, title: "Quality Pitch", desc: "Maintained turf with regular rolling and professional care.", image: images.about.qualityPitch },
];

export default function AboutPage() {
  const { data, loading } = usePublicData();

  if (loading || !data) return <PageLoader />;

  return (
    <div>
      <PageHero badge="About Us" title={stadiumInfo.name} description={stadiumInfo.tagline} image={images.about.hero} />

      <section className="section-padding bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-[var(--shadow-lg)]">
              <MediaImage src={images.about.story} alt="Stadium" fill className="object-cover" sizes="600px" />
            </div>
            <div>
              <div className="accent-line mb-4" />
              <h2 className="font-[family-name:var(--font-sora)] text-3xl font-bold text-[var(--navy)]">Our Story</h2>
              <p className="mt-4 text-[var(--text-muted)] leading-relaxed">{data.siteContent.aboutDescription}</p>
              <ul className="mt-6 space-y-3">
                {data.siteContent.aboutPoints.map((p) => (
                  <li key={p} className="flex gap-3 text-[var(--text-muted)]">
                    <span className="h-2 w-2 rounded-full bg-[var(--brand-red)] mt-2 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-[var(--bg-alt)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-[family-name:var(--font-sora)] text-3xl font-bold text-[var(--navy)] mb-10">
            Stadium Tour
          </h2>
          <InlineVideo mp4={videos.stadiumTour} poster={images.about.hero} title="Crossline Stadium tour" className="max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-[var(--shadow-lg)]" />
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-[family-name:var(--font-sora)] text-3xl font-bold text-[var(--navy)] mb-12">
            Why Choose Crossline?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item) => (
              <Card key={item.title} hover className="overflow-hidden !p-0">
                <div className="relative h-40">
                  <MediaImage src={item.image} alt={item.title} fill className="object-cover" sizes="300px" />
                </div>
                <div className="p-5 text-center">
                  <item.icon className="h-8 w-8 mx-auto text-[var(--brand-red)]" />
                  <h3 className="mt-3 font-bold text-[var(--navy)]">{item.title}</h3>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">{item.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <StadiumFacilities />
    </div>
  );
}
