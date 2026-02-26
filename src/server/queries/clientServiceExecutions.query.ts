import "server-only";

import { db } from "@/db";
import {
  clientServiceExecutionPrix,
  clientServiceExecutions,
  clientServiceOccurrences,
  clientServices,
} from "@/db/schema/services";
import { serviceEntreprises } from "@/db/schema/entreprises";
import { entreprises } from "@/db/schema/entreprises";
import { sites } from "@/db/schema/sites";
import { and, asc, count, desc, eq, gte, isNull, or } from "drizzle-orm";

/**
 * Récupère la liste des prestataires avec lesquels un client a une relation
 * (via clientServiceExecutions actifs)
 *
 * @param clientEntrepriseId - ID de l'entreprise cliente
 * @returns Liste des prestataires avec id et nom
 */
export async function getClientPrestataires(
  clientEntrepriseId: string
): Promise<Array<{ id: string; nom: string }>> {
  const results = await db
    .selectDistinct({
      id: entreprises.id,
      nom: entreprises.nom,
    })
    .from(clientServiceExecutions)
    .innerJoin(
      clientServices,
      eq(clientServices.id, clientServiceExecutions.clientServiceId)
    )
    .innerJoin(
      serviceEntreprises,
      eq(serviceEntreprises.id, clientServiceExecutions.serviceEntrepriseId)
    )
    .innerJoin(
      entreprises,
      eq(entreprises.id, serviceEntreprises.entrepriseId)
    )
    .where(
      and(
        eq(clientServices.entrepriseId, clientEntrepriseId),
        eq(clientServices.statut, "actif"),
        eq(clientServiceExecutions.actif, true),
        or(
          isNull(clientServiceExecutions.dateFinValidite),
          gte(clientServiceExecutions.dateFinValidite, new Date())
        )
      )
    )
    .orderBy(entreprises.nom);

  return results;
}

// ==================== PRESTATAIRES FOR SERVICE ====================

/**
 * Récupère les prestataires actifs offrant un service donné.
 */
export async function getPrestatairesForService(
  serviceId: string,
): Promise<Array<{ serviceEntrepriseId: string; entrepriseId: string; nom: string }>> {
  const rows = await db
    .select({
      serviceEntrepriseId: serviceEntreprises.id,
      entrepriseId: entreprises.id,
      nom: entreprises.nom,
    })
    .from(serviceEntreprises)
    .innerJoin(entreprises, eq(entreprises.id, serviceEntreprises.entrepriseId))
    .where(
      and(
        eq(serviceEntreprises.serviceId, serviceId),
        eq(serviceEntreprises.actif, true),
      ),
    )
    .orderBy(entreprises.nom);

  return rows;
}

// ==================== TYPES ====================

export type ExecutionPrixItem = {
  id: string;
  typePrix: "abonnement" | "par_occurrence" | "installation" | "frais_livraison";
  montantHt: number;
  coutPrestataireHt: number | null;
  margePourcent: number | null;
  periodeFacturation: "semaine" | "mois" | "annee" | null;
  nbOccurrencesIncluses: number | null;
  actif: boolean;
};

export type ExecutionWithPrix = {
  id: string;
  clientServiceId: string;
  siteId: string;
  serviceEntrepriseId: string | null;
  prestataireNom: string | null;
  dateDebutValidite: Date;
  dateFinValidite: Date | null;
  priorite: number;
  actif: boolean;
  createdAt: Date;
  prix: ExecutionPrixItem[];
};

export type OccurrenceListItem = {
  id: string;
  clientServiceId: string;
  siteId: string;
  siteNom: string | null;
  executionId: string | null;
  dateDebutPrevue: Date | null;
  dateFinPrevue: Date | null;
  dateDebutReelle: Date | null;
  dateFinReelle: Date | null;
  statut: "planifiee" | "en_cours" | "terminee" | "non_honoree" | "annulee";
  notes: string | null;
  createdAt: Date;
};

// ==================== EXECUTIONS WITH PRIX ====================

/**
 * Récupère les exécutions d'une prestation avec leurs lignes de prix.
 */
export async function getExecutionsWithPrixByPrestationId(
  prestationId: string,
): Promise<ExecutionWithPrix[]> {
  // 1. Récupérer les exécutions (avec nom prestataire via LEFT JOIN)
  const executionRows = await db
    .select({
      id: clientServiceExecutions.id,
      clientServiceId: clientServiceExecutions.clientServiceId,
      siteId: clientServiceExecutions.siteId,
      serviceEntrepriseId: clientServiceExecutions.serviceEntrepriseId,
      prestataireNom: entreprises.nom,
      dateDebutValidite: clientServiceExecutions.dateDebutValidite,
      dateFinValidite: clientServiceExecutions.dateFinValidite,
      priorite: clientServiceExecutions.priorite,
      actif: clientServiceExecutions.actif,
      createdAt: clientServiceExecutions.createdAt,
    })
    .from(clientServiceExecutions)
    .leftJoin(
      serviceEntreprises,
      eq(serviceEntreprises.id, clientServiceExecutions.serviceEntrepriseId),
    )
    .leftJoin(entreprises, eq(entreprises.id, serviceEntreprises.entrepriseId))
    .where(eq(clientServiceExecutions.clientServiceId, prestationId))
    .orderBy(desc(clientServiceExecutions.priorite), asc(clientServiceExecutions.createdAt));

  if (executionRows.length === 0) return [];

  // 2. Récupérer tous les prix pour ces exécutions
  const executionIds = executionRows.map((e) => e.id);
  const prixRows = await db
    .select()
    .from(clientServiceExecutionPrix)
    .where(
      executionIds.length === 1
        ? eq(clientServiceExecutionPrix.executionId, executionIds[0]!)
        : or(
            ...executionIds.map((id) =>
              eq(clientServiceExecutionPrix.executionId, id),
            ),
          ),
    )
    .orderBy(asc(clientServiceExecutionPrix.typePrix));

  // 3. Grouper les prix par executionId
  const prixByExecution = new Map<string, ExecutionPrixItem[]>();
  for (const prix of prixRows) {
    const list = prixByExecution.get(prix.executionId) ?? [];
    list.push({
      id: prix.id,
      typePrix: prix.typePrix,
      montantHt: prix.montantHt,
      coutPrestataireHt: prix.coutPrestataireHt,
      margePourcent: prix.margePourcent,
      periodeFacturation: prix.periodeFacturation ?? null,
      nbOccurrencesIncluses: prix.nbOccurrencesIncluses,
      actif: prix.actif,
    });
    prixByExecution.set(prix.executionId, list);
  }

  // 4. Assembler
  return executionRows.map((e) => ({
    ...e,
    prestataireNom: e.prestataireNom ?? null,
    prix: prixByExecution.get(e.id) ?? [],
  }));
}

// ==================== OCCURRENCES ====================

export type OccurrenceFilters = {
  limit?: number;
  offset?: number;
  statut?: "planifiee" | "en_cours" | "terminee" | "non_honoree" | "annulee";
  nonAssignedOnly?: boolean;
  siteId?: string;
  sortDir?: "asc" | "desc";
};

/**
 * Récupère les occurrences d'une prestation avec filtres, tri et pagination.
 */
export async function getOccurrencesByPrestationId(
  prestationId: string,
  options?: OccurrenceFilters,
): Promise<OccurrenceListItem[]> {
  const conditions = [
    eq(clientServiceOccurrences.clientServiceId, prestationId),
  ];
  if (options?.statut) {
    conditions.push(eq(clientServiceOccurrences.statut, options.statut));
  }
  if (options?.nonAssignedOnly) {
    conditions.push(isNull(clientServiceOccurrences.executionId));
  }
  if (options?.siteId) {
    conditions.push(eq(clientServiceOccurrences.siteId, options.siteId));
  }

  const rows = await db
    .select({
      id: clientServiceOccurrences.id,
      clientServiceId: clientServiceOccurrences.clientServiceId,
      siteId: clientServiceOccurrences.siteId,
      siteNom: sites.nom,
      executionId: clientServiceOccurrences.executionId,
      dateDebutPrevue: clientServiceOccurrences.dateDebutPrevue,
      dateFinPrevue: clientServiceOccurrences.dateFinPrevue,
      dateDebutReelle: clientServiceOccurrences.dateDebutReelle,
      dateFinReelle: clientServiceOccurrences.dateFinReelle,
      statut: clientServiceOccurrences.statut,
      notes: clientServiceOccurrences.notes,
      createdAt: clientServiceOccurrences.createdAt,
    })
    .from(clientServiceOccurrences)
    .leftJoin(sites, eq(sites.id, clientServiceOccurrences.siteId))
    .where(and(...conditions))
    .orderBy(
      options?.sortDir === "desc"
        ? desc(clientServiceOccurrences.dateDebutPrevue)
        : asc(clientServiceOccurrences.dateDebutPrevue),
      asc(clientServiceOccurrences.id),
    )
    .limit(options?.limit ?? 50)
    .offset(options?.offset ?? 0);

  return rows as OccurrenceListItem[];
}

/**
 * Compte le nombre d'occurrences pour une prestation.
 */
export async function countOccurrencesByPrestationId(
  prestationId: string,
): Promise<number> {
  const [row] = await db
    .select({ count: db.$count(clientServiceOccurrences) })
    .from(clientServiceOccurrences)
    .where(eq(clientServiceOccurrences.clientServiceId, prestationId));

  return Number(row?.count ?? 0);
}

/**
 * Compte les occurrences sans prestataire assigné (executionId IS NULL).
 */
export async function countNonAssignedOccurrencesByPrestationId(
  prestationId: string,
): Promise<number> {
  const [row] = await db
    .select({ count: count() })
    .from(clientServiceOccurrences)
    .where(
      and(
        eq(clientServiceOccurrences.clientServiceId, prestationId),
        isNull(clientServiceOccurrences.executionId),
      ),
    );

  return Number(row?.count ?? 0);
}

/**
 * Récupère les sites distincts ayant des occurrences pour une prestation.
 */
export async function getDistinctSitesForPrestation(
  prestationId: string,
): Promise<Array<{ id: string; nom: string }>> {
  const rows = await db
    .selectDistinct({
      id: clientServiceOccurrences.siteId,
      nom: sites.nom,
    })
    .from(clientServiceOccurrences)
    .innerJoin(sites, eq(sites.id, clientServiceOccurrences.siteId))
    .where(eq(clientServiceOccurrences.clientServiceId, prestationId))
    .orderBy(sites.nom);

  return rows.map((r) => ({ id: r.id, nom: r.nom ?? r.id }));
}
