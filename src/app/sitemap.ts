import { routing } from "@/i18n/routing";
import {
  getArticlesSlugEn,
  getArticlesSubSlugEn,
} from "@/redirects/articlesSlugMappings";
import { getSecteurSlugEn } from "@/redirects/secteursSlugMappings";
import {
  getServicesSlugEn,
  getServicesSubSlugEn,
} from "@/redirects/servicesSlugMappings";
import {
  fetchArticleCategories,
  fetchArticleSlugs,
  fetchSecteursSlugs,
  fetchServiceSlugs,
  fetchServiceVilleSlugs,
} from "@/sanity/queries";
import { MetadataRoute } from "next";
const APP_URL = "https://www.fm4all.com";

const lastMod = new Date().toISOString();
// Fonction pour générer les URLs des pages statiques
const generateStaticUrls = () => {
  const urls: MetadataRoute.Sitemap = [];
  // Pages légales (peu de valeur SEO)
  const pathsSecondaires = [
    "/mentions",
    "/confidentialite",
    "/cookies",
    "/cgv",
    "/cgu",
  ];

  // Pages importantes mais pas de contenu Sanity dynamique
  const priorityMap: Record<string, number> = {
    "/services": 0.9,
    "/blog": 0.9,
    "/secteurs": 0.9,
    "/gammes": 0.9,
    "/engagements": 0.8,
    "/partenaires": 0.8,
    "/faq": 0.8,
    "/prestataire": 0.7,
    "/contact": 0.7,
    "/travail": 0.6,
  };

  // Pour chaque locale et chaque route définie dans routing.ts
  for (const locale of routing.locales) {
    // Parcourir toutes les routes définies dans routing.pathnames
    for (const [path, localized] of Object.entries(routing.pathnames)) {
      // Ignorer les routes dynamiques avec paramètres et les routes non pertinentes pour le SEO
      if (
        (path.includes("[") && path.includes("]")) ||
        path.includes("/devis") ||
        path.includes("/chalandise")
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

      // Calculer la priorité
      const priority = localizedPath
        ? pathsSecondaires.includes(path)
          ? 0.5
          : (priorityMap[path] ?? 0.8)
        : 1;

      // Ajouter l'URL au sitemap
      urls.push({
        url: `${APP_URL}/${locale}${localizedPath}`,
        lastModified: lastMod,
        changeFrequency: "weekly",
        priority,
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
  const servicesVillesSlugs = await fetchServiceVilleSlugs();

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
  const servicesVillesUrls: MetadataRoute.Sitemap = servicesVillesSlugs.flatMap(
    (serviceVille) => {
      return [
        {
          url: `${APP_URL}/fr/services/${serviceVille.slug}/${serviceVille.subSlug}`,
          lastModified: lastMod,
          changeFrequency: "weekly",
          priority: 0.7,
        },
        {
          url: `${APP_URL}/en/services/${getServicesSlugEn(serviceVille.slug)}/${getServicesSubSlugEn(serviceVille.subSlug)}`,
          lastModified: lastMod,
          changeFrequency: "weekly",
          priority: 0.7,
        },
      ];
    },
  );

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
    },
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
    ...servicesVillesUrls,
    ...articlesCategoriesUrls,
    ...articlesUrls,
    ...secteursUrls,
  ];
}
