import { Header } from "./Header";
import { Footer } from "./Footer";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-theme flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 pt-[72px] bg-gradient-to-b from-white via-white to-[var(--bg-alt)]/40">{children}</main>
      <Footer />
    </div>
  );
}
