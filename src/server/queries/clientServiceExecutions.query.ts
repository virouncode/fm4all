import "server-only";

import { db } from "@/db";
import { documents, documentsLinks } from "@/db/schema/documents";
import {
  clientServiceExecutionPrix,
  clientServiceExecutions,
  clientServiceOccurrences,
  clientServices,
} from "@/db/schema/services";
import { serviceEntreprises } from "@/db/schema/entreprises";
import { entreprises } from "@/db/schema/entreprises";
import { sites } from "@/db/schema/sites";
import { occurrenceTaches } from "@/db/schema/services";
import { and, asc, count, desc, eq, gte, inArray, isNull, or } from "drizzle-orm";

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
  prestataireEntrepriseId: string | null;
  prestataireNom: string | null;
  dateDebutValidite: Date;
  dateFinValidite: Date | null;
  priorite: number;
  actif: boolean;
  tacheListeTemplateId: string | null;
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
      prestataireEntrepriseId: entreprises.id,
      prestataireNom: entreprises.nom,
      dateDebutValidite: clientServiceExecutions.dateDebutValidite,
      dateFinValidite: clientServiceExecutions.dateFinValidite,
      priorite: clientServiceExecutions.priorite,
      actif: clientServiceExecutions.actif,
      tacheListeTemplateId: clientServiceExecutions.tacheListeTemplateId,
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
 * Compte le nombre d'occurrences pour une prestation (sans filtres).
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
 * Compte les occurrences avec les mêmes filtres que getOccurrencesByPrestationId.
 */
export async function countFilteredOccurrencesByPrestationId(
  prestationId: string,
  options?: Pick<OccurrenceFilters, "statut" | "nonAssignedOnly" | "siteId">,
): Promise<number> {
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

  const [row] = await db
    .select({ count: count() })
    .from(clientServiceOccurrences)
    .where(and(...conditions));

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

// ==================== OCCURRENCE DETAIL ====================

export type OccurrenceDetail = {
  id: string;
  clientServiceId: string;
  siteId: string;
  siteNom: string | null;
  executionId: string | null;
  prestataireNom: string | null;
  dateDebutPrevue: Date | null;
  dateFinPrevue: Date | null;
  dateDebutReelle: Date | null;
  dateFinReelle: Date | null;
  statut: "planifiee" | "en_cours" | "terminee" | "non_honoree" | "annulee";
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TachePieceJointe = {
  linkId: string;
  documentId: string;
  storageKey: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
};

export type OccurrenceTacheDetail = {
  id: string;
  occurrenceId: string;
  listeItemId: string | null;
  ordre: number;
  titre: string;
  description: string | null;
  statut: "a_faire" | "en_cours" | "terminee" | "non_honoree" | "non_applicable" | "annulee";
  notes: string | null;
  startedAt: Date | null;
  doneAt: Date | null;
  piecesJointes: TachePieceJointe[];
};

/**
 * Récupère le détail d'une occurrence (avec site + prestataire) pour la page de détail.
 */
export async function getOccurrenceWithDetailsById(
  occurrenceId: string,
): Promise<OccurrenceDetail | null> {
  const [row] = await db
    .select({
      id: clientServiceOccurrences.id,
      clientServiceId: clientServiceOccurrences.clientServiceId,
      siteId: clientServiceOccurrences.siteId,
      siteNom: sites.nom,
      executionId: clientServiceOccurrences.executionId,
      prestataireNom: entreprises.nom,
      dateDebutPrevue: clientServiceOccurrences.dateDebutPrevue,
      dateFinPrevue: clientServiceOccurrences.dateFinPrevue,
      dateDebutReelle: clientServiceOccurrences.dateDebutReelle,
      dateFinReelle: clientServiceOccurrences.dateFinReelle,
      statut: clientServiceOccurrences.statut,
      notes: clientServiceOccurrences.notes,
      createdAt: clientServiceOccurrences.createdAt,
      updatedAt: clientServiceOccurrences.updatedAt,
    })
    .from(clientServiceOccurrences)
    .leftJoin(sites, eq(sites.id, clientServiceOccurrences.siteId))
    .leftJoin(
      clientServiceExecutions,
      eq(clientServiceExecutions.id, clientServiceOccurrences.executionId),
    )
    .leftJoin(
      serviceEntreprises,
      eq(serviceEntreprises.id, clientServiceExecutions.serviceEntrepriseId),
    )
    .leftJoin(entreprises, eq(entreprises.id, serviceEntreprises.entrepriseId))
    .where(eq(clientServiceOccurrences.id, occurrenceId))
    .limit(1);

  return (row as OccurrenceDetail | undefined) ?? null;
}

/**
 * Récupère les tâches d'une occurrence (ordonnées) avec leurs pièces jointes.
 */
export async function getOccurrenceTaches(
  occurrenceId: string,
): Promise<OccurrenceTacheDetail[]> {
  const rows = await db
    .select({
      id: occurrenceTaches.id,
      occurrenceId: occurrenceTaches.occurrenceId,
      listeItemId: occurrenceTaches.listeItemId,
      ordre: occurrenceTaches.ordre,
      titre: occurrenceTaches.titre,
      description: occurrenceTaches.description,
      statut: occurrenceTaches.statut,
      notes: occurrenceTaches.notes,
      startedAt: occurrenceTaches.startedAt,
      doneAt: occurrenceTaches.doneAt,
    })
    .from(occurrenceTaches)
    .where(eq(occurrenceTaches.occurrenceId, occurrenceId))
    .orderBy(asc(occurrenceTaches.ordre));

  if (rows.length === 0) return [];

  // Charger les PJs de toutes les tâches en une seule requête
  const tacheIds = rows.map((r) => r.id);
  const pjRows = await db
    .select({
      tacheId: documentsLinks.occurrenceTacheId,
      linkId: documentsLinks.id,
      documentId: documents.id,
      storageKey: documents.storageKey,
      filename: documents.filename,
      mimeType: documents.mimeType,
      sizeBytes: documents.sizeBytes,
    })
    .from(documentsLinks)
    .innerJoin(documents, eq(documents.id, documentsLinks.documentId))
    .where(inArray(documentsLinks.occurrenceTacheId, tacheIds));

  // Grouper par tacheId
  const pjByTacheId = new Map<string, TachePieceJointe[]>();
  for (const pj of pjRows) {
    if (!pj.tacheId) continue;
    if (!pjByTacheId.has(pj.tacheId)) pjByTacheId.set(pj.tacheId, []);
    pjByTacheId.get(pj.tacheId)!.push({
      linkId: pj.linkId,
      documentId: pj.documentId,
      storageKey: pj.storageKey,
      filename: pj.filename,
      mimeType: pj.mimeType,
      sizeBytes: pj.sizeBytes,
    });
  }

  return rows.map((row) => ({
    ...row,
    piecesJointes: pjByTacheId.get(row.id) ?? [],
  }));
}
