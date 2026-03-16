import "server-only";

import { db } from "@/db";
import { entreprises, serviceEntreprises } from "@/db/schema/entreprises";
import {
  clientServiceExecutions,
  clientServiceOccurrences,
  clientServiceQuotasPlanification,
  clientServiceReglesRecurrence,
  clientServices,
  services,
  tacheListeItems,
  tacheListesTemplates,
} from "@/db/schema/services";
import { sites } from "@/db/schema/sites";
import { userClientAdhesions } from "@/db/schema/users";
import {
  type FamillePlanificationType,
  type ModeCommercialType,
  type PrestationListItem,
  prestationListItemSchema,
  type PrestationsOrderByType,
  type SelectClientServiceType,
  selectClientServiceSchema,
} from "@/zod-schemas/clientServices.schema";
import {
  selectRegleRecurrenceSchema,
  type SelectRegleRecurrenceType,
} from "@/zod-schemas/clientServiceReglesRecurrence.schema";
import { computeQuotaPeriode } from "@/server/utils/clientServiceOccurrences.utils";
import { asc, desc, and, count, eq, gte, inArray, isNotNull, lte, ne } from "drizzle-orm";

export type RegleRecurrenceChecklistItemType = {
  id: string;
  ordre: number;
  titre: string;
  dureeEstimeeMinutes: number | null;
};

export type RegleRecurrenceAvecTemplateType = SelectRegleRecurrenceType & {
  tacheListeTemplateName: string | null;
  tacheListeItems: RegleRecurrenceChecklistItemType[];
};

/**
 * Vérifie si une entreprise prestataire a au moins une exécution active sur une prestation.
 * Utilisé pour autoriser l'accès en posture prestataire à la page de détail d'une prestation.
 */
export async function prestataireHasExecutionOnPrestation({
  prestationId,
  prestataireEntrepriseId,
}: {
  prestationId: string;
  prestataireEntrepriseId: string;
}): Promise<boolean> {
  const row = await db
    .select({ id: clientServiceExecutions.id })
    .from(clientServiceExecutions)
    .innerJoin(
      serviceEntreprises,
      eq(serviceEntreprises.id, clientServiceExecutions.serviceEntrepriseId),
    )
    .where(
      and(
        eq(clientServiceExecutions.clientServiceId, prestationId),
        eq(serviceEntreprises.entrepriseId, prestataireEntrepriseId),
        isNotNull(clientServiceExecutions.serviceEntrepriseId),
      ),
    )
    .limit(1);

  return row.length > 0;
}

export async function hasClientActiveAdmin(
  clientEntrepriseId: string,
): Promise<boolean> {
  const admin = await db.query.userClientAdhesions.findFirst({
    where: and(
      eq(userClientAdhesions.entrepriseId, clientEntrepriseId),
      eq(userClientAdhesions.role, "admin"),
      eq(userClientAdhesions.statut, "actif"),
    ),
  });
  return !!admin;
}

// ==================== ORDER HELPER ====================

function buildOrderBy(
  orderBy?: PrestationsOrderByType,
  orderDir?: "asc" | "desc",
) {
  const dir = orderDir === "asc" ? asc : desc;
  switch (orderBy) {
    case "serviceNom":
      return dir(services.nom);
    case "siteNom":
      return dir(sites.nom);
    case "statut":
      return dir(clientServices.statut);
    case "famillePlanification":
      return dir(clientServices.famillePlanification);
    case "dateDebut":
      return dir(clientServices.dateDebut);
    case "updatedAt":
      return dir(clientServices.updatedAt);
    case "createdAt":
    default:
      return dir(clientServices.createdAt);
  }
}

// ==================== QUERIES ====================

/**
 * GET ALL PRESTATIONS FOR AN ENTREPRISE
 * Returns flat list with joined names for display
 */
export async function getPrestationsByEntreprise(
  entrepriseId: string,
  options?: {
    statut?: SelectClientServiceType["statut"];
    famillePlanification?: FamillePlanificationType;
    serviceId?: string;
    siteId?: string;
    modeCommercial?: ModeCommercialType;
    orderBy?: PrestationsOrderByType;
    orderDir?: "asc" | "desc";
    /** Gate N2 client : si fourni, restreint aux prestations dont le site est dans cette liste */
    attributedClientSiteIds?: string[];
  },
): Promise<PrestationListItem[]> {
  const conditions = [eq(clientServices.entrepriseId, entrepriseId)];

  if (options?.statut) {
    conditions.push(eq(clientServices.statut, options.statut));
  }
  if (options?.famillePlanification) {
    conditions.push(eq(clientServices.famillePlanification, options.famillePlanification));
  }
  if (options?.serviceId) {
    conditions.push(eq(clientServices.serviceId, options.serviceId));
  }
  if (options?.siteId) {
    conditions.push(eq(clientServices.siteId, options.siteId));
  }
  if (options?.modeCommercial) {
    conditions.push(eq(clientServices.modeCommercial, options.modeCommercial));
  }
  // Gate N2 client : filtre par sites attribués (posture client non-admin)
  if (options?.attributedClientSiteIds && options.attributedClientSiteIds.length > 0) {
    conditions.push(inArray(clientServices.siteId, options.attributedClientSiteIds));
  }

  const rows = await db
    .select({
      id: clientServices.id,
      entrepriseId: clientServices.entrepriseId,
      entrepriseNom: entreprises.nom,
      siteId: clientServices.siteId,
      siteNom: sites.nom,
      serviceId: clientServices.serviceId,
      serviceNom: services.nom,
      famillePlanification: clientServices.famillePlanification,
      dateDebut: clientServices.dateDebut,
      dateFin: clientServices.dateFin,
      statut: clientServices.statut,
      modeCommercial: clientServices.modeCommercial,
      notes: clientServices.notes,
      createdAt: clientServices.createdAt,
      updatedAt: clientServices.updatedAt,
    })
    .from(clientServices)
    .innerJoin(entreprises, eq(entreprises.id, clientServices.entrepriseId))
    .innerJoin(sites, eq(sites.id, clientServices.siteId))
    .innerJoin(services, eq(services.id, clientServices.serviceId))
    .where(and(...conditions))
    .orderBy(buildOrderBy(options?.orderBy, options?.orderDir));

  return rows.map((row) => prestationListItemSchema.parse(row));
}

/**
 * GET PRESTATIONS BY PRESTATAIRE
 * Returns prestations where the prestataire has at least one execution
 * (joins via clientServiceExecutions → serviceEntreprises)
 */
export async function getPrestationsByPrestataire(
  prestataireEntrepriseId: string,
  options?: {
    clientEntrepriseId?: string;
    statut?: SelectClientServiceType["statut"];
    famillePlanification?: FamillePlanificationType;
    serviceId?: string;
    siteId?: string;
    modeCommercial?: ModeCommercialType;
    orderBy?: PrestationsOrderByType;
    orderDir?: "asc" | "desc";
    /** Gate N2 : si fourni, restreint aux prestations dont le site est dans cette liste */
    attributedSiteIds?: string[];
  },
): Promise<PrestationListItem[]> {
  const conditions = [
    eq(serviceEntreprises.entrepriseId, prestataireEntrepriseId),
  ];

  if (options?.clientEntrepriseId) {
    conditions.push(eq(clientServices.entrepriseId, options.clientEntrepriseId));
  }

  if (options?.statut) {
    conditions.push(eq(clientServices.statut, options.statut));
  }
  if (options?.famillePlanification) {
    conditions.push(eq(clientServices.famillePlanification, options.famillePlanification));
  }
  if (options?.serviceId) {
    conditions.push(eq(clientServices.serviceId, options.serviceId));
  }
  if (options?.siteId) {
    conditions.push(eq(clientServices.siteId, options.siteId));
  }
  if (options?.modeCommercial) {
    conditions.push(eq(clientServices.modeCommercial, options.modeCommercial));
  }
  // Gate N2 : filtre par sites attribués (posture prestataire non-admin)
  if (options?.attributedSiteIds && options.attributedSiteIds.length > 0) {
    conditions.push(inArray(clientServices.siteId, options.attributedSiteIds));
  }

  const rows = await db
    .selectDistinctOn([clientServices.id], {
      id: clientServices.id,
      entrepriseId: clientServices.entrepriseId,
      entrepriseNom: entreprises.nom,
      siteId: clientServices.siteId,
      siteNom: sites.nom,
      serviceId: clientServices.serviceId,
      serviceNom: services.nom,
      famillePlanification: clientServices.famillePlanification,
      dateDebut: clientServices.dateDebut,
      dateFin: clientServices.dateFin,
      statut: clientServices.statut,
      modeCommercial: clientServices.modeCommercial,
      notes: clientServices.notes,
      createdAt: clientServices.createdAt,
      updatedAt: clientServices.updatedAt,
    })
    .from(clientServices)
    .innerJoin(entreprises, eq(entreprises.id, clientServices.entrepriseId))
    .innerJoin(sites, eq(sites.id, clientServices.siteId))
    .innerJoin(services, eq(services.id, clientServices.serviceId))
    .innerJoin(
      clientServiceExecutions,
      eq(clientServiceExecutions.clientServiceId, clientServices.id),
    )
    .innerJoin(
      serviceEntreprises,
      eq(serviceEntreprises.id, clientServiceExecutions.serviceEntrepriseId),
    )
    .where(and(...conditions))
    .orderBy(clientServices.id, buildOrderBy(options?.orderBy, options?.orderDir));

  return rows.map((row) => prestationListItemSchema.parse(row));
}

/**
 * GET ALL PRESTATIONS (cross-client view — plateforme only)
 * Returns flat list with joined names for display
 */
export async function getAllPrestations(options?: {
  statut?: SelectClientServiceType["statut"];
  famillePlanification?: FamillePlanificationType;
  serviceId?: string;
  siteId?: string;
  modeCommercial?: ModeCommercialType;
  orderBy?: PrestationsOrderByType;
  orderDir?: "asc" | "desc";
}): Promise<PrestationListItem[]> {
  const rows = await db
    .select({
      id: clientServices.id,
      entrepriseId: clientServices.entrepriseId,
      entrepriseNom: entreprises.nom,
      siteId: clientServices.siteId,
      siteNom: sites.nom,
      serviceId: clientServices.serviceId,
      serviceNom: services.nom,
      famillePlanification: clientServices.famillePlanification,
      dateDebut: clientServices.dateDebut,
      dateFin: clientServices.dateFin,
      statut: clientServices.statut,
      modeCommercial: clientServices.modeCommercial,
      notes: clientServices.notes,
      createdAt: clientServices.createdAt,
      updatedAt: clientServices.updatedAt,
    })
    .from(clientServices)
    .innerJoin(entreprises, eq(entreprises.id, clientServices.entrepriseId))
    .innerJoin(sites, eq(sites.id, clientServices.siteId))
    .innerJoin(services, eq(services.id, clientServices.serviceId))
    .where(
      and(
        options?.statut ? eq(clientServices.statut, options.statut) : undefined,
        options?.serviceId
          ? eq(clientServices.serviceId, options.serviceId)
          : undefined,
        options?.siteId
          ? eq(clientServices.siteId, options.siteId)
          : undefined,
        options?.modeCommercial
          ? eq(clientServices.modeCommercial, options.modeCommercial)
          : undefined,
        options?.famillePlanification
          ? eq(clientServices.famillePlanification, options.famillePlanification)
          : undefined,
      ),
    )
    .orderBy(buildOrderBy(options?.orderBy, options?.orderDir));

  return rows.map((row) => prestationListItemSchema.parse(row));
}

/**
 * GET SINGLE PRESTATION BY ID
 */
export async function getPrestationById(
  prestationId: string,
): Promise<SelectClientServiceType | null> {
  const [row] = await db
    .select()
    .from(clientServices)
    .where(eq(clientServices.id, prestationId))
    .limit(1);

  if (!row) return null;

  return selectClientServiceSchema.parse(row);
}

/**
 * GET SINGLE PRESTATION WITH JOINS (for detail view)
 */
export async function getPrestationWithJoinsById(
  prestationId: string,
): Promise<PrestationListItem | null> {
  const [row] = await db
    .select({
      id: clientServices.id,
      entrepriseId: clientServices.entrepriseId,
      entrepriseNom: entreprises.nom,
      siteId: clientServices.siteId,
      siteNom: sites.nom,
      serviceId: clientServices.serviceId,
      serviceNom: services.nom,
      famillePlanification: clientServices.famillePlanification,
      dateDebut: clientServices.dateDebut,
      dateFin: clientServices.dateFin,
      statut: clientServices.statut,
      modeCommercial: clientServices.modeCommercial,
      notes: clientServices.notes,
      createdAt: clientServices.createdAt,
      updatedAt: clientServices.updatedAt,
    })
    .from(clientServices)
    .innerJoin(entreprises, eq(entreprises.id, clientServices.entrepriseId))
    .innerJoin(sites, eq(sites.id, clientServices.siteId))
    .innerJoin(services, eq(services.id, clientServices.serviceId))
    .where(eq(clientServices.id, prestationId))
    .limit(1);

  if (!row) return null;

  return prestationListItemSchema.parse(row);
}

/**
 * CHECK IF PRESTATION BELONGS TO ENTREPRISE (security helper)
 */
export async function prestationBelongsToEntreprise({
  prestationId,
  entrepriseId,
}: {
  prestationId: string;
  entrepriseId: string;
}): Promise<boolean> {
  const [row] = await db
    .select({ id: clientServices.id })
    .from(clientServices)
    .where(
      and(
        eq(clientServices.id, prestationId),
        eq(clientServices.entrepriseId, entrepriseId),
      ),
    )
    .limit(1);

  return !!row;
}

// ---------------------------------------------------------------------------
// QUOTA INFO (pour l'affichage et l'enforcement)
// ---------------------------------------------------------------------------

export type QuotaInfoType = {
  nbOccurrencesParPeriode: number;
  periodDebut: Date;
  periodFin: Date;
  usedInPeriod: number;
};

/**
 * Retourne les infos de quota pour une prestation en mode quota_manuel.
 * Calcule la période courante et le nombre d'occurrences non-annulées dans cette période.
 *
 * @returns null si aucune config quota n'est définie pour cette prestation.
 */
export async function getQuotaInfoForPrestation(
  prestationId: string,
  today: Date = new Date(),
): Promise<QuotaInfoType | null> {
  const [quota] = await db
    .select()
    .from(clientServiceQuotasPlanification)
    .where(eq(clientServiceQuotasPlanification.clientServiceId, prestationId))
    .limit(1);

  if (!quota) return null;

  const { debut, fin } = computeQuotaPeriode(
    quota.dateAncragePeriode,
    quota.periodeQuota,
    quota.modeAncragePeriode,
    today,
  );

  const [usageRow] = await db
    .select({ total: count() })
    .from(clientServiceOccurrences)
    .where(
      and(
        eq(clientServiceOccurrences.clientServiceId, prestationId),
        ne(clientServiceOccurrences.statut, "annulee"),
        gte(clientServiceOccurrences.dateDebutPrevue, debut),
        lte(clientServiceOccurrences.dateDebutPrevue, fin),
      ),
    );

  return {
    nbOccurrencesParPeriode: quota.nbOccurrencesParPeriode,
    periodDebut: debut,
    periodFin: fin,
    usedInPeriod: usageRow?.total ?? 0,
  };
}

// ---------------------------------------------------------------------------
// PLANIFICATION — données initiales (évite le fetch client-side au montage)
// ---------------------------------------------------------------------------

export async function getReglesRecurrenceByPrestationId(
  prestationId: string,
): Promise<RegleRecurrenceAvecTemplateType[]> {
  const rows = await db
    .select({
      regle: clientServiceReglesRecurrence,
      tacheListeTemplateName: tacheListesTemplates.nom,
    })
    .from(clientServiceReglesRecurrence)
    .leftJoin(
      tacheListesTemplates,
      eq(tacheListesTemplates.id, clientServiceReglesRecurrence.tacheListeTemplateId),
    )
    .where(eq(clientServiceReglesRecurrence.clientServiceId, prestationId))
    .orderBy(
      asc(clientServiceReglesRecurrence.ordre),
      asc(clientServiceReglesRecurrence.createdAt),
    );

  const templateIds = [
    ...new Set(
      rows
        .map((r) => r.regle.tacheListeTemplateId)
        .filter((id): id is string => id !== null),
    ),
  ];
  const itemsByTemplate = new Map<string, RegleRecurrenceChecklistItemType[]>();
  if (templateIds.length > 0) {
    const itemRows = await db
      .select({
        id: tacheListeItems.id,
        templateId: tacheListeItems.listeTemplateId,
        ordre: tacheListeItems.ordre,
        titre: tacheListeItems.titre,
        dureeEstimeeMinutes: tacheListeItems.dureeEstimeeMinutes,
      })
      .from(tacheListeItems)
      .where(
        templateIds.length === 1
          ? eq(tacheListeItems.listeTemplateId, templateIds[0]!)
          : inArray(tacheListeItems.listeTemplateId, templateIds),
      )
      .orderBy(asc(tacheListeItems.ordre));
    for (const item of itemRows) {
      const list = itemsByTemplate.get(item.templateId) ?? [];
      list.push({
        id: item.id,
        ordre: item.ordre,
        titre: item.titre,
        dureeEstimeeMinutes: item.dureeEstimeeMinutes,
      });
      itemsByTemplate.set(item.templateId, list);
    }
  }

  return rows.map((r) => ({
    ...selectRegleRecurrenceSchema.parse(r.regle),
    tacheListeTemplateName: r.tacheListeTemplateName ?? null,
    tacheListeItems: r.regle.tacheListeTemplateId
      ? (itemsByTemplate.get(r.regle.tacheListeTemplateId) ?? [])
      : [],
  }));
}

export type QuotaConfigType = {
  nbOccurrencesParPeriode: number;
  periodeQuota: "trimestre" | "semestre" | "annee";
  modeAncragePeriode: "contrat" | "civil";
  notes: string | null;
};

export async function getQuotaConfigByPrestationId(
  prestationId: string,
): Promise<QuotaConfigType | null> {
  const [row] = await db
    .select({
      nbOccurrencesParPeriode:
        clientServiceQuotasPlanification.nbOccurrencesParPeriode,
      periodeQuota: clientServiceQuotasPlanification.periodeQuota,
      modeAncragePeriode: clientServiceQuotasPlanification.modeAncragePeriode,
      notes: clientServiceQuotasPlanification.notes,
    })
    .from(clientServiceQuotasPlanification)
    .where(
      eq(clientServiceQuotasPlanification.clientServiceId, prestationId),
    )
    .limit(1);
  return row ?? null;
}
