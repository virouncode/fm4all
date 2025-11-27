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
  { code: "fournisseur", name: "Fournisseur" },
  { code: "client", name: "Client" },
] as const;

export const userRoleCodes = userRoleCT.map((i) => i.code) as unknown as [
  (typeof userRoleCT)[number]["code"],
  ...(typeof userRoleCT)[number]["code"][],
];

export const toCodeTableName = (
  code: string,
  table: readonly { code: string; name: string }[],
) => {
  const entry = table.find((item) => item.code === code);
  return entry ? entry.name : code;
};
