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
    "/blog": {
      fr: "/articles",
      en: "/posts",
    },
    "/blog/[slug]": {
      fr: "/articles/[slug]",
      en: "/posts/[slug]",
    },
    "/blog/[slug]/[subSlug]": {
      fr: "/articles/[slug]/[subSlug]",
      en: "/posts/[slug]/[subSlug]",
    },
    "/tag/[tag]": {
      fr: "/tag/[tag]",
      en: "/tag/[tag]",
    },
    "/auth/signin": {
      fr: "/auth/signin",
      en: "/auth/signin",
    },
    "/auth/signup": {
      fr: "/auth/signup",
      en: "/auth/signup",
    },
    "/auth/redirect": {
      fr: "/auth/redirect",
      en: "/auth/redirect",
    },
    "/auth/email-ok": {
      fr: "/auth/email-ok",
      en: "/auth/email-ok",
    },
    "/admin/dashboard": {
      fr: "/admin/dashboard",
      en: "/admin/dashboard",
    },
    "/admin/comptes": {
      fr: "/admin/comptes",
      en: "/admin/accounts",
    },
    "/admin/signup": {
      fr: "/admin/signup",
      en: "/admin/signup",
    },
    "/client/dashboard": {
      fr: "/client/dashboard",
      en: "/client/dashboard",
    },
    "/fournisseur/dashboard": {
      fr: "/fournisseur/dashboard",
      en: "/fournisseur/dashboard",
    },
  },
});

export type Locale = "fr" | "en";
export type PathnamesType =
  | "/"
  | "/services"
  | "/services/[slug]"
  | "/secteurs"
  | "/secteurs/[slug]"
  | "/blog"
  | "/blog/[slug]"
  | "/gammes"
  | "/engagements"
  | "/partenaires"
  | "/faq"
  | "/prestataire"
  | "/contact"
  | "/mentions"
  | "/confidentialite"
  | "/cookies"
  | "/cgv"
  | "/cgu"
  | "/chalandise"
  | "/devis/locaux"
  | "/devis/services"
  | "/devis/food-beverage"
  | "/devis/pilotage"
  | "/devis/sauvegarder"
  | "/devis/personnaliser"
  | "/devis/afficher"
  | "/tag/[tag]";
