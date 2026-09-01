import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageSeo } from "@/components/seo/PageSeo";

export const metadata: Metadata = pageMetadata({
  title: "Latest Updates",
  description:
    "News and announcements from Crossline Cricket Stadium — tournament schedules, academy batches, ground availability, and stadium updates.",
  path: "/updates",
});

export default function UpdatesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageSeo
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Latest Updates", path: "/updates" },
        ]}
      />
      {children}
    </>
  );
}
