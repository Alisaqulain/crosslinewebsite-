import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageSeo } from "@/components/seo/PageSeo";

export const metadata: Metadata = pageMetadata({
  title: "Tournaments",
  description:
    "Host or join cricket tournaments at Crossline Cricket Stadium, Muzaffarnagar. League matches, corporate events, and academy tournaments on premium turf.",
  path: "/tournaments",
  keywords: ["cricket tournament venue Muzaffarnagar", "host cricket tournament UP"],
});

export default function TournamentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageSeo
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Tournaments", path: "/tournaments" },
        ]}
      />
      {children}
    </>
  );
}
