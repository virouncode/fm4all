// src/i18n/slugMappings.ts

// Mappings des slugs de services du français vers l'anglais
export const slugMappingsFrToEn: Record<string, string> = {
  nettoyage: "cleaning-services",
  "hygiene-sanitaire": "sanitary-supplies",
  "securite-incendie": "fire-safety",
  "machines-a-cafe-en-entreprise": "coffee-machines",
  "fontaines-a-eau": "water-fountains",
  "pilotage-fm4all": "fm4all-service-management",
  // Ajoutez tous vos autres services ici
};

// Fonction pour obtenir le slug français à partir du slug anglais
export const getSlugFr = (slugEn: string): string => {
  const entry = Object.entries(slugMappingsFrToEn).find(
    ([_, value]) => value === slugEn
  );
  return entry ? entry[0] : slugEn;
};

// Fonction pour obtenir le slug anglais à partir du slug français
export const getSlugEn = (slugFr: string): string => {
  return slugMappingsFrToEn[slugFr] || slugFr;
};
