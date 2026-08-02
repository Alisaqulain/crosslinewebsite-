import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Gallery",
  description:
    "View photos and videos of Crossline Cricket Stadium — floodlit matches, turf ground, practice nets, and tournament action in Muzaffarnagar.",
  path: "/gallery",
});

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
