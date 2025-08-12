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

export const servicesSubSlugMappingsFrToEn: Record<string, string> = {
  gennevilliers: "gennevilliers-city",
  "neuilly-sur-seine": "neuilly-sur-seine-city",
  alfortville: "alfortville-city",
  bagnolet: "bagnolet-city",
  "rosny-sous-bois": "rosny-sous-bois-city",
  villejuif: "villejuif-city",
  "champs-sur-marne": "champs-sur-marne-city",
  serris: "serris-city",
  bezons: "bezons-city",
  "les-ulis": "les-ulis-city",
  "la-defense": "la-defense-city",
  "boulogne-billancourt": "boulogne-billancourt-city",
  "levallois-perret": "levallois-perret-city",
  nanterre: "nanterre-city",
  "rueil-malmaison": "rueil-malmaison-city",
  pantin: "pantin-city",
  puteaux: "puteaux-city",
  clichy: "clichy-city",
  montreuil: "montreuil-city",
  "saint-denis": "saint-denis-city",
  bobigny: "bobigny-city",
};

export const getServicesSlugFr = (serviceSlugEn: string): string => {
  const entry = Object.entries(servicesSlugMappingsFrToEn).find(
    ([_, value]) => value === serviceSlugEn,
  );
  return entry ? entry[0] : serviceSlugEn;
};

export const getServicesSubSlugFr = (serviceSubSlugEn: string): string => {
  const entry = Object.entries(servicesSubSlugMappingsFrToEn).find(
    ([_, value]) => value === serviceSubSlugEn,
  );
  return entry ? entry[0] : serviceSubSlugEn;
};

export const getServicesSlugEn = (serviceSlugFr: string): string => {
  return servicesSlugMappingsFrToEn[serviceSlugFr] || serviceSlugFr;
};
export const getServicesSubSlugEn = (serviceSubSlugFr: string): string => {
  return servicesSubSlugMappingsFrToEn[serviceSubSlugFr] || serviceSubSlugFr;
};
