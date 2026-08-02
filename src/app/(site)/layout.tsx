import { SiteLayout } from "@/components/layout/SiteLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { localBusinessJsonLd, websiteJsonLd } from "@/lib/seo";

export default function SiteRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={[websiteJsonLd(), localBusinessJsonLd()]} />
      <SiteLayout>{children}</SiteLayout>
    </>
  );
}
