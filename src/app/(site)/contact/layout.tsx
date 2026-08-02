import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Contact Crossline Cricket Stadium for ground bookings, academy enrolment, and tournaments. Call or visit us at Sandhawali, Muzaffarnagar, UP.",
  path: "/contact",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
