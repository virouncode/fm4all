import {
  adhesionStatutCodes,
  attributionModeCodes,
  clientServiceModeCodes,
  clientServiceStatutCodes,
  contratDealModeCodes,
  modeCommercialCodes,
  modePilotageCodes,
  contratStatutCodes,
  contratTypeCodes,
  devisDemandeStatutCodes,
  devisLigneUniteCodes,
  devisPeriodeFacturationCodes,
  devisStatutCodes,
  devisTypePrixCodes,
  documentCategorieCodes,
  documentTypeCodes,
  documentVisibiliteCodes,
  executionPeriodeFacturationCodes,
  executionTypePrixCodes,
  factureLigneTypeSourceCodes,
  factureModeCommercialSnapshotCodes,
  factureStatutCodes,
  invitationTypeAdhesionCodes,
  occurrenceStatutCodes,
  occurrenceTacheStatutCodes,
  paiementMethodeCodes,
  paiementStatutCodes,
  perimetreModeCodes,
  roleClientAdhesionCodes,
  roleClientAttributionSiteCodes,
  rolePrestataireAdhesionCodes,
  rolePrestataireAttributionSiteCodes,
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
  // Nouvelle architecture planification prestations (2026-03-14)
  famillePlanificationCodes,
  typeSourceOccurrenceCodes,
  periodeQuotaCodes,
  modeAncragePeriodeCodes,
  typeExceptionRecurrenceCodes,
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
export const clientServiceStatutEnum = pgEnum(
  "client_service_statut",
  clientServiceStatutCodes,
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
export const devisDemandeStatutEnum = pgEnum(
  "devis_demande_statut",
  devisDemandeStatutCodes,
);
export const devisTypePrixEnum = pgEnum("devis_type_prix", devisTypePrixCodes);
export const devisPeriodeFacturationEnum = pgEnum(
  "devis_periode_facturation",
  devisPeriodeFacturationCodes,
);
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
export const roleClientAdhesionEnum = pgEnum(
  "role_client_adhesion",
  roleClientAdhesionCodes,
);
export const rolePrestataireAdhesionEnum = pgEnum(
  "role_prestataire_adhesion",
  rolePrestataireAdhesionCodes,
);
export const rolePlateformeAdhesionEnum = pgEnum(
  "role_plateforme_adhesion",
  rolePlateformeAdhesionCodes,
);
export const roleClientAttributionSiteEnum = pgEnum(
  "role_client_attribution_site",
  roleClientAttributionSiteCodes,
);
export const rolePrestataireAttributionSiteEnum = pgEnum(
  "role_prestataire_attribution_site",
  rolePrestataireAttributionSiteCodes,
);
export const adhesionStatutEnum = pgEnum(
  "adhesion_statut",
  adhesionStatutCodes,
);

export const invitationTypeAdhesionEnum = pgEnum(
  "invitation_type_adhesion",
  invitationTypeAdhesionCodes,
);

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
export const factureLigneTypeSourceEnum = pgEnum(
  "facture_ligne_type_source",
  factureLigneTypeSourceCodes,
);
export const factureModeCommercialSnapshotEnum = pgEnum(
  "facture_mode_commercial_snapshot",
  factureModeCommercialSnapshotCodes,
);

export const paiementStatutEnum = pgEnum(
  "paiement_statut",
  paiementStatutCodes,
);

export const paiementMethodeEnum = pgEnum(
  "paiement_methode",
  paiementMethodeCodes,
);

export const executionTypePrixEnum = pgEnum(
  "execution_type_prix",
  executionTypePrixCodes,
);

export const executionPeriodeFacturationEnum = pgEnum(
  "execution_periode_facturation",
  executionPeriodeFacturationCodes,
);

export const modeCommercialEnum = pgEnum(
  "mode_commercial",
  modeCommercialCodes,
);

export const modePilotageEnum = pgEnum("mode_pilotage", modePilotageCodes);

export const clientPrestataireContactSideEnum = pgEnum(
  "client_prestataire_contact_side",
  ["client", "prestataire"],
);

// ---------------------------------------------------------------------------
// Nouvelle architecture planification prestations (2026-03-14)
// ---------------------------------------------------------------------------

export const famillePlanificationEnum = pgEnum(
  "famille_planification",
  famillePlanificationCodes,
);

export const typeSourceOccurrenceEnum = pgEnum(
  "type_source_occurrence",
  typeSourceOccurrenceCodes,
);

export const periodeQuotaEnum = pgEnum(
  "periode_quota",
  periodeQuotaCodes,
);

export const modeAncragePeriodeEnum = pgEnum(
  "mode_ancrage_periode",
  modeAncragePeriodeCodes,
);

export const typeExceptionRecurrenceEnum = pgEnum(
  "type_exception_recurrence",
  typeExceptionRecurrenceCodes,
);
