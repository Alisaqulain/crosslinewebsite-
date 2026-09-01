import type { Metadata } from "next";
import { Outfit, Sora } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { pageMetadata, siteConfig } from "@/lib/seo";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  ...pageMetadata(),
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.shortName}`,
  },
  applicationName: siteConfig.shortName,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "Sports",
  appleWebApp: {
    capable: true,
    title: siteConfig.shortName,
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: siteConfig.logo, sizes: "32x32", type: "image/png" },
      { url: siteConfig.logo, sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: siteConfig.logo, sizes: "180x180", type: "image/png" }],
    shortcut: siteConfig.logo,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${sora.variable} min-h-full flex flex-col antialiased`}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
