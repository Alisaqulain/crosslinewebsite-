"use client";

import { Hero } from "@/components/home/Hero";
import { AboutPreview } from "@/components/home/previews/AboutPreview";
import { FacilitiesPreview } from "@/components/home/previews/FacilitiesPreview";
import { BookingCTA } from "@/components/home/previews/BookingCTA";
import { AcademyPreview } from "@/components/home/previews/AcademyPreview";
import { TournamentPreview } from "@/components/home/previews/TournamentPreview";
import { GalleryPreview } from "@/components/home/previews/GalleryPreview";
import { ContactCTA } from "@/components/home/previews/ContactCTA";
import { usePublicData } from "@/hooks/usePublicData";
import { PageLoader } from "@/components/ui/PageLoader";

export default function HomePage() {
  const { data, loading } = usePublicData();

  if (loading) return <PageLoader />;

  return (
    <>
      <Hero />
      <AboutPreview content={data.siteContent} />
      <FacilitiesPreview />
      <BookingCTA slots={data.slots} />
      <AcademyPreview academy={data.academy} />
      <TournamentPreview tournaments={data.tournaments} matches={data.matches} />
      <GalleryPreview items={data.gallery} />
      <ContactCTA />
    </>
  );
}
