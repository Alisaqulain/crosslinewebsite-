"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

export function BookingSection() {
  return (
    <section id="booking" className="section-padding bg-white scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            badge="Book Your Slot"
            title="Ground Booking"
            description="Choose your date and session, fill in your team details, and submit your booking request. Our team will confirm shortly."
          />
        </ScrollReveal>
        <BookingWizard />
      </div>
    </section>
  );
}
