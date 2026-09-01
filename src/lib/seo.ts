import type { Metadata } from "next";
import { primaryPhone, stadiumContacts, stadiumInfo } from "./data";
import { localMedia } from "./media";

const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

export const siteConfig = {
  name: stadiumInfo.name,
  shortName: "Crossline Cricket Stadium",
  tagline: stadiumInfo.tagline,
  description:
    "Book cricket ground slots online at Crossline Cricket Stadium & Sports Academy, Muzaffarnagar. Floodlit turf, practice nets, sports academy, and tournaments near NH 58, Sandhawali.",
  url: envUrl || stadiumInfo.website,
  email: stadiumInfo.email,
  address: stadiumInfo.address,
  phone: primaryPhone.tel,
  locale: "en_IN",
  logo: localMedia.logo,
  ogImage: localMedia.stadiumPhoto,
  keywords: [
    "Crossline Cricket Stadium",
    "Crossline Sports Academy",
    "cricket ground booking Muzaffarnagar",
    "cricket stadium Sandhawali",
    "cricket turf booking UP",
    "cricket ground near NH 58",
    "floodlit cricket ground Muzaffarnagar",
    "cricket tournament venue Muzaffarnagar",
    "sports academy Muzaffarnagar",
    "online cricket booking Muzaffarnagar",
    "cricket net practice Muzaffarnagar",
    "book cricket ground online UP",
    "cricket ground rental Muzaffarnagar",
    "evening cricket session booking",
    "night cricket floodlights Muzaffarnagar",
    "Western UP cricket ground",
  ],
} as const;

export const publicRoutes = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/booking", priority: 0.95, changeFrequency: "weekly" as const },
  { path: "/about", priority: 0.85, changeFrequency: "monthly" as const },
  { path: "/academy", priority: 0.85, changeFrequency: "monthly" as const },
  { path: "/tournaments", priority: 0.85, changeFrequency: "weekly" as const },
  { path: "/gallery", priority: 0.75, changeFrequency: "weekly" as const },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/updates", priority: 0.7, changeFrequency: "daily" as const },
  { path: "/rules", priority: 0.55, changeFrequency: "yearly" as const },
  { path: "/check", priority: 0.45, changeFrequency: "monthly" as const },
] as const;

export type BreadcrumbItem = { name: string; path: string };

type PageMetaInput = {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  keywords?: string[];
  ogImage?: string;
};

export function absoluteUrl(path = ""): string {
  const base = siteConfig.url.replace(/\/$/, "");
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata({
  title,
  description,
  path = "",
  noIndex = false,
  keywords,
  ogImage,
}: PageMetaInput = {}): Metadata {
  const canonical = absoluteUrl(path);
  const desc = description ?? siteConfig.description;
  const fullTitle = title ? `${title} | ${siteConfig.shortName}` : siteConfig.name;
  const image = absoluteUrl(ogImage ?? siteConfig.ogImage);

  return {
    title: title ?? siteConfig.name,
    description: desc,
    keywords: keywords ? [...siteConfig.keywords, ...keywords] : [...siteConfig.keywords],
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
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [image],
    },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    other: {
      "geo.region": "IN-UP",
      "geo.placename": "Muzaffarnagar",
      "geo.position": "29.4724;77.7085",
      ICBM: "29.4724, 77.7085",
    },
    formatDetection: {
      telephone: true,
      email: true,
      address: true,
    },
    category: "Sports",
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["SportsActivityLocation", "LocalBusiness", "SportsClub"],
    "@id": `${siteConfig.url}/#localbusiness`,
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: absoluteUrl(siteConfig.logo),
    image: absoluteUrl(siteConfig.ogImage),
    email: siteConfig.email,
    telephone: stadiumContacts.map((c) => c.tel),
    address: {
      "@type": "PostalAddress",
      streetAddress: "Near Railway Crossing, Adjacent NH 58, Sandhawali",
      addressLocality: "Muzaffarnagar",
      addressRegion: "Uttar Pradesh",
      postalCode: "251001",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 29.4724,
      longitude: 77.7085,
    },
    hasMap: "https://maps.google.com/?q=Crossline+Cricket+Stadium+Muzaffarnagar",
    areaServed: {
      "@type": "City",
      name: "Muzaffarnagar",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "06:00",
      closes: "23:00",
    },
    priceRange: "₹₹",
    sport: "Cricket",
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Floodlights", value: true },
      { "@type": "LocationFeatureSpecification", name: "Practice Nets", value: true },
      { "@type": "LocationFeatureSpecification", name: "Parking", value: true },
      { "@type": "LocationFeatureSpecification", name: "Changing Rooms", value: true },
    ],
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/booking"),
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
      result: {
        "@type": "Reservation",
        name: "Cricket ground slot booking",
      },
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "en-IN",
    publisher: {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(siteConfig.logo),
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/check")}?ref={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl(siteConfig.logo),
    email: siteConfig.email,
    telephone: siteConfig.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Muzaffarnagar",
      addressRegion: "Uttar Pradesh",
      addressCountry: "IN",
    },
  };
}

export function bookingServiceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Cricket Ground Booking",
    provider: {
      "@type": "LocalBusiness",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    areaServed: "Muzaffarnagar, Uttar Pradesh",
    description:
      "Online cricket ground slot booking for morning, day, evening, and floodlit night sessions.",
    url: absoluteUrl("/booking"),
    serviceType: "Cricket ground rental",
  };
}
