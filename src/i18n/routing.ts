import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "fr",
  alternateLinks: false,
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
    "/services/[slug]/zones": {
      fr: "/services/[slug]/villes",
      en: "/services/[slug]/cities",
    },

    "/services/[slug]/[subSlug]": {
      fr: "/services/[slug]/[subSlug]",
      en: "/services/[slug]/[subSlug]",
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
    "/travail": {
      fr: "/carriere",
      en: "/careers",
    },
    // "/tag/[slug]": {
    //   fr: "/tag/[slug]",
    //   en: "/tag/[slug]",
    // },
    "/auth/signin": {
      fr: "/auth/signin",
      en: "/auth/signin",
    },
    // "/auth/signup": {
    //   fr: "/auth/signup",
    //   en: "/auth/signup",
    // },
    "/auth/redirect": {
      fr: "/auth/redirect",
      en: "/auth/redirect",
    },
    "/auth/email-ok": {
      fr: "/auth/email-ok",
      en: "/auth/email-ok",
    },
    "/auth/forgot-password": {
      fr: "/auth/forgot-password",
      en: "/auth/forgot-password",
    },
    "/auth/reset-password": {
      fr: "/auth/reset-password",
      en: "/auth/reset-password",
    },
    "/auth/unauthorized": {
      fr: "/auth/unauthorized",
      en: "/auth/unauthorized",
    },
    //ADMIN
    "/admin/[adminId]": {
      fr: "/admin/[adminId]",
      en: "/admin/[adminId]",
    },
    "/admin/[adminId]/dashboard": {
      fr: "/admin/[adminId]/dashboard",
      en: "/admin/[adminId]/dashboard",
    },
    "/admin/[adminId]/comptes": {
      fr: "/admin/[adminId]/comptes",
      en: "/admin/[adminId]/accounts",
    },
    "/admin/[adminId]/signup": {
      fr: "/admin/[adminId]/signup",
      en: "/admin/[adminId]/signup",
    },
    "/admin/[adminId]/info": {
      fr: "/admin/[adminId]/info",
      en: "/admin/[adminId]/info",
    },
    //CLIENT
    "/client/[clientId]": {
      fr: "/client/[clientId]",
      en: "/client/[clientId]",
    },

    // ----- Tickets -----
    "/client/[clientId]/tickets/nouveau-ticket": {
      fr: "/client/[clientId]/tickets/nouveau-ticket",
      en: "/client/[clientId]/tickets/nouveau-ticket",
    },

    "/client/[clientId]/tickets/tickets-en-cours": {
      fr: "/client/[clientId]/tickets/tickets-en-cours",
      en: "/client/[clientId]/tickets/tickets-en-cours",
    },

    "/client/[clientId]/tickets/action-requise": {
      fr: "/client/[clientId]/tickets/action-requise",
      en: "/client/[clientId]/tickets/action-requise",
    },

    "/client/[clientId]/tickets/tickets-a-valider": {
      fr: "/client/[clientId]/tickets/tickets-a-valider",
      en: "/client/[clientId]/tickets/tickets-a-valider",
    },

    // ----- Interventions -----
    "/client/[clientId]/interventions/programmer-intervention": {
      fr: "/client/[clientId]/interventions/programmer-intervention",
      en: "/client/[clientId]/interventions/programmer-intervention",
    },

    "/client/[clientId]/interventions/mes-interventions": {
      fr: "/client/[clientId]/interventions/mes-interventions",
      en: "/client/[clientId]/interventions/mes-interventions",
    },

    "/client/[clientId]/interventions/rapports-intervention": {
      fr: "/client/[clientId]/interventions/rapports-intervention",
      en: "/client/[clientId]/interventions/rapports-intervention",
    },

    // ----- Devis -----
    "/client/[clientId]/devis/nouveau-devis": {
      fr: "/client/[clientId]/devis/nouveau-devis",
      en: "/client/[clientId]/devis/nouveau-devis",
    },

    "/client/[clientId]/devis/devis-en-cours": {
      fr: "/client/[clientId]/devis/devis-en-cours",
      en: "/client/[clientId]/devis/devis-en-cours",
    },

    "/client/[clientId]/devis/devis-acceptes": {
      fr: "/client/[clientId]/devis/devis-acceptes",
      en: "/client/[clientId]/devis/devis-acceptes",
    },

    "/client/[clientId]/devis/historique-devis": {
      fr: "/client/[clientId]/devis/historique-devis",
      en: "/client/[clientId]/devis/historique-devis",
    },

    // ----- Contrats -----
    "/client/[clientId]/contrats/mes-contrats": {
      fr: "/client/[clientId]/contrats/mes-contrats",
      en: "/client/[clientId]/contrats/mes-contrats",
    },

    "/client/[clientId]/contrats/depenses-et-factures": {
      fr: "/client/[clientId]/contrats/depenses-et-factures",
      en: "/client/[clientId]/contrats/depenses-et-factures",
    },

    "/client/[clientId]/contrats/forfaits": {
      fr: "/client/[clientId]/contrats/forfaits",
      en: "/client/[clientId]/contrats/forfaits",
    },

    // ----- Sites -----
    "/client/[clientId]/sites/mes-sites": {
      fr: "/client/[clientId]/sites/mes-sites",
      en: "/client/[clientId]/sites/mes-sites",
    },

    "/client/[clientId]/sites/nouveau-site": {
      fr: "/client/[clientId]/sites/nouveau-site",
      en: "/client/[clientId]/sites/nouveau-site",
    },

    // ----- Compte -----
    "/client/[clientId]/compte/mon-profil": {
      fr: "/client/[clientId]/compte/mon-profil",
      en: "/client/[clientId]/compte/mon-profil",
    },

    "/client/[clientId]/compte/mon-equipe": {
      fr: "/client/[clientId]/compte/mon-equipe",
      en: "/client/[clientId]/compte/mon-equipe",
    },

    "/client/[clientId]/compte/notifications": {
      fr: "/client/[clientId]/compte/notifications",
      en: "/client/[clientId]/compte/notifications",
    },

    "/client/[clientId]/compte/preferences": {
      fr: "/client/[clientId]/compte/preferences",
      en: "/client/[clientId]/compte/preferences",
    },

    //FOURNISSEURS
    "/fournisseur/[fournisseurId]": {
      fr: "/fournisseur/[fournisseurId]",
      en: "/fournisseur/[fournisseurId]",
    },
    "/fournisseur/[fournisseurId]/profil": {
      fr: "/fournisseur/[fournisseurId]/profil",
      en: "/fournisseur/[fournisseurId]/profile",
    },
    "/fournisseur/[fournisseurId]/tarifs": {
      fr: "/fournisseur/[fournisseurId]/tarifs",
      en: "/fournisseur/[fournisseurId]/tarifs",
    },
    "/fournisseur/[fournisseurId]/tarifs/ajouter": {
      fr: "/fournisseur/[fournisseurId]/tarifs/ajouter",
      en: "/fournisseur/[fournisseurId]/tarifs/add",
    },
    "/fournisseur/[fournisseurId]/tarifs/[service]": {
      fr: "/fournisseur/[fournisseurId]/tarifs/[service]",
      en: "/fournisseur/[fournisseurId]/tarifs/[service]",
    },
    "/fournisseur/[fournisseurId]/produits": {
      fr: "/fournisseur/[fournisseurId]/produits",
      en: "/fournisseur/[fournisseurId]/produits",
    },
    "/fournisseur/[fournisseurId]/dashboard": {
      fr: "/fournisseur/[fournisseurId]/dashboard",
      en: "/fournisseur/[fournisseurId]/dashboard",
    },
    "/fournisseur/[fournisseurId]/factures": {
      fr: "/fournisseur/[fournisseurId]/factures",
      en: "/fournisseur/[fournisseurId]/invoice",
    },
    "/fournisseur/[fournisseurId]/compte": {
      fr: "/fournisseur/[fournisseurId]/mon-compte",
      en: "/fournisseur/[fournisseurId]/my-account",
    },
    "/fournisseur/[fournisseurId]/interventions": {
      fr: "/fournisseur/[fournisseurId]/mes-interventions",
      en: "/fournisseur/[fournisseurId]/my-interventions",
    },
  },
});

export type LocaleType = (typeof routing.locales)[number];
export type PathnamesType = keyof typeof routing.pathnames;
