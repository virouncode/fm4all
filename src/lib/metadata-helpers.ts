import { Metadata } from "next";

export type RouteKey =
  | "home"
  | "cgu"
  | "cgv"
  | "chalandise"
  | "confidentialite"
  | "contact"
  | "cookies"
  | "engagements"
  | "faq"
  | "gammes"
  | "mentions"
  | "partenaires"
  | "prestataires"
  | "services"
  | "servicePresentation"
  | "locauxDevis"
  | "servicesDevis"
  | "foodDevis"
  | "pilotageDevis"
  | "sauverDevis"
  | "personnaliserDevis"
  | "monDevis"
  | "blog"
  | "blogCategorie"
  | "blogArticle"
  | "tag"
  | "secteurs"
  | "secteurPresentation";

export const routes: Record<RouteKey, Record<"fr" | "en", string>> = {
  home: {
    fr: "/",
    en: "/",
  },
  cgu: {
    fr: "/conditions-generales-d-utilisation",
    en: "/terms-and-conditions-of-use",
  },
  cgv: {
    fr: "/conditions-generales-de-vente",
    en: "/sales-terms-and-conditions",
  },
  chalandise: {
    fr: "/zone-non-couverte",
    en: "/area-not-covered",
  },
  confidentialite: {
    fr: "/politique-de-confidentialite",
    en: "/privacy-policy",
  },
  contact: {
    fr: "/contactez-nous",
    en: "/contact-us",
  },
  cookies: {
    fr: "/politique-de-cookies",
    en: "/cookie-policy",
  },
  engagements: {
    fr: "/nos-engagements",
    en: "/our-commitments",
  },
  faq: {
    fr: "/foire-aux-questions",
    en: "/frequently-asked-questions",
  },
  gammes: {
    fr: "/nos-3-gammes",
    en: "/our-3-tiers",
  },
  mentions: {
    fr: "/mentions-legales",
    en: "/legal-notices",
  },
  partenaires: {
    fr: "/nos-partenaires",
    en: "/our-partners",
  },
  prestataires: {
    fr: "/devenir-prestataire",
    en: "/become-a-provider",
  },
  services: {
    fr: "/nos-services",
    en: "/our-services",
  },
  servicePresentation: {
    fr: "/services/[slug]",
    en: "/services/[slug]",
  },
  locauxDevis: {
    fr: "/mon-devis/mes-locaux",
    en: "/my-quote/my-premises",
  },
  servicesDevis: {
    fr: "/mon-devis/mes-services",
    en: "/my-quote/my-services",
  },
  foodDevis: {
    fr: "/mon-devis/food-beverage",
    en: "/my-quote/food-beverage",
  },
  pilotageDevis: {
    fr: "/mon-devis/pilotage-prestations",
    en: "/my-quote/service-management",
  },
  sauverDevis: {
    fr: "/mon-devis/sauvegarder-ma-progression",
    en: "/my-quote/save-my-progress",
  },
  personnaliserDevis: {
    fr: "/mon-devis/personnaliser-mon-devis",
    en: "/my-quote/customize-my-quote",
  },
  monDevis: {
    fr: "/mon-devis/afficher-mon-devis",
    en: "/my-quote/view-my-quote",
  },
  blog: {
    fr: "/articles",
    en: "/posts",
  },
  blogCategorie: {
    fr: "/articles/[slug]",
    en: "/posts/[slug]",
  },
  blogArticle: {
    fr: "/articles/[slug]/[subSlug]",
    en: "/posts/[slug]/[subSlug]",
  },
  tag: {
    fr: "/tag/[tag]",
    en: "/tag/[tag]",
  },
  secteurs: {
    fr: "/secteurs",
    en: "/sectors",
  },
  secteurPresentation: {
    fr: "/secteurs/[slug]",
    en: "/sectors/[slug]",
  },
};

export const routeMapping: Record<"fr" | "en", Record<string, string>> = {
  en: {
    "/": "/",
    "/conditions-generales-d-utilisation": "/terms-and-conditions-of-use",
    "/conditions-generales-de-vente": "/sales-terms-and-conditions",
    "/zone-non-couverte": "/area-not-covered",
    "/politique-de-confidentialite": "/privacy-policy",
    "/contactez-nous": "/contact-us",
    "/politique-de-cookies": "/cookie-policy",
    "/nos-engagements": "/our-commitments",
    "/foire-aux-questions": "/frequently-asked-questions",
    "/nos-3-gammes": "/our-3-tiers",
    "/mentions-legales": "/legal-notices",
    "/nos-partenaires": "/our-partners",
    "/devenir-prestataire": "/become-a-provider",
    "/nos-services": "/our-services",
    "/mon-devis/mes-locaux": "/my-quote/my-premises",
    "/mon-devis/mes-services": "/my-quote/my-services",
    "/mon-devis/food-beverage": "/my-quote/food-beverage",
    "/mon-devis/pilotage-prestations": "/my-quote/service-management",
    "/mon-devis/sauvegarder-ma-progression": "/my-quote/save-my-progress",
    "/mon-devis/personnaliser-mon-devis": "/my-quote/customize-my-quote",
    "/mon-devis/afficher-mon-devis": "/my-quote/view-my-quote",
  },
  fr: {
    "/": "/",
    "/terms-and-conditions-of-use": "/conditions-generales-d-utilisation",
    "/sales-terms-and-conditions": "/conditions-generales-de-vente",
    "/area-not-covered": "/zone-non-couverte",
    "/privacy-policy": "/politique-de-confidentialite",
    "/contact-us": "/contactez-nous",
    "/cookie-policy": "/politique-de-cookies",
    "/our-commitments": "/nos-engagements",
    "/frequently-asked-questions": "/foire-aux-questions",
    "/our-3-tiers": "/nos-3-gammes",
    "/legal-notices": "/mentions-legales",
    "/our-partners": "/nos-partenaires",
    "/become-a-provider": "/devenir-prestataire",
    "/our-services": "/nos-services",
    "/my-quote/my-premises": "/mon-devis/mes-locaux",
    "/my-quote/my-services": "/mon-devis/mes-services",
    "/my-quote/food-beverage": "/mon-devis/food-beverage",
    "/my-quote/service-management": "/mon-devis/pilotage-prestations",
    "/my-quote/save-my-progress": "/mon-devis/sauvegarder-ma-progression",
    "/my-quote/customize-my-quote": "/mon-devis/personnaliser-mon-devis",
    "/my-quote/view-my-quote": "/mon-devis/afficher-mon-devis",
  },
};

export const isValidPathForLocale = (
  pathWithoutLocale: string,
  locale: "fr" | "en"
): boolean => {
  // console.log("pathWithoutLocale", pathWithoutLocale);

  const validPaths = Object.values(routes).map((route) => route[locale]);
  // console.log("validPaths", validPaths);
  if (validPaths.includes(pathWithoutLocale)) return true;
  return false;
};

export function getEquivalentPath(
  pathWithoutLocale: string,
  locale: "fr" | "en"
): string | null {
  if (isValidPathForLocale(pathWithoutLocale, locale)) return pathWithoutLocale;
  return routeMapping[locale][pathWithoutLocale] || "/404";
}

export function generateAlternates(
  routeKey: RouteKey,
  locale: string,
  title: string,
  description: string,
  imageUrl?: string,
  slugs?: {
    fr: string | { slug: string; subSlug?: string };
    en: string | { slug: string; subSlug?: string };
  }
): Metadata {
  let canonicalUrl = "";
  let enUrl = "";
  let frUrl = "";

  if (routeKey === "home") {
    canonicalUrl = `https://www.fm4all.com/${locale}`;
    enUrl = `https://www.fm4all.com/en`;
    frUrl = `https://www.fm4all.com/fr`;
  } else if (routeKey === "blogCategorie" && slugs) {
    canonicalUrl =
      `https://www.fm4all.com/${locale}${routes[routeKey][locale as "fr" | "en"]}`.replace(
        "[slug]",
        slugs[locale as "fr" | "en"] as string
      );
    enUrl = `https://www.fm4all.com/en${routes[routeKey]["en"]}`.replace(
      "[slug]",
      slugs[locale as "fr" | "en"] as string
    );
    frUrl = `https://www.fm4all.com/fr${routes[routeKey]["fr"]}`.replace(
      "[slug]",
      slugs[locale as "fr" | "en"] as string
    );
  } else if (routeKey === "blogArticle" && slugs) {
    canonicalUrl =
      `https://www.fm4all.com/${locale}${routes[routeKey][locale as "fr" | "en"]}`
        .replace(
          "[slug]",
          (slugs[locale as "fr" | "en"] as { slug: string; subSlug?: string })
            .slug
        )
        .replace(
          "[subSlug]",
          (slugs[locale as "fr" | "en"] as { slug: string; subSlug?: string })
            .subSlug || ""
        );
    enUrl = `https://www.fm4all.com/en${routes[routeKey]["en"]}`
      .replace(
        "[slug]",
        (slugs["en"] as { slug: string; subSlug?: string }).slug
      )
      .replace(
        "[subSlug]",
        (slugs["en"] as { slug: string; subSlug?: string }).subSlug || ""
      );
    frUrl = `https://www.fm4all.com/fr${routes[routeKey]["fr"]}`
      .replace(
        "[slug]",
        (slugs["fr"] as { slug: string; subSlug?: string }).slug
      )
      .replace(
        "[subSlug]",
        (slugs["fr"] as { slug: string; subSlug?: string }).subSlug || ""
      );
  } else if (routeKey === "servicePresentation" && slugs) {
    canonicalUrl =
      `https://www.fm4all.com/${locale}${routes[routeKey][locale as "fr" | "en"]}`.replace(
        "[slug]",
        slugs[locale as "fr" | "en"] as string
      );
    enUrl = `https://www.fm4all.com/en${routes[routeKey]["en"]}`.replace(
      "[slug]",
      slugs["en"] as string
    );
    frUrl = `https://www.fm4all.com/fr${routes[routeKey]["fr"]}`.replace(
      "[slug]",
      slugs["fr"] as string
    );
  } else {
    canonicalUrl = `https://www.fm4all.com/${locale}${routes[routeKey][locale as "fr" | "en"]}`;
    enUrl = `https://www.fm4all.com/en${routes[routeKey]["en"]}`;
    frUrl = `https://www.fm4all.com/fr${routes[routeKey]["fr"]}`;
  }
  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: enUrl,
        fr: frUrl,
      },
    },
    openGraph: {
      images: [
        {
          url: imageUrl ?? "/img/logo_full_white.webp",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}

export const getPathnameWithoutLocale = (pathname: string) => {
  const supportedLocales = ["fr", "en"];
  const parts = pathname.split("/").filter(Boolean);

  if (supportedLocales.includes(parts[0])) {
    // Enlève le segment de langue
    return "/" + parts.slice(1).join("/");
  }
  return pathname;
};

export const getLocaleFromPathname = (pathname: string) => {
  const supportedLocales = ["fr", "en"];
  const parts = pathname.split("/").filter(Boolean);
  if (supportedLocales.includes(parts[0])) {
    return parts[0];
  }
  return null;
};
