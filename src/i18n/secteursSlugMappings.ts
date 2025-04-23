// src/i18n/slugMappings.ts

// Mappings des slugs de services du français vers l'anglais
export const secteursSlugMappingsFrToEn: Record<string, string> = {
  "gestion-services-facility-bureaux-paris":
    "outsourced-facility-services-management-for-office-users-in-paris-area-france",
  "cabinets-medicaux": "medical-offices-and-healthcare-facilities",
  "locaux-commerciaux-retail": "retail-commercial-spaces",
  "entrepot-logistique": "warehouses-and-logistics",
  coworking: "coworking-spaces",
  "start-up-scale-up": "start-up-and-scale-up",
};

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
