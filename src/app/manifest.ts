import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfig } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    lang: "en-IN",
    dir: "ltr",
    display: "standalone",
    background_color: "#0B1219",
    theme_color: "#ED1C24",
    categories: ["sports", "business"],
    icons: [
      {
        src: siteConfig.logo,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: siteConfig.logo,
        sizes: "192x192",
        type: "image/png",
      },
    ],
    screenshots: [
      {
        src: siteConfig.ogImage,
        sizes: "1200x630",
        type: "image/jpeg",
      },
    ],
    related_applications: [],
    id: absoluteUrl("/"),
  };
}
