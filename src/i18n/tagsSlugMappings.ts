// src/i18n/slugMappings.ts

// Mappings des slugs de services du français vers l'anglais
export const tagsSlugMappingsFrToEn: Record<string, string> = {
  "esg-rse": "esg-and-csr-compliance",
  "cabinet-medical": "medical-center",
  "entrepot-logistique": "warehouses",
  "local-commercial-et-retail": "retail-spaces",
  "comparateur-devis-en-ligne": "online-quote-comparison-facility-services",
  demenagement: "office-relocation-services",
  "espace-coworking": "coworking-spaces",
  "startups-scaleups": "startups-scaleups",
  erp: "public-access-buildings",
  "immeuble-mono-occupant": "single-tenant-building",
  "evenementiel-bien-etre": "workplace-experience",
  bureaux: "office-spaces",
  "services-a-la-demande": "on-demand-services",
  "cadeaux-d-entreprise-et-goodies": "corporate-gifts-and-goodies",
  "travaux-a-la-demande": "on-demand-works-and-repairs",
  "audit-et-conseil": "audit-and-advisory-consulting",
  proprete: "cleaning",
  maintenance: "maintenance",
  "office-manager": "office-manager",
  "food-and-beverage": "food-and-beverage",
  "facility-management": "facility-management",
  "securite-incendie": "fire-safety",
};

// Fonction pour obtenir le slug français à partir du slug anglais
export const getTagSlugFr = (tagSlugEn: string): string => {
  const entry = Object.entries(tagsSlugMappingsFrToEn).find(
    ([_, value]) => value === tagSlugEn
  );
  return entry ? entry[0] : tagSlugEn;
};

// Fonction pour obtenir le slug anglais à partir du slug français
export const getTagSlugEn = (tagSlugFr: string): string => {
  return tagsSlugMappingsFrToEn[tagSlugFr] || tagSlugFr;
};
