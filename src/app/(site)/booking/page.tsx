import { BookingSection } from "@/components/home/BookingSection";
import { PageHero } from "@/components/media/PageHero";
import { PageSeo } from "@/components/seo/PageSeo";
import { images } from "@/lib/media";
import type { Metadata } from "next";
import { bookingServiceJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Ground Booking",
  description:
    "Book your cricket ground slot online at Crossline Cricket Stadium, Muzaffarnagar. Choose date, morning or night session, and submit your team booking request.",
  path: "/booking",
  keywords: [
    "book cricket slot Muzaffarnagar",
    "cricket ground online booking",
    "night cricket booking floodlights",
  ],
});

export default function BookingPage() {
  return (
    <div>
      <PageSeo
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Ground Booking", path: "/booking" },
        ]}
        extra={bookingServiceJsonLd()}
      />
      <PageHero
        badge="Ground Booking"
        title="Book Your Cricket Slot"
        description="Choose your session, enter team details, and reserve your match at Crossline."
        image={images.booking.hero}
      />
      <BookingSection />
    </div>
  );
}
