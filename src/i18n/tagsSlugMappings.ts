// src/i18n/slugMappings.ts

// Mappings des slugs de services du français vers l'anglais
export const tagsSlugMappingsFrToEn: Record<string, string> = {
  nettoyage: "cleaning",
  hygiene: "hygiene",
  maintenance: "maintenance",
  "securite-incendie": "fire-safety",
  cafe: "coffee",
  "food-beverage": "food-beverage",
  "fontaines-a-eau": "water-dispensers",
  "office-manager": "office-manager",
  "facility-manager": "facility-manager",
  "hospitality-manager": "hospitality-manager",
  "pilotage-prestations": "service-management",
  FM: "FM",
  proprete: "cleanliness",
  // Ajoutez tous vos autres services ici
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
