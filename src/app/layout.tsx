import type { Metadata } from "next";
import { Outfit, Sora } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
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
  title: {
    default: "Crossline Cricket Stadium & Sports Academy",
    template: "%s | Crossline Cricket Stadium",
  },
  description:
    "Book your cricket slot online at crosslinecricketstadium.in — premium ground booking, sports academy, and tournaments at Crossline Cricket Stadium, Muzaffarnagar.",
  metadataBase: new URL("https://crosslinecricketstadium.in"),
  icons: {
    icon: "/crossline-logo.png",
    apple: "/crossline-logo.png",
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
