// src/i18n/slugMappings.ts
export const articlesSlugMappingsFrToEn: Record<string, string> = {
  "pilotage-facility-management": "facilities-management-outsourcing",
  nettoyage: "cleaning-services",
  // Ajoutez tous vos autres services ici
};
// Mappings des slugs de services du français vers l'anglais
export const articlesSubSlugMappingsFrToEn: Record<string, string> = {
  "le-fm-c-est-quoi": "what-is-fm",
  "les-differentes-missions-du-facility-manager":
    "the-various-roles-of-the-facility-manager",
  "histoire-de-l-externalisation-du-facility-management":
    "history-of-facility-management-outsourcing",
  "le-facility-management-fait-il-faire-des-economies":
    "does-facility-management-save-money",
  "histoire-du-nettoyage-des-bureaux": "history-of-office-cleaning",
  "hof-managers-un-nouveau-concept": "hof-managers-a-new-concept",
  "accompagnement-demenagement-entreprise": "office-relocation-france",
  "demenagement-13-demarches-administratives-indispensables":
    "office-move-in-france-checklist-13-essential-administrative-tasks",
  "comment-realiser-votre-duer-pour-vos-bureaux":
    "create-your-risk-assessment-document-duer-for-your-office-in-france",
  "guide-pour-realiser-votre-plan-de-prevention":
    "how-to-create-your-prevention-plan-in-france-guide-free-template",
  "guide-registre-securite-incendie": "guide-fire-safety-register-france",
  "affichage-obligatoire-bureau": "mandatory-workplace-notices-france",
  "registre-unique-du-personnel": "employee-register-france",
  "registre-accidents-travail-benins":
    "minor-workplace-accident-register-france",
};
export const getArticlesSlugFr = (articleSlugEn: string): string => {
  const entry = Object.entries(articlesSlugMappingsFrToEn).find(
    ([_, value]) => value === articleSlugEn
  );
  return entry ? entry[0] : articleSlugEn;
};
// Fonction pour obtenir le slug français à partir du slug anglais
export const getArticlesSubSlugFr = (articleSubSlugEn: string): string => {
  const entry = Object.entries(articlesSubSlugMappingsFrToEn).find(
    ([_, value]) => value === articleSubSlugEn
  );
  return entry ? entry[0] : articleSubSlugEn;
};
// Fonction pour obtenir le slug anglais à partir du slug français
export const getArticlesSlugEn = (articleSlugFr: string): string => {
  return articlesSlugMappingsFrToEn[articleSlugFr] || articleSlugFr;
};
// Fonction pour obtenir le slug anglais à partir du slug français
export const getArticlesSubSlugEn = (articleSubSlugFr: string): string => {
  return articlesSubSlugMappingsFrToEn[articleSubSlugFr] || articleSubSlugFr;
};
