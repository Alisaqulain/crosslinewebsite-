"use client";

import { PageHero } from "@/components/media/PageHero";
import { LiveMatchSection } from "@/components/home/LiveMatchSection";
import { usePublicData } from "@/hooks/usePublicData";
import { PageLoader } from "@/components/ui/PageLoader";
import { images } from "@/lib/media";

export default function LiveMatchPage() {
  const { data, loading } = usePublicData(true);

  if (loading || !data) return <PageLoader />;

  return (
    <div>
      <PageHero
        badge="Live Match Center"
        title="Watch Live Cricket"
        description="YouTube live stream and match information from Crossline Cricket Stadium."
        image={images.live.hero}
      />
      <LiveMatchSection stream={data.liveStream} />
    </div>
  );
}
