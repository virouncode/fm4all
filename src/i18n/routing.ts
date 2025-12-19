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
    "/auth/signin": {
      fr: "/auth/signin",
      en: "/auth/signin",
    },
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
    "/admin/[userId]": {
      fr: "/admin/[userId]",
      en: "/admin/[userId]",
    },
    "/admin/[userId]/compte/mon-profil": {
      fr: "/admin/[userId]/compte/mon-profil",
      en: "/admin/[userId]/compte/mon-profil",
    },
    "/admin/[userId]/compte/mon-equipe": {
      fr: "/admin/[userId]/compte/mon-equipe",
      en: "/admin/[userId]/compte/mon-equipe",
    },
    "/admin/[userId]/tickets/nouveau-ticket": {
      fr: "/admin/[userId]/tickets/nouveau-ticket",
      en: "/admin/[userId]/tickets/nouveau-ticket",
    },
    "/admin/[userId]/tickets/tous-les-tickets": {
      fr: "/admin/[userId]/tickets/tous-les-tickets",
      en: "/admin/[userId]/tickets/tous-les-tickets",
    },
    "/admin/[userId]/interventions/toutes-les-interventions": {
      fr: "/admin/[userId]/interventions/toutes-les-interventions",
      en: "/admin/[userId]/interventions/toutes-les-interventions",
    },
    "/admin/[userId]/interventions/creer-intervention": {
      fr: "/admin/[userId]/interventions/creer-intervention",
      en: "/admin/[userId]/interventions/creer-intervention",
    },
    "/admin/[userId]/interventions/rapports-interventions": {
      fr: "/admin/[userId]/interventions/rapports-interventions",
      en: "/admin/[userId]/interventions/rapports-interventions",
    },
    "/admin/[userId]/devis/toutes-les-demandes": {
      fr: "/admin/[userId]/devis/toutes-les-demandes",
      en: "/admin/[userId]/devis/toutes-les-demandes",
    },
    "/admin/[userId]/devis/tous-les-devis": {
      fr: "/admin/[userId]/devis/tous-les-devis",
      en: "/admin/[userId]/devis/tous-les-devis",
    },
    "/admin/[userId]/contrats/tous-les-contrats": {
      fr: "/admin/[userId]/contrats/tous-les-contrats",
      en: "/admin/[userId]/contrats/tous-les-contrats",
    },
    "/admin/[userId]/contrats/depenses": {
      fr: "/admin/[userId]/contrats/depenses",
      en: "/admin/[userId]/contrats/depenses",
    },
    "/admin/[userId]/contrats/factures": {
      fr: "/admin/[userId]/contrats/factures",
      en: "/admin/[userId]/contrats/factures",
    },
    "/admin/[userId]/clients/tous-les-clients": {
      fr: "/admin/[userId]/clients/tous-les-clients",
      en: "/admin/[userId]/clients/tous-les-clients",
    },
    "/admin/[userId]/clients/ajouter-un-client": {
      fr: "/admin/[userId]/clients/ajouter-un-client",
      en: "/admin/[userId]/clients/ajouter-un-client",
    },
    "/admin/[userId]/clients/ajouter-un-client/avec-prospect": {
      fr: "/admin/[userId]/clients/ajouter-un-client/avec-prospect",
      en: "/admin/[userId]/clients/ajouter-un-client/avec-prospect",
    },
    "/admin/[userId]/clients/ajouter-un-client/manuel": {
      fr: "/admin/[userId]/clients/ajouter-un-client/manuel",
      en: "/admin/[userId]/clients/ajouter-un-client/manuel",
    },
    "/admin/[userId]/clients/tous-les-sites": {
      fr: "/admin/[userId]/clients/tous-les-sites",
      en: "/admin/[userId]/clients/tous-les-sites",
    },
    "/admin/[userId]/fournisseurs/tous-les-fournisseurs": {
      fr: "/admin/[userId]/fournisseurs/tous-les-fournisseurs",
      en: "/admin/[userId]/fournisseurs/tous-les-fournisseurs",
    },
    "/admin/[userId]/fournisseurs/ajouter-un-fournisseur": {
      fr: "/admin/[userId]/fournisseurs/ajouter-un-fournisseur",
      en: "/admin/[userId]/fournisseurs/ajouter-un-fournisseur",
    },
    "/admin/[userId]/prospects/tous-les-prospects": {
      fr: "/admin/[userId]/prospects/tous-les-prospects",
      en: "/admin/[userId]/prospects/tous-les-prospects",
    },

    //CLIENT
    "/client/[clientId]": {
      fr: "/client/[clientId]",
      en: "/client/[clientId]",
    },
    "/client/[clientId]/tickets/nouveau-ticket": {
      fr: "/client/[clientId]/tickets/nouveau-ticket",
      en: "/client/[clientId]/tickets/nouveau-ticket",
    },

    "/client/[clientId]/tickets/mes-tickets": {
      fr: "/client/[clientId]/tickets/mes-tickets",
      en: "/client/[clientId]/tickets/mes-tickets",
    },

    "/client/[clientId]/tickets/action-requise": {
      fr: "/client/[clientId]/tickets/action-requise",
      en: "/client/[clientId]/tickets/action-requise",
    },

    "/client/[clientId]/tickets/tickets-a-valider": {
      fr: "/client/[clientId]/tickets/tickets-a-valider",
      en: "/client/[clientId]/tickets/tickets-a-valider",
    },
    "/client/[clientId]/interventions/mes-interventions": {
      fr: "/client/[clientId]/interventions/mes-interventions",
      en: "/client/[clientId]/interventions/mes-interventions",
    },
    "/client/[clientId]/interventions/rapports-intervention": {
      fr: "/client/[clientId]/interventions/rapports-intervention",
      en: "/client/[clientId]/interventions/rapports-intervention",
    },
    "/client/[clientId]/devis/nouvelle-demande": {
      fr: "/client/[clientId]/devis/nouvelle-demande",
      en: "/client/[clientId]/devis/nouvelle-demande",
    },
    "/client/[clientId]/devis/mes-demandes": {
      fr: "/client/[clientId]/devis/mes-demandes",
      en: "/client/[clientId]/devis/mes-demandes",
    },
    "/client/[clientId]/devis/mes-devis": {
      fr: "/client/[clientId]/devis/mes-devis",
      en: "/client/[clientId]/devis/mes-devis",
    },
    "/client/[clientId]/contrats/mes-contrats": {
      fr: "/client/[clientId]/contrats/mes-contrats",
      en: "/client/[clientId]/contrats/mes-contrats",
    },
    "/client/[clientId]/contrats/depenses": {
      fr: "/client/[clientId]/contrats/depenses",
      en: "/client/[clientId]/contrats/depenses",
    },
    "/client/[clientId]/contrats/factures": {
      fr: "/client/[clientId]/contrats/factures",
      en: "/client/[clientId]/contrats/factures",
    },
    "/client/[clientId]/sites/mes-sites": {
      fr: "/client/[clientId]/sites/mes-sites",
      en: "/client/[clientId]/sites/mes-sites",
    },
    "/client/[clientId]/sites/nouveau-site": {
      fr: "/client/[clientId]/sites/nouveau-site",
      en: "/client/[clientId]/sites/nouveau-site",
    },
    "/client/[clientId]/compte/mon-profil/[userId]": {
      fr: "/client/[clientId]/compte/mon-profil/[userId]",
      en: "/client/[clientId]/compte/mon-profil/[userId]",
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
    "/client/[clientId]/compte/mon-equipe/ajouter": {
      fr: "/client/[clientId]/compte/mon-equipe/ajouter",
      en: "/client/[clientId]/compte/mon-equipe/ajouter",
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
