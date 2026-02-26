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
import { and, asc, desc, eq, gte, isNull, or } from "drizzle-orm";

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

/**
 * Récupère les occurrences d'une prestation.
 */
export async function getOccurrencesByPrestationId(
  prestationId: string,
  options?: { limit?: number; offset?: number },
): Promise<OccurrenceListItem[]> {
  const rows = await db
    .select({
      id: clientServiceOccurrences.id,
      clientServiceId: clientServiceOccurrences.clientServiceId,
      siteId: clientServiceOccurrences.siteId,
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
    .where(eq(clientServiceOccurrences.clientServiceId, prestationId))
    .orderBy(desc(clientServiceOccurrences.dateDebutPrevue))
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
