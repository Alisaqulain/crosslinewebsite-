"use client";

import { ContactHomeSection } from "@/components/home/ContactHomeSection";
import { PageHero } from "@/components/media/PageHero";
import { images } from "@/lib/media";

export default function ContactPage() {
  return (
    <div>
      <PageHero
        badge="Contact Us"
        title="Get In Touch"
        description="Bookings, academy enrolment, tournaments — our team is ready to help."
        image={images.contact.hero}
      />
      <ContactHomeSection />
    </div>
  );
}
