export const ticketStatutCT = [
  { code: "nouveau", name: "Nouveau" },
  { code: "pris_en_charge", name: "Pris en charge" },
  { code: "en_attente_prestataire", name: "En attente prestataire" },
  { code: "en_attente_client", name: "En attente client" },
  { code: "a_valider", name: "À valider" },
  { code: "clos", name: "Clos" },
  { code: "annule", name: "Annulé" },
  { code: "rejete", name: "Rejeté / Hors périmètre" },
] as const;

export const ticketStatutCodes = ticketStatutCT.map(
  (i) => i.code,
) as unknown as [
  (typeof ticketStatutCT)[number]["code"],
  ...(typeof ticketStatutCT)[number]["code"][],
];

export const ticketPrioriteCT = [
  { code: "basse", name: "Basse" },
  { code: "normale", name: "Normale" },
  { code: "haute", name: "Haute" },
  { code: "critique", name: "Critique" },
] as const;

export const ticketPrioriteCodes = ticketPrioriteCT.map(
  (i) => i.code,
) as unknown as [
  (typeof ticketPrioriteCT)[number]["code"],
  ...(typeof ticketPrioriteCT)[number]["code"][],
];

export const ticketTypeCT = [
  { code: "incident", name: "Incident" },
  { code: "demande", name: "Demande" },
  { code: "autre", name: "Autre" },
] as const;

export const ticketTypeCodes = ticketTypeCT.map((i) => i.code) as unknown as [
  (typeof ticketTypeCT)[number]["code"],
  ...(typeof ticketTypeCT)[number]["code"][],
];

export const ticketMessageVisibiliteCT = [
  { code: "public", name: "Public" }, // visible client + prestataire + fm4all
  { code: "fm4all_only", name: "fm4all uniquement" }, // fm4all only
  { code: "client_only", name: "Client uniquement" },
  { code: "prestataire_only", name: "Prestataire uniquement" },
] as const;

export const ticketMessageVisibiliteCodes = ticketMessageVisibiliteCT.map(
  (i) => i.code,
) as unknown as [
  (typeof ticketMessageVisibiliteCT)[number]["code"],
  ...(typeof ticketMessageVisibiliteCT)[number]["code"][],
];

export const userRoleCT = [
  { code: "admin", name: "Administrateur" },
  { code: "fournisseur", name: "Prestataire" },
  { code: "client", name: "Client" },
  { code: "client_admin", name: "Client administrateur" },
  { code: "fournisseur_admin", name: "Prestataire administrateur" },
] as const;

export const userRoleCodes = userRoleCT.map((i) => i.code) as unknown as [
  (typeof userRoleCT)[number]["code"],
  ...(typeof userRoleCT)[number]["code"][],
];

export const typeBatimentCT = [
  { code: "bureaux", name: "batiments.bureaux" },
  { code: "localCommercial", name: "batiments.localCommercial" },
  { code: "entrepot", name: "batiments.entrepot" },
  { code: "cabinetMedical", name: "batiments.cabinetMedical" },
] as const;

export const typeBatimentCodes = typeBatimentCT.map(
  (i) => i.code,
) as unknown as [
  (typeof typeBatimentCT)[number]["code"],
  ...(typeof typeBatimentCT)[number]["code"][],
];

export const typeOccupationCT = [
  { code: "partieEtage", name: "occupation.partieEtage" },
  { code: "plateauComplet", name: "occupation.plateauComplet" },
  { code: "batimentEntier", name: "occupation.batimentEntier" },
] as const;

export const typeOccupationCodes = typeOccupationCT.map(
  (i) => i.code,
) as unknown as [
  (typeof typeOccupationCT)[number]["code"],
  ...(typeof typeOccupationCT)[number]["code"][],
];

export const devisStatutCT = [
  { code: "brouillon", name: "Brouillon" },
  { code: "emis", name: "Emis" },
  { code: "signe", name: "Devis signé" },
  { code: "refuse", name: "Devis refusé" },
] as const;

export const devisStatutCodes = devisStatutCT.map((i) => i.code) as unknown as [
  (typeof devisStatutCT)[number]["code"],
  ...(typeof devisStatutCT)[number]["code"][],
];

export const devisTypePrixCT = [
  { code: "recurrent", name: "Récurrent" },
  { code: "one_shot", name: "One shot" },
] as const;

export const devisTypePrixCodes = devisTypePrixCT.map(
  (i) => i.code,
) as unknown as [
  (typeof devisTypePrixCT)[number]["code"],
  ...(typeof devisTypePrixCT)[number]["code"][],
];

export const devisLigneUniteCT = [
  // Basic units
  { code: "unite", name: "Unité" },
  { code: "paire", name: "Paire" },
  { code: "piece", name: "Pièce" },
  { code: "article", name: "Article" },
  { code: "ensemble", name: "Ensemble" },
  { code: "lot", name: "Lot" },
  //temps
  { code: "seconde", name: "Seconde" },
  { code: "minute", name: "Minute" },
  { code: "heure", name: "Heure" },
  { code: "jour", name: "Jour" },
  { code: "semaine", name: "Semaine" },
  { code: "deux_semaines", name: "Deux semaines" },
  { code: "quatre_semaines", name: "Quatre semaines" },
  { code: "trimestre", name: "Trimestre" },
  { code: "semestre", name: "Semestre" },
  { code: "mois", name: "Mois" },
  { code: "annee", name: "Année" },
  //poids
  { code: "milligramme", name: "mg - Milligramme" },
  { code: "gramme", name: "g - Gramme" },
  { code: "kilogramme", name: "kg - Kilogramme" },
  { code: "tonne", name: "t - Tonne" },
  //liquide
  { code: "millilitre", name: "mL - Millilitre" },
  { code: "centilitre", name: "cL - Centilitre" },
  { code: "litre", name: "L - Litre" },
  //Longueur
  { code: "millimetre", name: "mm - Millimètre" },
  { code: "centimètre", name: "cm - Centimètre" },
  { code: "metre", name: "m - Mètre" },
  //Surface et volume
  { code: "metre_carre", name: "m² - Mètre carré" },
  { code: "metre_cube", name: "m³ - Mètre cube" },
  //Énergie et puissance
  { code: "metre_cube_par_heure", name: "m³/h - Mètre cube par heure" },
  { code: "ampère", name: "A - Ampère" },
  { code: "gigajoule", name: "GJ - Gigajoule" },
  { code: "gigawatt", name: "GW - Gigawatt" },
  { code: "gigawatt_par_heure", name: "GW/h - Gigawatt par heure" },
  { code: "joule", name: "J - Joule" },
  { code: "kilojoule", name: "kJ - Kilojoule" },
  { code: "kilovar", name: "kVar - Kilovar" },
  { code: "kilowatt", name: "kW - Kilowatt" },
  { code: "kilowatt_par_heure", name: "kW/h - Kilowattheure" },
  { code: "megajoule", name: "MJ - Megajoule" },
  { code: "megawatt", name: "MW - Megawatt" },
  { code: "megawatt_par_heure", name: "MW/h - Megawattheure" },
  { code: "voltampere", name: "VA - Voltampère" },
  { code: "voltampere_reactif", name: "VAr - Voltampère réactif" },
  { code: "wattheure", name: "Wh - Wattheure" },
] as const;

export const devisLigneUniteCodes = devisLigneUniteCT.map(
  (i) => i.code,
) as unknown as [
  (typeof devisLigneUniteCT)[number]["code"],
  ...(typeof devisLigneUniteCT)[number]["code"][],
];

export const siteAttributionScopeCT = [
  { code: "self", name: "Site uniquement" },
  { code: "subtree", name: "Site et sous-sites" },
] as const;

export const siteAttributionScopeCodes = siteAttributionScopeCT.map(
  (i) => i.code,
) as unknown as [
  (typeof siteAttributionScopeCT)[number]["code"],
  ...(typeof siteAttributionScopeCT)[number]["code"][],
];

export const attributionModeCT = [
  { code: "inclure", name: "Inclure" },
  { code: "exclure", name: "Exclure" },
] as const;

export const attributionModeCodes = attributionModeCT.map(
  (i) => i.code,
) as unknown as [
  (typeof attributionModeCT)[number]["code"],
  ...(typeof attributionModeCT)[number]["code"][],
];

export const clientServiceModeCT = [
  { code: "recurrent", name: "Récurrent" },
  { code: "one_shot", name: "One shot" },
] as const;

export const clientServiceModeCodes = clientServiceModeCT.map(
  (i) => i.code,
) as unknown as [
  (typeof clientServiceModeCT)[number]["code"],
  ...(typeof clientServiceModeCT)[number]["code"][],
];

export const clientServiceStatutCT = [
  { code: "brouillon", name: "Brouillon" },
  { code: "actif", name: "Actif" },
  { code: "en_pause", name: "En pause" },
  { code: "termine", name: "Terminé" },
] as const;

export const clientServiceStatutCodes = clientServiceStatutCT.map(
  (i) => i.code,
) as unknown as [
  (typeof clientServiceStatutCT)[number]["code"],
  ...(typeof clientServiceStatutCT)[number]["code"][],
];

export const clientServiceModePlanningCT = [
  { code: "planifie", name: "Planifié" },
  { code: "a_la_demande", name: "À la demande" },
] as const;

export const clientServiceModePlanningCodes = clientServiceModePlanningCT.map(
  (i) => i.code,
) as unknown as [
  (typeof clientServiceModePlanningCT)[number]["code"],
  ...(typeof clientServiceModePlanningCT)[number]["code"][],
];

export const modeCommercialCT = [
  { code: "direct", name: "Direct" },
  { code: "intermediaire_fm4all", name: "Intermédiaire FM4ALL" },
] as const;

export const modeCommercialCodes = modeCommercialCT.map(
  (i) => i.code,
) as unknown as [
  (typeof modeCommercialCT)[number]["code"],
  ...(typeof modeCommercialCT)[number]["code"][],
];

export const modePilotageCT = [
  { code: "client", name: "Géré par le client" },
  { code: "prestataire", name: "Géré par le prestataire" },
  { code: "collaboration", name: "Géré en commun" },
] as const;

export const modePilotageCodes = modePilotageCT.map(
  (i) => i.code,
) as unknown as [
  (typeof modePilotageCT)[number]["code"],
  ...(typeof modePilotageCT)[number]["code"][],
];

export const perimetreModeCT = [
  { code: "inclure", name: "Inclure" },
  { code: "exclure", name: "Exclure" },
] as const;

export const perimetreModeCodes = perimetreModeCT.map(
  (i) => i.code,
) as unknown as [
  (typeof perimetreModeCT)[number]["code"],
  ...(typeof perimetreModeCT)[number]["code"][],
];

export const occurrenceStatutCT = [
  { code: "planifiee", name: "Planifiée" },
  { code: "en_cours", name: "En cours" },
  { code: "terminee", name: "Terminée" },
  { code: "non_honoree", name: "Non honorée" },
  { code: "annulee", name: "Annulée" },
] as const;

export const occurrenceStatutCodes = occurrenceStatutCT.map(
  (i) => i.code,
) as unknown as [
  (typeof occurrenceStatutCT)[number]["code"],
  ...(typeof occurrenceStatutCT)[number]["code"][],
];

export const occurrenceTacheStatutCT = [
  { code: "a_faire", name: "À faire" },
  { code: "en_cours", name: "En cours" },
  { code: "terminee", name: "Terminée" },
  { code: "non_honoree", name: "Non honorée" },
  { code: "annulee", name: "Annulée" },
  { code: "non_applicable", name: "Non applicable" },
] as const;

export const occurrenceTacheStatutCodes = occurrenceTacheStatutCT.map(
  (i) => i.code,
) as unknown as [
  (typeof occurrenceTacheStatutCT)[number]["code"],
  ...(typeof occurrenceTacheStatutCT)[number]["code"][],
];

export const documentTypeCT = [
  // Contrats
  { code: "contrat_pdf", name: "Contrat PDF" },
  { code: "avenant_pdf", name: "Avenant PDF" },

  // Devis
  { code: "devis_pdf", name: "Devis PDF" },
  { code: "devis_signe_pdf", name: "Devis signé PDF" },
  { code: "annexe", name: "Annexe" },

  // Référentiels / sites
  { code: "cahier_des_charges", name: "Cahier des charges" },
  { code: "plan_site", name: "Plan de site" },
  { code: "procedure_acces", name: "Procédure d'accès" },
  { code: "consignes_securite", name: "Consignes de sécurité" },

  // Admin fournisseur
  { code: "assurance", name: "Assurance" },
  { code: "kbis", name: "KBIS" },

  // Fallback
  { code: "autre", name: "Autre" },
] as const;

export const documentTypeCodes = documentTypeCT.map(
  (i) => i.code,
) as unknown as [
  (typeof documentTypeCT)[number]["code"],
  ...(typeof documentTypeCT)[number]["code"][],
];

export const documentVisibiliteCT = [
  { code: "public", name: "Public" }, // visible client + fournisseur + fm4all
  { code: "fm4all_only", name: "fm4all uniquement" }, // fm4all only
  { code: "client_only", name: "Client uniquement" },
  { code: "fournisseur_only", name: "Prestataire uniquement" },
] as const;

export const documentVisibiliteCodes = documentVisibiliteCT.map(
  (i) => i.code,
) as unknown as [
  (typeof documentVisibiliteCT)[number]["code"],
  ...(typeof documentVisibiliteCT)[number]["code"][],
];

export const roleEntrepriseCT = [
  { code: "client", name: "Client" },
  { code: "prestataire", name: "Prestataire" },
  { code: "plateforme", name: "Plateforme" },
] as const;

export const roleEntrepriseCodes = roleEntrepriseCT.map(
  (i) => i.code,
) as unknown as [
  (typeof roleEntrepriseCT)[number]["code"],
  ...(typeof roleEntrepriseCT)[number]["code"][],
];

export const roleClientAdhesionCT = [
  //Droits globaux, indépendants des sites (posture client)
  { code: "admin", name: "Administrateur" },
  { code: "manager", name: "Manager" },
  { code: "collaborateur", name: "Collaborateur" },
] as const;

export const roleClientAdhesionCodes = roleClientAdhesionCT.map(
  (i) => i.code,
) as unknown as [
  (typeof roleClientAdhesionCT)[number]["code"],
  ...(typeof roleClientAdhesionCT)[number]["code"][],
];

export const rolePrestataireAdhesionCT = [
  //Droits globaux, indépendants des sites (posture prestataire)
  { code: "admin", name: "Administrateur" },
  { code: "manager", name: "Manager" },
  { code: "collaborateur", name: "Collaborateur" },
] as const;

export const rolePrestataireAdhesionCodes = rolePrestataireAdhesionCT.map(
  (i) => i.code,
) as unknown as [
  (typeof rolePrestataireAdhesionCT)[number]["code"],
  ...(typeof rolePrestataireAdhesionCT)[number]["code"][],
];

export const rolePlateformeAdhesionCT = [
  { code: "super_admin_plateforme", name: "Super administrateur plateforme" },
  { code: "operateur_plateforme", name: "Opérateur plateforme" },
] as const;

export const rolePlateformeAdhesionCodes = rolePlateformeAdhesionCT.map(
  (i) => i.code,
) as [
  (typeof rolePlateformeAdhesionCT)[number]["code"],
  ...(typeof rolePlateformeAdhesionCT)[number]["code"][],
];

export const roleClientAttributionSiteCT = [
  // Droits spécifiques à un site donné (posture client) — sans intervenant_site
  { code: "responsable_site", name: "Responsable de site" },
  { code: "demandeur_site", name: "Demandeur de site" },
  { code: "observateur_site", name: "Observateur de site" },
] as const;

export const roleClientAttributionSiteCodes = roleClientAttributionSiteCT.map(
  (i) => i.code,
) as unknown as [
  (typeof roleClientAttributionSiteCT)[number]["code"],
  ...(typeof roleClientAttributionSiteCT)[number]["code"][],
];

export const rolePrestataireAttributionSiteCT = [
  // Droits spécifiques à un site donné (posture prestataire) — avec intervenant_site
  { code: "responsable_site", name: "Responsable de site" },
  { code: "demandeur_site", name: "Demandeur de site" },
  { code: "observateur_site", name: "Observateur de site" },
  { code: "intervenant_site", name: "Intervenant de site" },
] as const;

export const rolePrestataireAttributionSiteCodes =
  rolePrestataireAttributionSiteCT.map((i) => i.code) as unknown as [
    (typeof rolePrestataireAttributionSiteCT)[number]["code"],
    ...(typeof rolePrestataireAttributionSiteCT)[number]["code"][],
  ];

export const adhesionStatutCT = [
  { code: "actif", name: "Actif" },
  { code: "en_attente", name: "En attente" },
  { code: "suspendu", name: "Suspendu" },
] as const;

export const adhesionStatutCodes = adhesionStatutCT.map(
  (i) => i.code,
) as unknown as [
  (typeof adhesionStatutCT)[number]["code"],
  ...(typeof adhesionStatutCT)[number]["code"][],
];

export const frequenceCT = [
  { code: "one_shot", name: "One shot" },
  { code: "hebdomadaire", name: "Hebdomadaire" },
  { code: "mensuelle", name: "Mensuelle" },
  { code: "trimestrielle", name: "Trimestrielle" },
  { code: "semestrielle", name: "Semestrielle" },
  { code: "annuelle", name: "Annuelle" },
  { code: "tous_les_x_jours", name: "Tous les X jours" },
] as const;

export const frequenceCodes = frequenceCT.map((i) => i.code) as unknown as [
  (typeof frequenceCT)[number]["code"],
  ...(typeof frequenceCT)[number]["code"][],
];

export const documentCategorieCT = [
  // Contractuel / financier
  { code: "contrat", name: "Contrat" },
  { code: "avenant", name: "Avenant" },
  { code: "devis", name: "Devis" },
  { code: "facture", name: "Facture" },
  { code: "bon_commande", name: "Bon de commande" },

  // Opérationnel FM
  { code: "rapport_intervention", name: "Rapport d’intervention" },
  { code: "compte_rendu", name: "Compte rendu" },
  { code: "procedure", name: "Procédure" },
  { code: "plan_acces", name: "Plan / Accès" },

  // Projet / besoin
  { code: "cahier_charges", name: "Cahier des charges" },
  { code: "specification", name: "Spécification" },

  // Identité
  { code: "avatar", name: "Avatar" },
  { code: "photo", name: "Photo" },
  { code: "logo", name: "Logo" },

  // Générique
  { code: "document", name: "Document" },
  { code: "piece_jointe", name: "Pièce jointe" },

  // Ticket
  { code: "ticket_piece_jointe", name: "Pièce jointe (ticket)" },
  {
    code: "ticket_message_piece_jointe",
    name: "Pièce jointe (message ticket)",
  },
  { code: "tache_piece_jointe", name: "Pièce jointe (tâche)" },
] as const;

export const documentCategorieCodes = documentCategorieCT.map(
  (i) => i.code,
) as unknown as [
  (typeof documentCategorieCT)[number]["code"],
  ...(typeof documentCategorieCT)[number]["code"][],
];

import { pgEnum } from "drizzle-orm/pg-core";

/**
 * CONTRAT - TYPE
 * => nature du contrat (ce que c'est)
 */
export const contratTypeCT = [
  { code: "multiservices", name: "Contrat multiservices (cadre)" },
  { code: "service", name: "Contrat de service" },
  { code: "mandat_gestion", name: "Mandat / Gestion pilotée" },
  { code: "ponctuel", name: "Contrat ponctuel" },
] as const;

export const contratTypeCodes = contratTypeCT.map((i) => i.code) as unknown as [
  (typeof contratTypeCT)[number]["code"],
  ...(typeof contratTypeCT)[number]["code"][],
];

export const contratTypeEnum = pgEnum("contrat_type", contratTypeCodes);

/**
 * CONTRAT - DEAL MODE
 * => mode commercial / qui porte la relation
 */
export const contratDealModeCT = [
  { code: "direct", name: "Direct (client ↔ fournisseur)" },
  { code: "intermediaire", name: "Intermédiaire (FM4ALL porte / refacture)" },
  {
    code: "gestion_pilotee",
    name: "Gestion pilotée (FM4ALL facture des frais)",
  },
  { code: "apporteur_affaires", name: "Apporteur d’affaires (commission)" },
] as const;

export const contratDealModeCodes = contratDealModeCT.map(
  (i) => i.code,
) as unknown as [
  (typeof contratDealModeCT)[number]["code"],
  ...(typeof contratDealModeCT)[number]["code"][],
];

export const contratDealModeEnum = pgEnum(
  "contrat_deal_mode",
  contratDealModeCodes,
);

/**
 * CONTRAT - STATUT
 * => cycle de vie du contrat
 */
export const contratStatutCT = [
  { code: "brouillon", name: "Brouillon" },
  { code: "actif", name: "Actif" },
  { code: "suspendu", name: "Suspendu" },
  { code: "termine", name: "Terminé" },
  { code: "resilie", name: "Résilié" },
] as const;

export const contratStatutCodes = contratStatutCT.map(
  (i) => i.code,
) as unknown as [
  (typeof contratStatutCT)[number]["code"],
  ...(typeof contratStatutCT)[number]["code"][],
];

export const factureStatutCT = [
  { code: "brouillon", name: "Brouillon" },
  { code: "emise", name: "Émise" },
  { code: "payee", name: "Payée" },
  { code: "en_retard", name: "En retard" },
  { code: "litige", name: "En litige" },
  { code: "annulee", name: "Annulée" },
] as const;

export const factureStatutCodes = factureStatutCT.map(
  (i) => i.code,
) as unknown as [
  (typeof factureStatutCT)[number]["code"],
  ...(typeof factureStatutCT)[number]["code"][],
];

export const factureLigneTypeCT = [
  { code: "ponctuel", name: "Ponctuel" },
  { code: "recurrent", name: "Récurrent" },
  { code: "ajustement", name: "Ajustement" },
] as const;

export const factureLigneTypeCodes = factureLigneTypeCT.map(
  (i) => i.code,
) as unknown as [
  (typeof factureLigneTypeCT)[number]["code"],
  ...(typeof factureLigneTypeCT)[number]["code"][],
];

export const paiementStatutCT = [
  { code: "en_attente", name: "En attente" },
  { code: "recu", name: "Reçu" },
  { code: "partiel", name: "Partiel" },
  { code: "refuse", name: "Refusé" },
  { code: "annule", name: "Annulé" },
] as const;

export const paiementStatutCodes = paiementStatutCT.map(
  (i) => i.code,
) as unknown as [
  (typeof paiementStatutCT)[number]["code"],
  ...(typeof paiementStatutCT)[number]["code"][],
];

export const paiementMethodeCT = [
  { code: "virement", name: "Virement bancaire" },
  { code: "cheque", name: "Chèque" },
  { code: "prelevement", name: "Prélèvement" },
  { code: "carte", name: "Carte bancaire" },
  { code: "especes", name: "Espèces" },
  { code: "avoir", name: "Avoir" },
] as const;

export const paiementMethodeCodes = paiementMethodeCT.map(
  (i) => i.code,
) as unknown as [
  (typeof paiementMethodeCT)[number]["code"],
  ...(typeof paiementMethodeCT)[number]["code"][],
];
export const executionTypePrixCT = [
  { code: "abonnement", name: "Abonnement" },
  { code: "par_occurrence", name: "Par occurrence" },
  { code: "installation", name: "Installation" },
  { code: "frais_livraison", name: "Frais de livraison" },
] as const;

export const executionTypePrixCodes = executionTypePrixCT.map(
  (i) => i.code,
) as unknown as [
  (typeof executionTypePrixCT)[number]["code"],
  ...(typeof executionTypePrixCT)[number]["code"][],
];

export const executionPeriodeFacturationCT = [
  { code: "semaine", name: "Semaine" },
  { code: "mois", name: "Mois" },
  { code: "annee", name: "Année" },
] as const;

export const executionPeriodeFacturationCodes =
  executionPeriodeFacturationCT.map((i) => i.code) as unknown as [
    (typeof executionPeriodeFacturationCT)[number]["code"],
    ...(typeof executionPeriodeFacturationCT)[number]["code"][],
  ];

export const toCodeTableName = (
  code: string,
  table: readonly { code: string; name: string }[],
) => {
  const entry = table.find((item) => item.code === code);
  return entry ? entry.name : code;
};
