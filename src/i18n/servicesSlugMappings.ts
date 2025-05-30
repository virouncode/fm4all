// src/i18n/slugMappings.ts

// Mappings des slugs de services du français vers l'anglais
export const servicesSlugMappingsFrToEn: Record<string, string> = {
  nettoyage: "cleaning-services",
  "hygiene-sanitaire": "sanitary-supplies",
  "maintenance-multitechnique": "multitechnical-maintenance",
  "securite-incendie": "fire-safety",
  "machines-a-cafe-en-entreprise": "coffee-machines",
  "livraison-fruits-entreprise": "office-fruit-basket-delivery",
  "livraison-snacks-entreprise": "healthy-snack-delivery-office",
  "livraison-boissons-entreprise": "office-drinks-delivery",
  "fontaines-a-eau-entreprise": "water-dispensers",
  "office-manager-externalise": "outsource-office-management",
  "pilotage-facility-management": "facilities-management-outsourcing",
  // Ajoutez tous vos autres services ici
};

// Fonction pour obtenir le slug français à partir du slug anglais
export const getServicesSlugFr = (serviceSlugEn: string): string => {
  const entry = Object.entries(servicesSlugMappingsFrToEn).find(
    ([_, value]) => value === serviceSlugEn
  );
  return entry ? entry[0] : serviceSlugEn;
};

// Fonction pour obtenir le slug anglais à partir du slug français
export const getServicesSlugEn = (serviceSlugFr: string): string => {
  return servicesSlugMappingsFrToEn[serviceSlugFr] || serviceSlugFr;
};
