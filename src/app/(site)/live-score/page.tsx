"use client";

import { PageHero } from "@/components/media/PageHero";
import { LiveScoreboard } from "@/components/score/LiveScoreboard";
import { usePublicData } from "@/hooks/usePublicData";
import { PageLoader } from "@/components/ui/PageLoader";
import { images } from "@/lib/media";
export default function LiveScorePage() {
  const { data, loading } = usePublicData(true);

  if (loading || !data) return <PageLoader />;

  return (
    <div>
      <PageHero
        badge="Live Score"
        title="Stadium Scoreboard"
        description="Ball-by-ball updates from matches at Crossline Cricket Stadium."
        image={images.live.hero}
      />
      <section className="section-padding bg-[var(--navy-deep)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <LiveScoreboard score={data.liveScore} variant="premium" />
          <p className="text-center text-sm text-slate-500 mt-8">
            Scores update in real time during live matches.
          </p>
        </div>
      </section>
    </div>
  );
}
