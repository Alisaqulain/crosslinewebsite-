import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Tournaments",
  description:
    "Host or join cricket tournaments at Crossline Cricket Stadium, Muzaffarnagar. League matches, corporate events, and academy tournaments on premium turf.",
  path: "/tournaments",
});

export default function TournamentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
