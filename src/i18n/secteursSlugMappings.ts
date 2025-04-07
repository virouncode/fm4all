// src/i18n/slugMappings.ts

// Mappings des slugs de services du français vers l'anglais
export const secteursSlugMappingsFrToEn: Record<string, string> = {};

// Fonction pour obtenir le slug français à partir du slug anglais
export const getSecteurSlugFr = (secteurSlugEn: string): string => {
  const entry = Object.entries(secteursSlugMappingsFrToEn).find(
    ([_, value]) => value === secteurSlugEn
  );
  return entry ? entry[0] : secteurSlugEn;
};

// Fonction pour obtenir le slug anglais à partir du slug français
export const getSecteurSlugEn = (secteurSlugFr: string): string => {
  return secteursSlugMappingsFrToEn[secteurSlugFr] || secteurSlugFr;
};
