import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageSeo } from "@/components/seo/PageSeo";

export const metadata: Metadata = pageMetadata({
  title: "Check Booking",
  description:
    "Check your cricket ground booking status at Crossline Cricket Stadium using your booking reference number.",
  path: "/check",
});

export default function CheckLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageSeo
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Check Booking", path: "/check" },
        ]}
      />
      {children}
    </>
  );
}
