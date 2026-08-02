import type { Metadata } from "next";
import { primaryPhone, stadiumContacts, stadiumInfo } from "./data";
import { localMedia } from "./media";

export const siteConfig = {
  name: stadiumInfo.name,
  shortName: "Crossline Cricket Stadium",
  tagline: stadiumInfo.tagline,
  description:
    "Book cricket ground slots online at Crossline Cricket Stadium & Sports Academy, Muzaffarnagar. Floodlit turf, practice nets, sports academy, and tournaments near NH 58.",
  url: stadiumInfo.website,
  email: stadiumInfo.email,
  address: stadiumInfo.address,
  phone: primaryPhone.tel,
  locale: "en_IN",
  logo: localMedia.logo,
  ogImage: localMedia.stadiumPhoto,
  keywords: [
    "Crossline Cricket Stadium",
    "cricket ground booking Muzaffarnagar",
    "cricket stadium Sandhawali",
    "sports academy Muzaffarnagar",
    "cricket turf booking UP",
    "floodlit cricket ground",
    "cricket tournament venue Muzaffarnagar",
    "NH 58 cricket ground",
    "online cricket booking",
    "Crossline Sports Academy",
  ],
} as const;

export const publicRoutes = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/booking", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/academy", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/tournaments", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/gallery", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/updates", priority: 0.7, changeFrequency: "daily" as const },
  { path: "/rules", priority: 0.5, changeFrequency: "yearly" as const },
  { path: "/check", priority: 0.4, changeFrequency: "monthly" as const },
];

type PageMetaInput = {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
};

export function pageMetadata({
  title,
  description,
  path = "",
  noIndex = false,
}: PageMetaInput = {}): Metadata {
  const canonical = `${siteConfig.url}${path}`;
  const desc = description ?? siteConfig.description;
  const fullTitle = title ? `${title} | ${siteConfig.shortName}` : siteConfig.name;

  return {
    title: title ?? siteConfig.name,
    description: desc,
    keywords: [...siteConfig.keywords],
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title: fullTitle,
      description: desc,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [siteConfig.ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["SportsActivityLocation", "LocalBusiness"],
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}${siteConfig.logo}`,
    image: `${siteConfig.url}${siteConfig.ogImage}`,
    email: siteConfig.email,
    telephone: stadiumContacts.map((c) => c.tel),
    address: {
      "@type": "PostalAddress",
      streetAddress: "Near Railway Crossing, Adjacent NH 58, Sandhawali",
      addressLocality: "Muzaffarnagar",
      addressRegion: "Uttar Pradesh",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 29.4724,
      longitude: 77.7085,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "06:00",
      closes: "23:00",
    },
    priceRange: "₹₹",
    sport: "Cricket",
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}${siteConfig.logo}`,
      },
    },
  };
}
