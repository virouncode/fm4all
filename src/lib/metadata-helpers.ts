import { Metadata } from "next";
import { RouteKey, routes } from "./routes";

/**
 * Helper function to generate consistent metadata with alternates for multilingual pages
 * @param routeKey The route key from routes.ts
 * @param locale The current locale
 * @param title The page title
 * @param description The page description
 * @returns Metadata object with title, description, and alternates
 */
export function generateAlternates(
  routeKey: RouteKey,
  locale: string,
  title: string,
  description: string
): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: `https://www.fm4all.com/${locale}${routes[routeKey][locale as "fr" | "en"]}`,
      languages: {
        en: `https://www.fm4all.com/en${routes[routeKey]["en"]}`,
        fr: `https://www.fm4all.com/fr${routes[routeKey]["fr"]}`,
      },
    },
  };
}
