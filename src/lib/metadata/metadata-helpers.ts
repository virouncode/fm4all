import { LocaleType } from "@/i18n/routing";
import { Metadata } from "next";

const BASE_URL = "https://www.fm4all.com";
const DEFAULT_OG_IMAGE =
  "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/fm4all_logo/logo_fm4all-npSiw7PiYrpkPsnBLuzDYGVO5rWVZb.png";

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
  | "serviceVille"
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
  | "travail"
  | "secteurs"
  | "secteurPresentation";

export const routes: Record<RouteKey, Record<LocaleType, string>> = {
  home: {
    fr: "/",
    en: "/",
  },
  cgu: {
    fr: "/conditions-generales-d-utilisation",
    en: "/terms-of-use",
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
    en: "/legal-notice",
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
  serviceVille: {
    fr: "/services/[slug]/[subSlug]",
    en: "/services/[slug]/[subSlug]",
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
  travail: {
    fr: "/carriere",
    en: "/careers",
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

type SingleSlugRouteKey =
  | "blogCategorie"
  | "servicePresentation"
  | "secteurPresentation";
type DoubleSlugRouteKey = "blogArticle" | "serviceVille";
type NoSlugRouteKey = Exclude<RouteKey, SingleSlugRouteKey | DoubleSlugRouteKey>;

type SingleSlugParams = { fr: string; en: string };
type DoubleSlugParams = {
  fr: { slug: string; subSlug: string };
  en: { slug: string; subSlug: string };
};

export function generateAlternates(
  routeKey: NoSlugRouteKey,
  locale: LocaleType,
  title: string,
  description: string,
  imageUrl?: string,
): Metadata;
export function generateAlternates(
  routeKey: SingleSlugRouteKey,
  locale: LocaleType,
  title: string,
  description: string,
  imageUrl: string | undefined,
  slugs: SingleSlugParams,
): Metadata;
export function generateAlternates(
  routeKey: DoubleSlugRouteKey,
  locale: LocaleType,
  title: string,
  description: string,
  imageUrl: string | undefined,
  slugs: DoubleSlugParams,
): Metadata;
export function generateAlternates(
  routeKey: RouteKey,
  locale: LocaleType,
  title: string,
  description: string,
  imageUrl?: string,
  slugs?: SingleSlugParams | DoubleSlugParams,
): Metadata {
  let canonicalUrl = "";
  let enUrl = "";
  let frUrl = "";

  if (routeKey === "home") {
    canonicalUrl = `${BASE_URL}/${locale}`;
    enUrl = `${BASE_URL}/en`;
    frUrl = `${BASE_URL}/fr`;
  } else if (routeKey === "blogCategorie" && slugs) {
    const s = slugs as SingleSlugParams;
    canonicalUrl = `${BASE_URL}/${locale}${routes[routeKey][locale]}`.replace(
      "[slug]",
      s[locale],
    );
    enUrl = `${BASE_URL}/en${routes[routeKey]["en"]}`.replace("[slug]", s.en);
    frUrl = `${BASE_URL}/fr${routes[routeKey]["fr"]}`.replace("[slug]", s.fr);
  } else if (routeKey === "blogArticle" && slugs) {
    const s = slugs as DoubleSlugParams;
    canonicalUrl = `${BASE_URL}/${locale}${routes[routeKey][locale]}`
      .replace("[slug]", s[locale].slug)
      .replace("[subSlug]", s[locale].subSlug);
    enUrl = `${BASE_URL}/en${routes[routeKey]["en"]}`
      .replace("[slug]", s.en.slug)
      .replace("[subSlug]", s.en.subSlug);
    frUrl = `${BASE_URL}/fr${routes[routeKey]["fr"]}`
      .replace("[slug]", s.fr.slug)
      .replace("[subSlug]", s.fr.subSlug);
  } else if (routeKey === "servicePresentation" && slugs) {
    const s = slugs as SingleSlugParams;
    canonicalUrl = `${BASE_URL}/${locale}${routes[routeKey][locale]}`.replace(
      "[slug]",
      s[locale],
    );
    enUrl = `${BASE_URL}/en${routes[routeKey]["en"]}`.replace("[slug]", s.en);
    frUrl = `${BASE_URL}/fr${routes[routeKey]["fr"]}`.replace("[slug]", s.fr);
  } else if (routeKey === "serviceVille" && slugs) {
    const s = slugs as DoubleSlugParams;
    canonicalUrl = `${BASE_URL}/${locale}${routes[routeKey][locale]}`
      .replace("[slug]", s[locale].slug)
      .replace("[subSlug]", s[locale].subSlug);
    enUrl = `${BASE_URL}/en${routes[routeKey]["en"]}`
      .replace("[slug]", s.en.slug)
      .replace("[subSlug]", s.en.subSlug);
    frUrl = `${BASE_URL}/fr${routes[routeKey]["fr"]}`
      .replace("[slug]", s.fr.slug)
      .replace("[subSlug]", s.fr.subSlug);
  } else if (routeKey === "secteurPresentation" && slugs) {
    const s = slugs as SingleSlugParams;
    canonicalUrl = `${BASE_URL}/${locale}${routes[routeKey][locale]}`.replace(
      "[slug]",
      s[locale],
    );
    enUrl = `${BASE_URL}/en${routes[routeKey]["en"]}`.replace("[slug]", s.en);
    frUrl = `${BASE_URL}/fr${routes[routeKey]["fr"]}`.replace("[slug]", s.fr);
  } else {
    canonicalUrl = `${BASE_URL}/${locale}${routes[routeKey][locale]}`;
    enUrl = `${BASE_URL}/en${routes[routeKey]["en"]}`;
    frUrl = `${BASE_URL}/fr${routes[routeKey]["fr"]}`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        fr: frUrl,
        en: enUrl,
        "x-default": routeKey === "home" ? BASE_URL : frUrl,
      },
    },
    openGraph: {
      images: [
        {
          url: imageUrl ?? DEFAULT_OG_IMAGE,
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
