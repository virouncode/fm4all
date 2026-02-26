import "server-only";

import { db } from "@/db";
import { entreprises } from "@/db/schema/entreprises";
import { clientServices, services } from "@/db/schema/services";
import { sites } from "@/db/schema/sites";
import {
  type PrestationListItem,
  prestationListItemSchema,
  type SelectClientServiceType,
  selectClientServiceSchema,
} from "@/zod-schemas/clientServices.schema";
import { and, eq } from "drizzle-orm";

/**
 * GET ALL PRESTATIONS FOR AN ENTREPRISE
 * Returns flat list with joined names for display
 */
export async function getPrestationsByEntreprise(
  entrepriseId: string,
  options?: {
    statut?: SelectClientServiceType["statut"];
    serviceId?: string;
    siteId?: string;
  },
): Promise<PrestationListItem[]> {
  const conditions = [eq(clientServices.entrepriseId, entrepriseId)];

  if (options?.statut) {
    conditions.push(eq(clientServices.statut, options.statut));
  }
  if (options?.serviceId) {
    conditions.push(eq(clientServices.serviceId, options.serviceId));
  }
  if (options?.siteId) {
    conditions.push(eq(clientServices.siteId, options.siteId));
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
      frequence: clientServices.frequence,
      frequenceParPeriode: clientServices.frequenceParPeriode,
      intervalleJours: clientServices.intervalleJours,
      dateDebut: clientServices.dateDebut,
      dateFin: clientServices.dateFin,
      joursPreference: clientServices.joursPreference,
      heureDebutPreference: clientServices.heureDebutPreference,
      dureeEstimeeMinutes: clientServices.dureeEstimeeMinutes,
      statut: clientServices.statut,
      modePlanning: clientServices.modePlanning,
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
    .orderBy(clientServices.createdAt);

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
      frequence: clientServices.frequence,
      frequenceParPeriode: clientServices.frequenceParPeriode,
      intervalleJours: clientServices.intervalleJours,
      dateDebut: clientServices.dateDebut,
      dateFin: clientServices.dateFin,
      joursPreference: clientServices.joursPreference,
      heureDebutPreference: clientServices.heureDebutPreference,
      dureeEstimeeMinutes: clientServices.dureeEstimeeMinutes,
      statut: clientServices.statut,
      modePlanning: clientServices.modePlanning,
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
