// src/i18n/slugMappings.ts

// Mappings des slugs de services du français vers l'anglais
export const slugMappingsFrToEn: Record<string, string> = {
  "machines-a-cafe-en-entreprise": "coffee-machines",
  "securite-incendie": "fire-safety",
  nettoyage: "cleaning-services",
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
