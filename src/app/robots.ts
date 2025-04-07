import {
  getArticlesSlugEn,
  getArticlesSubSlugEn,
} from "@/i18n/articlesSlugMappings";
import { routing } from "@/i18n/routing";
import { getServicesSlugEn } from "@/i18n/servicesSlugMappings";
import { getTagSlugEn } from "@/i18n/tagsSlugMappings";
import {
  fetchArticleCategories,
  fetchArticleSlugs,
  fetchServiceSlugs,
  fetchTagsSlugs,
} from "@/sanity/queries";
import type { MetadataRoute } from "next";

const generateWrongStaticUrls = () => {
  const urls: string[] = [];

  // Pour chaque locale et chaque route définie dans routing.ts
  for (const locale of routing.locales) {
    // Parcourir toutes les routes définies dans routing.pathnames
    for (const [path, localized] of Object.entries(routing.pathnames)) {
      // Ignorer les routes dynamiques avec paramètres
      if (
        (path.includes("[") && path.includes("]")) ||
        path === "/services" ||
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
      urls.push(`/${locale}${localizedPath}`);
    }
  }
  return urls;
};

export default async function robots(): Promise<MetadataRoute.Robots> {
  const wrongStaticUrls = generateWrongStaticUrls();
  const serviceSlugs = await fetchServiceSlugs();
  const articlesCategories = await fetchArticleCategories();
  const articleSlugs = await fetchArticleSlugs();
  const tagsSlugs = await fetchTagsSlugs();

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
  const wrongTagsUrls = tagsSlugs.flatMap((slug) =>
    slug ? [`/fr/tags/${getTagSlugEn(slug)}`, `/en/tags/${slug}`] : []
  );

  const disallowUrls = [
    "/fr/mon-devis/*",
    "/en/my-quote/*",
    ...wrongStaticUrls,
    ...wrongServicesUrls,
    ...wrongArticlesCategoriesUrls,
    ...wrongArticlesUrls,
    ...wrongTagsUrls,
  ];

  const uniqueDisallowUrls = [...new Set(disallowUrls)];

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/fr/mon-devis/mes-locaux", "/en/my-quote/my-premises"],
        disallow: uniqueDisallowUrls,
      },
    ],
    sitemap: "https://www.fm4all.com/sitemap.xml",
  };
}
