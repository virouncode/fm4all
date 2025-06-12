import {
  getArticlesSlugEn,
  getArticlesSubSlugEn,
} from "@/i18n/articlesSlugMappings";
import { routing } from "@/i18n/routing";
import { getSecteurSlugEn } from "@/i18n/secteursSlugMappings";
import { getServicesSlugEn } from "@/i18n/servicesSlugMappings";
import {
  fetchArticleCategories,
  fetchArticleSlugs,
  fetchSecteursSlugs,
  fetchServiceSlugs,
} from "@/sanity/queries";
import type { MetadataRoute } from "next";

export const generateWrongStaticUrls = () => {
  const urls: string[] = [];

  // Pour chaque locale et chaque route définie dans routing.ts
  for (const locale of routing.locales) {
    // Parcourir toutes les routes définies dans routing.pathnames
    for (const [path, localized] of Object.entries(routing.pathnames)) {
      // Ignorer les routes dynamiques avec paramètres
      if (
        (path.includes("[") && path.includes("]")) ||
        path === "/services" || //car services est pareil dans les 2 langues
        path === "/"
      )
        continue;

      // Obtenir le chemin localisé
      let localizedPath = "";
      if (typeof localized == "string") {
        localizedPath = localized;
      } else if (localized && locale in localized) {
        localizedPath = localized[locale === "fr" ? "en" : "fr"];
      } else {
        localizedPath = path;
      }
      // Ajouter l'URL au sitemap
      urls.push(`/${locale}${localizedPath}/*`);
    }
  }
  return urls;
};

export default async function robots(): Promise<MetadataRoute.Robots> {
  const wrongStaticUrls = generateWrongStaticUrls();
  const serviceSlugs = await fetchServiceSlugs();
  const articlesCategories = await fetchArticleCategories();
  const articleSlugs = await fetchArticleSlugs();
  const secteursSlugs = await fetchSecteursSlugs();

  const wrongServicesUrls = serviceSlugs.flatMap((slug) =>
    slug
      ? [`/fr/services/${getServicesSlugEn(slug)}`, `/en/services/${slug}`]
      : []
  );
  const wrongArticlesCategoriesUrls = articlesCategories.flatMap((slug) =>
    slug ? [`/fr/articles/${getArticlesSlugEn(slug)}`, `/en/posts/${slug}`] : []
  );
  const wrongArticlesUrls = articleSlugs.flatMap((article) => [
    `/fr/articles/${getArticlesSlugEn(article.slug)}/${article.subSlug}`,
    `/fr/articles/${article.slug}/${getArticlesSubSlugEn(article.subSlug)}`,
    `/en/posts/${article.slug}/${article.subSlug}`,
    `/en/posts/${article.slug}/${getArticlesSubSlugEn(article.subSlug)}`,
  ]);
  const wrongSecteursUrls = secteursSlugs.flatMap((slug) =>
    slug
      ? [`/fr/secteurs/${getSecteurSlugEn(slug)}`, `/en/sectors/${slug}`]
      : []
  );

  const disallowUrls = [
    "/fr/test-shadcn-colors",
    "/en/test-shadcn-colors",
    "/fr/tag/*",
    "/en/tag/*",
    "/fr/mon-devis/*",
    "/en/my-quote/*",
    "/fr/admin/*",
    "/en/admin/*",
    "/fr/client/*",
    "/en/client/*",
    "/fr/fournisseur/*",
    "/en/fournisseur/*",
    "/fr/auth/*",
    "/en/auth/*",
    // ...wrongStaticUrls,
    // ...wrongServicesUrls,
    // ...wrongArticlesCategoriesUrls,
    // ...wrongArticlesUrls,
    // ...wrongSecteursUrls,
  ];

  const uniqueDisallowUrls = [...new Set(disallowUrls)];

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: uniqueDisallowUrls,
      },
    ],
    sitemap: "https://www.fm4all.com/sitemap.xml",
  };
}
