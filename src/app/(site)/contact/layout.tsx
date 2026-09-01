import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageSeo } from "@/components/seo/PageSeo";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Contact Crossline Cricket Stadium for ground bookings, academy enrolment, and tournaments. Call or visit us at Sandhawali, Muzaffarnagar, UP.",
  path: "/contact",
  keywords: ["contact cricket ground Muzaffarnagar", "Crossline phone number"],
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageSeo
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Contact Us", path: "/contact" },
        ]}
      />
      {children}
    </>
  );
}
