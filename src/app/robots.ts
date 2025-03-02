import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/fournisseurs/",
    },
    sitemap: "https://www.fm4all.com/sitemap.xml",
  };
}
