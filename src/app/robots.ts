import type { MetadataRoute } from "next";

const disallowUrls = ["/fr/mon-devis/*", "/en/my-quote/*", "/_next/*"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: disallowUrls,
      },
    ],
    sitemap: "https://www.fm4all.com/sitemap.xml",
  };
}
