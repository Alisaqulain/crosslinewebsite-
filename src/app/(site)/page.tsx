"use client";

import { Hero } from "@/components/home/Hero";
import { CTA } from "@/components/home/CTA";
import { Features } from "@/components/home/Features";
import { StadiumHighlights } from "@/components/home/StadiumHighlights";
import { Services } from "@/components/home/Services";
import { BookingProcess } from "@/components/home/BookingProcess";
import { GalleryPreview } from "@/components/home/GalleryPreview";
import { LiveScorePreview } from "@/components/home/LiveScorePreview";
import { Testimonials } from "@/components/home/Testimonials";
import { ContactSection } from "@/components/home/ContactSection";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { usePublicData } from "@/hooks/usePublicData";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { data, loading } = usePublicData(true);

  if (loading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#F7931E]" />
      </div>
    );
  }

  return (
    <>
      <Hero />
      <StadiumHighlights highlights={data.siteContent.stadiumHighlights} />
      <Services />
      <Features />
      <BookingProcess />
      <LiveScorePreview score={data.liveScore} />
      <GalleryPreview items={data.gallery} />
      <Testimonials items={data.siteContent.testimonials} />
      <ContactSection />
      <CTA />
    </>
  );
}
