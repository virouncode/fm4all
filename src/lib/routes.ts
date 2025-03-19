export type RouteKey =
  | "notFound"
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
  | "prestataires";

export const routes: Record<RouteKey, Record<"fr" | "en", string>> = {
  notFound: {
    fr: "/404",
    en: "/404",
  },
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
    en: "/cookies-policy",
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
};

export const routeMapping: Record<"fr" | "en", Record<string, string>> = {
  en: {
    "/": "/",
    "/conditions-generales-d-utilisation": "/terms-and-conditions-of-use",
    "/conditions-generales-de-vente": "/sales-terms-and-conditions",
    "/zone-non-couverte": "/area-not-covered",
    "/politique-de-confidentialite": "/privacy-policy",
    "/contactez-nous": "/contact-us",
    "/politique-de-cookies": "/cookies-policy",
    "/nos-engagements": "/our-commitments",
    "/foire-aux-questions": "/frequently-asked-questions",
    "/nos-3-gammes": "/our-3-tiers",
    "/mentions-legales": "/legal-notices",
    "/nos-partenaires": "/our-partners",
    "/devenir-prestataire": "/become-a-provider",
  },
  fr: {
    "/": "/",
    "/terms-and-conditions-of-use": "/conditions-generales-d-utilisation",
    "/sales-terms-and-conditions": "/conditions-generales-de-vente",
    "/area-not-covered": "/zone-non-couverte",
    "/privacy-policy": "/politique-de-confidentialite",
    "/contact-us": "/contactez-nous",
    "/cookies-policy": "/politique-de-cookies",
    "/our-commitments": "/nos-engagements",
    "/frequently-asked-questions": "/foire-aux-questions",
    "/our-3-tiers": "/nos-3-gammes",
    "/legal-notices": "/mentions-legales",
    "/our-partners": "/nos-partenaires",
    "/become-a-provider": "/devenir-prestataire",
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
