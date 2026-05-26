import { SiteLayout } from "@/components/layout/SiteLayout";

export default function SiteRootLayout({ children }: { children: React.ReactNode }) {
  return <SiteLayout>{children}</SiteLayout>;
}
