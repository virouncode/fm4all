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
    fr: "/services",
    en: "/services",
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
      slugs["en"] as string
    );
    frUrl = `https://www.fm4all.com/fr${routes[routeKey]["fr"]}`.replace(
      "[slug]",
      slugs["fr"] as string
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
  } else if (routeKey === "secteurPresentation" && slugs) {
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
          url:
            imageUrl ??
            "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/fm4all_logo/logo_fm4all-npSiw7PiYrpkPsnBLuzDYGVO5rWVZb.png",
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
