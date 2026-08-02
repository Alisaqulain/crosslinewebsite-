import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0B1219",
    theme_color: "#ED1C24",
    icons: [
      {
        src: siteConfig.logo,
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
