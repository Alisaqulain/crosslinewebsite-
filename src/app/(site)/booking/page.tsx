import { BookingSection } from "@/components/home/BookingSection";
import { PageHero } from "@/components/media/PageHero";
import { images } from "@/lib/media";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ground Booking",
  description: "Book your cricket ground slot at Crossline Cricket Stadium. Select date, session, and submit your team booking request.",
};

export default function BookingPage() {
  return (
    <div>
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
