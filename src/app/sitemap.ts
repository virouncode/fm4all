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
import { MetadataRoute } from "next";
const APP_URL = "https://www.fm4all.com";

const lastMod = new Date().toISOString();
// Fonction pour générer les URLs des pages statiques
const generateStaticUrls = () => {
  const urls: MetadataRoute.Sitemap = [];
  const pathsSecondaires = [
    "/mentions",
    "/confidentialite",
    "/cookies",
    "/cgv",
    "/cgu",
    "/contact",
  ];

  // Pour chaque locale et chaque route définie dans routing.ts
  for (const locale of routing.locales) {
    // Parcourir toutes les routes définies dans routing.pathnames
    for (const [path, localized] of Object.entries(routing.pathnames)) {
      // Ignorer les routes dynamiques avec paramètres et les routes protégées
      if (
        (path.includes("[") && path.includes("]")) ||
        path.includes("/admin") ||
        path.includes("/client") ||
        path.includes("/fournisseur") ||
        path.includes("/auth") ||
        path.includes("/devis") ||
        path.includes("/chalandise") ||
        path.includes("/tag")
      )
        continue;

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
        url: `${APP_URL}/${locale}${localizedPath}`,
        lastModified: lastMod,
        changeFrequency: "weekly",
        priority: localizedPath
          ? pathsSecondaires.includes(path)
            ? 0.5
            : 0.8
          : 1,
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
  const secteursSlugs = await fetchSecteursSlugs();

  const servicesUrls: MetadataRoute.Sitemap = serviceSlugs.flatMap((slug) => {
    if (!slug) return [];
    return [
      {
        url: `${APP_URL}/fr/services/${slug}`,
        lastModified: lastMod,
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: `${APP_URL}/en/services/${getServicesSlugEn(slug)}`,
        lastModified: lastMod,
        changeFrequency: "weekly",
        priority: 0.9,
      },
    ];
  });
  const articlesCategoriesUrls: MetadataRoute.Sitemap =
    articlesCategories.flatMap((slug) => {
      if (!slug) return [];
      return [
        {
          url: `${APP_URL}/fr/articles/${slug}`,
          lastModified: lastMod,
          changeFrequency: "weekly",
          priority: 0.7,
        },
        {
          url: `${APP_URL}/en/posts/${getArticlesSlugEn(slug)}`,
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
          url: `${APP_URL}/fr/articles/${article.slug}/${article.subSlug}`,
          lastModified: lastMod,
          changeFrequency: "weekly",
          priority: 0.7,
        },
        {
          url: `${APP_URL}/en/posts/${getArticlesSlugEn(article.slug)}/${getArticlesSubSlugEn(article.subSlug)}`,
          lastModified: lastMod,
          changeFrequency: "weekly",
          priority: 0.7,
        },
      ];
    }
  );

  const secteursUrls: MetadataRoute.Sitemap = secteursSlugs.flatMap((slug) => {
    if (!slug) return [];
    return [
      {
        url: `${APP_URL}/fr/secteurs/${slug}`,
        lastModified: lastMod,
        changeFrequency: "weekly",
        priority: 0.7,
      },
      {
        url: `${APP_URL}/en/sectors/${getSecteurSlugEn(slug)}`,
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
    ...secteursUrls,
  ];
}
