export const ticketStatusCT = [
  { code: "nouveau", name: "Nouveau" },
  { code: "pris_en_charge", name: "Pris en charge" },
  { code: "en_attent_fournisseur", name: "En attente fournisseur" },
  { code: "en_attente_client", name: "En attente client" },
  { code: "a_valider", name: "À valider" },
  { code: "clos", name: "Clos" },
  { code: "annule", name: "Annulé" },
  { code: "rejete", name: "Rejeté / Hors périmètre" },
] as const;

export const ticketStatusCodes = ticketStatusCT.map(
  (i) => i.code,
) as unknown as [
  (typeof ticketStatusCT)[number]["code"],
  ...(typeof ticketStatusCT)[number]["code"][],
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

export const ticketCategorieCT = [
  { code: "proprete", name: "Propreté" },
  { code: "consommables", name: "Consommables" },
  { code: "degradations", name: "Dégradations" },
  { code: "electricite", name: "Électricité" },
  { code: "plomberie", name: "Plomberie" },
  { code: "cvc", name: "CVC" },
  { code: "exterieurs", name: "Extérieurs" },
  { code: "securite_incendie", name: "Sécurité incendie" },
  { code: "cafe", name: "Café" },
  { code: "fontaines_eau", name: "Fontaines à eau" },
  { code: "office_management", name: "Office management" },
  { code: "demande_devis", name: "Demande de devis" },
  { code: "autre", name: "Autre" },
] as const;

export const ticketCategorieCodes = ticketCategorieCT.map(
  (i) => i.code,
) as unknown as [
  (typeof ticketCategorieCT)[number]["code"],
  ...(typeof ticketCategorieCT)[number]["code"][],
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

export const interventionStatusCT = [
  { code: "en_attente_confirmation", name: "En attente de confirmation" },
  { code: "planifiee", name: "Planifiée" },
  { code: "en_cours", name: "En cours" },
  { code: "realisee", name: "Réalisée" },
  { code: "annulee", name: "Annulée" },
  { code: "non_honoree", name: "Non honorée" },
] as const;

export const interventionStatusCodes = interventionStatusCT.map(
  (i) => i.code,
) as unknown as [
  (typeof interventionStatusCT)[number]["code"],
  ...(typeof interventionStatusCT)[number]["code"][],
];

export const interventionTypeCT = [
  { code: "corrective", name: "Corrective" },
  { code: "preventive", name: "Préventive" },
  { code: "audit", name: "Audit" },
  { code: "autre", name: "Autre" },
] as const;

export const interventionTypeCodes = interventionTypeCT.map(
  (i) => i.code,
) as unknown as [
  (typeof interventionTypeCT)[number]["code"],
  ...(typeof interventionTypeCT)[number]["code"][],
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

export const devisStatusCT = [
  { code: "brouillon", name: "Brouillon" },
  { code: "emis", name: "Emis" },
  { code: "signe", name: "Devis signé" },
  { code: "refuse", name: "Devis refusé" },
] as const;

export const devisStatusCodes = devisStatusCT.map((i) => i.code) as unknown as [
  (typeof devisStatusCT)[number]["code"],
  ...(typeof devisStatusCT)[number]["code"][],
];

export const devisTypePrixCT = [
  { code: "forfait", name: "Forfait" },
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

export const toCodeTableName = (
  code: string,
  table: readonly { code: string; name: string }[],
) => {
  const entry = table.find((item) => item.code === code);
  return entry ? entry.name : code;
};
