import "server-only";

import { db } from "@/db";
import { entreprises, serviceEntreprises } from "@/db/schema/entreprises";
import { clientServiceExecutions, clientServices, services } from "@/db/schema/services";
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
import { asc, desc, and, eq, inArray, isNotNull } from "drizzle-orm";

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
