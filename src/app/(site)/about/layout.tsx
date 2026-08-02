import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description:
    "Learn about Crossline Cricket Stadium & Sports Academy in Muzaffarnagar — professional turf, floodlights, practice nets, and tournament-ready facilities near NH 58.",
  path: "/about",
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
