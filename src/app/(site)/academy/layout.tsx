import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageSeo } from "@/components/seo/PageSeo";

export const metadata: Metadata = pageMetadata({
  title: "Sports Academy",
  description:
    "Join Crossline Sports Academy in Muzaffarnagar for professional cricket coaching, practice nets, and structured training programs for all age groups.",
  path: "/academy",
  keywords: ["cricket coaching Muzaffarnagar", "cricket academy UP"],
});

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageSeo
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Sports Academy", path: "/academy" },
        ]}
      />
      {children}
    </>
  );
}
