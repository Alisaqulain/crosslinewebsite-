"use client";

import { Hero } from "@/components/home/Hero";
import { AboutPreview } from "@/components/home/previews/AboutPreview";
import { FacilitiesPreview } from "@/components/home/previews/FacilitiesPreview";
import { BookingCTA } from "@/components/home/previews/BookingCTA";
import { LiveMatchPreview } from "@/components/home/previews/LiveMatchPreview";
import { LiveScorePreview } from "@/components/home/previews/LiveScorePreview";
import { AcademyPreview } from "@/components/home/previews/AcademyPreview";
import { TournamentPreview } from "@/components/home/previews/TournamentPreview";
import { GalleryPreview } from "@/components/home/previews/GalleryPreview";
import { ContactCTA } from "@/components/home/previews/ContactCTA";
import { usePublicData } from "@/hooks/usePublicData";
import { PageLoader } from "@/components/ui/PageLoader";

export default function HomePage() {
  const { data, loading } = usePublicData(true);

  if (loading || !data) return <PageLoader />;

  return (
    <>
      <Hero liveScore={data.liveScore} />
      <AboutPreview content={data.siteContent} />
      <FacilitiesPreview />
      <BookingCTA slots={data.allSlots ?? data.slots} />
      <LiveMatchPreview stream={data.liveStream} />
      <LiveScorePreview score={data.liveScore} />
      <AcademyPreview academy={data.academy} />
      <TournamentPreview tournaments={data.tournaments} />
      <GalleryPreview items={data.gallery} />
      <ContactCTA />
    </>
  );
}
