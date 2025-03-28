import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "fr"],

  // Used when no locale matches
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
