import {
  adhesionStatutCodes,
  attributionModeCodes,
  clientServiceModeCodes,
  contratDealModeCodes,
  contratStatutCodes,
  contratTypeCodes,
  devisLigneUniteCodes,
  devisStatutCodes,
  devisTypePrixCodes,
  documentCategorieCodes,
  documentTypeCodes,
  documentVisibiliteCodes,
  factureLigneTypeCodes,
  factureStatutCodes,
  frequenceCodes,
  occurrenceStatutCodes,
  occurrenceTacheStatutCodes,
  paiementMethodeCodes,
  paiementStatutCodes,
  perimetreModeCodes,
  roleAdhesionCodes,
  roleAttributionSiteCodes,
  roleEntrepriseCodes,
  rolePlateformeAdhesionCodes,
  siteAttributionScopeCodes,
  ticketMessageVisibiliteCodes,
  ticketPrioriteCodes,
  ticketStatutCodes,
  ticketTypeCodes,
  typeBatimentCodes,
  typeOccupationCodes,
  userRoleCodes,
} from "@/constants/codeTables";
import { pgEnum } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", ["active", "inactive"]);
export const typeBatimentEnum = pgEnum("typebatiment", typeBatimentCodes);
export const gammeEnum = pgEnum("gamme", [
  "essentiel",
  "confort",
  "excellence",
]);
export const typeHygieneEnum = pgEnum("typehygiene", [
  "emp",
  "poubelleEmp",
  "savon",
  "ph",
  "desinfectant",
  "parfum",
  "balai",
  "poubelle",
]);
export const typeOccupationEnum = pgEnum("typeoccupation", typeOccupationCodes);
export const possibiliteEnum = pgEnum("possibilite", [
  "possible",
  "non",
  "obligatoire",
]);
export const typeMachineEnum = pgEnum("typemachine", [
  "cafe",
  "lait",
  "chocolat",
]);
export const typeLaitEnum = pgEnum("typelait", ["dosettes", "frais", "poudre"]);
export const typeChocolatEnum = pgEnum("typechocolat", ["sachets", "poudre"]);
export const inclusEnum = pgEnum("inclus", [
  "inclus",
  "non inclus",
  "non propose",
  "sur demande",
]);
export const typePorteEnum = pgEnum("typeporte", ["vantaux", "coulissante"]);
export const typeColonneEnum = pgEnum("typecolonne", ["statique", "dynamique"]);
export const typeEau = pgEnum("typeeau", ["EF", "EC", "EG", "ECG"]);
export const typePose = pgEnum("typepose", ["aposer", "colonne", "comptoir"]);
export const roleEnum = pgEnum("role", userRoleCodes);
export const ticketStatutEnum = pgEnum("ticket_statut", ticketStatutCodes);
export const ticketPrioriteEnum = pgEnum(
  "ticket_priorite",
  ticketPrioriteCodes,
);
export const ticketMessageVisibiliteEnum = pgEnum(
  "ticket_message_visibilite",
  ticketMessageVisibiliteCodes,
);
export const ticketTypeEnum = pgEnum("ticket_type", ticketTypeCodes);
export const siteAttributionScopeEnum = pgEnum(
  "site_attribution_scope",
  siteAttributionScopeCodes,
);
export const attributionModeEnum = pgEnum(
  "attribution_mode",
  attributionModeCodes,
);
export const clientServiceModeEnum = pgEnum(
  "client_service_mode",
  clientServiceModeCodes,
);
export const perimetreModeEnum = pgEnum("perimetre_mode", perimetreModeCodes);
export const occurrenceStatutEnum = pgEnum(
  "occurrence_statut",
  occurrenceStatutCodes,
);
export const occurrenceTacheStatutEnum = pgEnum(
  "occurrence_tache_statut",
  occurrenceTacheStatutCodes,
);
export const storageProviderEnum = pgEnum("storage_provider", [
  "vercel_blob",
  "s3",
]);
export const devisLigneUniteEnum = pgEnum(
  "devis_ligne_unite",
  devisLigneUniteCodes,
);
export const devisStatutEnum = pgEnum("devis_statut", devisStatutCodes);
export const devisTypePrixEnum = pgEnum("devis_type_prix", devisTypePrixCodes);
export const contratStatutEnum = pgEnum("contrat_statut", contratStatutCodes);
export const documentTypeEnum = pgEnum("document_type", documentTypeCodes);
export const documentVisibiliteEnum = pgEnum(
  "document_visibilite",
  documentVisibiliteCodes,
);

export const roleEntrepriseEnum = pgEnum(
  "role_entreprise",
  roleEntrepriseCodes,
);
export const roleAdhesionEnum = pgEnum("role_adhesion", roleAdhesionCodes);
export const rolePlateformeAdhesionEnum = pgEnum(
  "role_plateforme_adhesion",
  rolePlateformeAdhesionCodes,
);
export const roleAttributionSiteEnum = pgEnum(
  "role_attribution_site",
  roleAttributionSiteCodes,
);
export const adhesionStatutEnum = pgEnum(
  "adhesion_statut",
  adhesionStatutCodes,
);

export const frequenceEnum = pgEnum("frequence", frequenceCodes);

export const documentCategorieEnum = pgEnum(
  "document_categorie",
  documentCategorieCodes,
);

export const contratDealModeEnum = pgEnum(
  "contrat_deal_mode",
  contratDealModeCodes,
);
export const contratTypeEnum = pgEnum("contrat_type", contratTypeCodes);

export const factureStatutEnum = pgEnum("facture_statut", factureStatutCodes);
export const factureLigneTypeEnum = pgEnum(
  "facture_ligne_type",
  factureLigneTypeCodes,
);

export const paiementStatutEnum = pgEnum(
  "paiement_statut",
  paiementStatutCodes,
);

export const paiementMethodeEnum = pgEnum(
  "paiement_methode",
  paiementMethodeCodes,
);
