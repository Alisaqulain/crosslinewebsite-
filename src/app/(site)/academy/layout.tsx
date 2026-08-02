import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Sports Academy",
  description:
    "Join Crossline Sports Academy in Muzaffarnagar for professional cricket coaching, practice nets, and structured training programs for all age groups.",
  path: "/academy",
});

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
