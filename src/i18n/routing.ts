import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "fr",
  pathnames: {
    "/": "/",
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
    "/blog": {
      fr: "/blog",
      en: "/blog",
    },
    "/blog/[slug]": {
      fr: "/blog/[slug]",
      en: "/blog/[slug]",
    },
    "/gammes": {
      fr: "/nos-3-gammes",
      en: "/our-3-tiers",
    },
    "/engagements": {
      fr: "/nos-engagements",
      en: "/our-commitments",
    },
    "/partenaires": {
      fr: "/nos-partenaires",
      en: "/our-partners",
    },
    "/faq": {
      fr: "/foire-aux-questions",
      en: "/frequently-asked-questions",
    },
    "/prestataire": {
      fr: "/devenir-prestataire",
      en: "/become-a-provider",
    },
    "/contact": {
      fr: "/contactez-nous",
      en: "/contact-us",
    },
    "/mentions": {
      fr: "/mentions-legales",
      en: "/legal-notice",
    },
    "/confidentialite": {
      fr: "/politique-de-confidentialite",
      en: "/privacy-policy",
    },
    "/cookies": {
      fr: "/politique-de-cookies",
      en: "/cookie-policy",
    },
    "/cgv": {
      fr: "/conditions-generales-de-vente",
      en: "/sales-terms-and-conditions",
    },
    "/cgu": {
      fr: "/conditions-generales-dutilisation",
      en: "/terms-of-use",
    },
    "/chalandise": {
      fr: "/zone-non-couverte",
      en: "/area-not-covered",
    },
    "/devis/locaux": {
      fr: "/mon-devis/mes-locaux",
      en: "/my-quote/my-premises",
    },
    "/devis/services": {
      fr: "/mon-devis/mes-services",
      en: "/my-quote/my-services",
    },
    "/devis/food-beverage": {
      fr: "/mon-devis/food-and-beverage",
      en: "/my-quote/food-and-beverage",
    },
    "/devis/pilotage": {
      fr: "/mon-devis/pilotage-prestations",
      en: "/my-quote/service-management",
    },
    "/devis/sauvegarder": {
      fr: "/mon-devis/sauvegarder-ma-progression",
      en: "/my-quote/save-my-progress",
    },
    "/devis/personnaliser": {
      fr: "/mon-devis/personnaliser-mon-devis",
      en: "/my-quote/customize-my-quote",
    },
    "/devis/afficher": {
      fr: "/mon-devis/afficher-mon-devis",
      en: "/my-quote/view-my-quote",
    },
  },
});

export type Locale = "fr" | "en";
