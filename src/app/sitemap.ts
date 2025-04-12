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
import { MetadataRoute } from "next";
const BASE_URL = "https://www.fm4all.com";

const lastMod = new Date().toISOString();
// Fonction pour générer les URLs des pages statiques
const generateStaticUrls = () => {
  const urls: MetadataRoute.Sitemap = [];

  // Pour chaque locale et chaque route définie dans routing.ts
  for (const locale of routing.locales) {
    // Parcourir toutes les routes définies dans routing.pathnames
    for (const [path, localized] of Object.entries(routing.pathnames)) {
      // Ignorer les routes dynamiques avec paramètres
      if (path.includes("[") && path.includes("]")) continue;

      // Obtenir le chemin localisé
      let localizedPath = "";
      if (typeof localized == "string") {
        localizedPath = localized;
      } else if (localized && locale in localized) {
        localizedPath = path === "/" ? "" : localized[locale];
      } else {
        localizedPath = path;
      }

      // Ajouter l'URL au sitemap
      urls.push({
        url: `${BASE_URL}/${locale}${localizedPath}`,
        lastModified: lastMod,
        changeFrequency: "weekly",
        priority: localizedPath ? 0.8 : 1,
      });
    }
  }

  return urls;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls = generateStaticUrls();
  const serviceSlugs = await fetchServiceSlugs();
  const articlesCategories = await fetchArticleCategories();
  const articleSlugs = await fetchArticleSlugs();
  const tagsSlugs = await fetchTagsSlugs();

  const servicesUrls: MetadataRoute.Sitemap = serviceSlugs.flatMap((slug) => {
    if (!slug) return [];
    return [
      {
        url: `${BASE_URL}/fr/services/${slug}`,
        lastModified: lastMod,
        changeFrequency: "weekly",
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/en/services/${getServicesSlugEn(slug)}`,
        lastModified: lastMod,
        changeFrequency: "weekly",
        priority: 0.7,
      },
    ];
  });
  const articlesCategoriesUrls: MetadataRoute.Sitemap =
    articlesCategories.flatMap((slug) => {
      if (!slug) return [];
      return [
        {
          url: `${BASE_URL}/fr/articles/${slug}`,
          lastModified: lastMod,
          changeFrequency: "weekly",
          priority: 0.7,
        },
        {
          url: `${BASE_URL}/en/posts/${getArticlesSlugEn(slug)}`,
          lastModified: lastMod,
          changeFrequency: "weekly",
          priority: 0.7,
        },
      ];
    });
  const articlesUrls: MetadataRoute.Sitemap = articleSlugs.flatMap(
    (article) => {
      return [
        {
          url: `${BASE_URL}/fr/articles/${article.slug}/${article.subSlug}`,
          lastModified: lastMod,
          changeFrequency: "weekly",
          priority: 0.7,
        },
        {
          url: `${BASE_URL}/en/posts/${getArticlesSlugEn(article.slug)}/${getArticlesSubSlugEn(article.subSlug)}`,
          lastModified: lastMod,
          changeFrequency: "weekly",
          priority: 0.7,
        },
      ];
    }
  );
  const tagsUrls: MetadataRoute.Sitemap = tagsSlugs.flatMap((slug) => {
    if (!slug) return [];
    return [
      {
        url: `${BASE_URL}/fr/tag/${slug}`,
        lastModified: lastMod,
        changeFrequency: "weekly",
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/en/tag/${getTagSlugEn(slug)}`,
        lastModified: lastMod,
        changeFrequency: "weekly",
        priority: 0.7,
      },
    ];
  });

  return [
    ...staticUrls,
    ...servicesUrls,
    ...articlesCategoriesUrls,
    ...articlesUrls,
    ...tagsUrls,
  ];
}
