import "server-only";

import { db } from "@/db";
import { clientServices, services } from "@/db/schema/services";
import { serviceEntreprises } from "@/db/schema/entreprises";
import type { ServiceWithStatsType } from "@/zod-schemas/service.schema";
import { and, asc, eq, sql } from "drizzle-orm";

/**
 * GET ALL SERVICES (catalogue)
 * Returns minimal list for form selects
 */
export async function getAllServices(): Promise<
  Array<{ id: string; nom: string }>
> {
  return await db
    .select({ id: services.id, nom: services.nom })
    .from(services)
    .orderBy(asc(services.nom));
}

/**
 * GET SERVICES BY PRESTATAIRE
 * Returns services offered by a prestataire enterprise (via serviceEntreprises table)
 * Includes serviceEntrepriseId for direct use when creating executions.
 */
export async function getServicesByPrestataire(
  prestataireEntrepriseId: string,
): Promise<Array<{ id: string; nom: string; serviceEntrepriseId: string }>> {
  return await db
    .select({
      id: services.id,
      nom: services.nom,
      serviceEntrepriseId: serviceEntreprises.id,
    })
    .from(serviceEntreprises)
    .innerJoin(services, eq(serviceEntreprises.serviceId, services.id))
    .where(
      and(
        eq(serviceEntreprises.entrepriseId, prestataireEntrepriseId),
        eq(serviceEntreprises.actif, true),
      ),
    )
    .orderBy(asc(services.nom));
}

/**
 * GET ALL SERVICES WITH STATS (plateforme only)
 * Returns services with count of active client companies and active provider companies
 */
export async function getServicesWithStats(): Promise<ServiceWithStatsType[]> {
  const rows = await db
    .select({
      id: services.id,
      nom: services.nom,
      description: services.description,
      createdAt: services.createdAt,
      updatedAt: services.updatedAt,
      // Count distinct entreprises having an active or paused clientService for this service
      nbClients: sql<number>`CAST(COUNT(DISTINCT CASE WHEN ${clientServices.statut} IN ('actif', 'en_pause') THEN ${clientServices.entrepriseId} ELSE NULL END) AS integer)`,
      // Count distinct entreprises referenced as prestataire for this service (actif only)
      nbPrestataires: sql<number>`CAST(COUNT(DISTINCT CASE WHEN ${serviceEntreprises.actif} = true THEN ${serviceEntreprises.entrepriseId} ELSE NULL END) AS integer)`,
    })
    .from(services)
    .leftJoin(clientServices, eq(clientServices.serviceId, services.id))
    .leftJoin(
      serviceEntreprises,
      eq(serviceEntreprises.serviceId, services.id),
    )
    .groupBy(
      services.id,
      services.nom,
      services.description,
      services.createdAt,
      services.updatedAt,
    )
    .orderBy(asc(services.nom));

  return rows.map((r) => ({
    ...r,
    nbClients: Number(r.nbClients),
    nbPrestataires: Number(r.nbPrestataires),
  }));
}
