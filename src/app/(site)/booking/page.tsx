import { BookingWizard } from "@/components/booking/BookingWizard";
import { PageHero } from "@/components/media/PageHero";
import { images } from "@/lib/media";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Your Cricket Slot",
  description: "Book cricket ground slots online at Crossline Cricket Stadium. Pay advance and get email confirmation.",
};

export default function BookingPage() {
  return (
    <div>
      <PageHero
        badge="Online Booking"
        title="Book Your Ground Slot"
        description="Select date and time, pay advance, and receive email confirmation. Admin approval required."
        image={images.booking.hero}
      />
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BookingWizard />
        </div>
      </section>
    </div>
  );
}
