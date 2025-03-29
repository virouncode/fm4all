import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "fr",
  pathnames: {
    "/": {
      fr: "/",
      en: "/",
    },
    "/services": {
      fr: "/services",
      en: "/services",
    },
    "/services/[slug]": {
      fr: "/services/[slug]",
      en: "/services/[slug]",
    },
    "/secteurs": {
      fr: "/secteurs",
      en: "/sectors",
    },
    "/secteurs/[slug]": {
      fr: "/secteurs/[slug]",
      en: "/sectors/[slug]",
    },

    // "/services/securite-incendie": {
    //   fr: "/services/securite-incendie",
    //   en: "/services/fire-safety",
    // },
    // "/services/nettoyage": {
    //   fr: "/services/nettoyage",
    //   en: "/services/cleaning-services",
    // },
    "/nos-3-gammes": {
      fr: "/nos-3-gammes",
      en: "/our-3-tiers",
    },
    "/nos-engagements": {
      fr: "/nos-engagements",
      en: "/our-commitments",
    },
    "/nos-partenaires": {
      fr: "/nos-partenaires",
      en: "/our-partners",
    },
    "/faq": {
      fr: "/foire-aux-questions",
      en: "/frequently-asked-questions",
    },
    "/devenir-prestataire": {
      fr: "/devenir-prestataire",
      en: "/become-a-provider",
    },
    "/contact": {
      fr: "/contactez-nous",
      en: "/contact-us",
    },
    "/mentions-legales": {
      fr: "/mentions-legales",
      en: "/legal-notice",
    },
    "/politique-de-confidentialite": {
      fr: "/politique-de-confidentialite",
      en: "/privacy-policy",
    },
    "/politique-de-cookies": {
      fr: "/politique-de-cookies",
      en: "/cookie-policy",
    },
  },
});

export type Locale = "fr" | "en";
