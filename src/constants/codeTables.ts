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
  { code: "prive", name: "Privé" }, // visible uniquement par l'entreprise propriétaire
  { code: "public", name: "Partagé" }, // visible par les entreprises en relation
] as const;

export const documentVisibiliteCodes = documentVisibiliteCT.map(
  (i) => i.code,
) as unknown as [
  (typeof documentVisibiliteCT)[number]["code"],
  ...(typeof documentVisibiliteCT)[number]["code"][],
];

export const documentCategorieCT = [
  // Contractuel / financier
  { code: "contrat", name: "Contrat" },
  { code: "avenant", name: "Avenant" },
  { code: "devis", name: "Devis" },
  { code: "devis_temporaire", name: "Devis temporaire" },
  { code: "devis_demande", name: "Demande de devis" },
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
  { code: "intervention_piece_jointe", name: "Pièce jointe (intervention)" },

  // Catalogue machines
  { code: "machine_a_cafe", name: "Photo machine à café (catalogue)" },
  { code: "fontaine", name: "Photo fontaine à eau (catalogue)" },

  // Vitrine prestataire
  { code: "vitrine_nettoyage", name: "Photo vitrine nettoyage" },
  { code: "vitrine_hygiene", name: "Photo vitrine hygiène" },
  { code: "vitrine_maintenance", name: "Photo vitrine maintenance multitechnique" },
  { code: "vitrine_incendie", name: "Photo vitrine sécurité incendie" },
  { code: "vitrine_cafe", name: "Photo vitrine café & boissons chaudes" },
  { code: "vitrine_snacks", name: "Photo vitrine snacks & fruits" },
  { code: "vitrine_fontaines", name: "Photo vitrine fontaines à eau" },
  { code: "vitrine_office_manager", name: "Photo vitrine office manager" },
] as const;

export const documentCategorieCodes = documentCategorieCT.map(
  (i) => i.code,
) as unknown as [
  (typeof documentCategorieCT)[number]["code"],
  ...(typeof documentCategorieCT)[number]["code"][],
];

export const toCodeTableName = (
  code: string,
  table: readonly { code: string; name: string }[],
) => {
  const entry = table.find((item) => item.code === code);
  return entry ? entry.name : code;
};
