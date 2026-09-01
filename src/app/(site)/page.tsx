import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { HomePageClient } from "./HomePageClient";

export const metadata: Metadata = pageMetadata({
  title: "Cricket Ground Booking Muzaffarnagar",
  description:
    "Crossline Cricket Stadium & Sports Academy — book cricket ground slots online in Muzaffarnagar. Floodlit turf, practice nets, sports academy, and tournaments near NH 58, Sandhawali.",
  path: "/",
});

export default function HomePage() {
  return <HomePageClient />;
}
