import "server-only";

import { db } from "@/db";
import { documents, documentsLinks } from "@/db/schema/documents";
import { entreprises, serviceEntreprises } from "@/db/schema/entreprises";
import {
  clientServiceExecutions,
  clientServiceOccurrences,
  clientServices,
  occurrenceFieldLinks,
  occurrenceFieldSessions,
  occurrenceTaches,
  services,
} from "@/db/schema/services";
import { sites } from "@/db/schema/sites";
import type {
  OccurrenceStatutType,
  OccurrenceTacheStatutType,
} from "@/zod-schemas/enums";
import { and, asc, eq, gt, inArray, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TerrainOccurrenceType = {
  id: string;
  serviceNom: string;
  prestataireNom: string | null;
  clientNom: string;
  clientEntrepriseId: string;
  siteNom: string;
  siteAdresse: string;
  dateDebutPrevue: Date | null;
  dateFinPrevue: Date | null;
  statut: OccurrenceStatutType;
  notes: string | null;
  startedByFieldSessionId: string | null;
  startedByNom: string | null;
  doneByFieldSessionId: string | null;
};

export type TerrainTachePjType = {
  linkId: string;
  documentId: string;
  storageKey: string;
  filename: string;
};

export type TerrainTacheType = {
  id: string;
  ordre: number;
  titre: string;
  description: string | null;
  emoji: string | null;
  statut: OccurrenceTacheStatutType;
  assigneeNom: string | null;
  completeeParNom: string | null;
  startedAt: Date | null;
  doneAt: Date | null;
  piecesJointes: TerrainTachePjType[];
};

export type TerrainDataType = {
  linkId: string;
  occurrenceId: string;
  clientEntrepriseId: string;
  occurrence: TerrainOccurrenceType;
  taches: TerrainTacheType[];
};

// ---------------------------------------------------------------------------
// Query
// ---------------------------------------------------------------------------

export async function getTerrainDataByToken(
  token: string,
): Promise<TerrainDataType | null> {
  const now = new Date();

  const clientEntreprise = alias(entreprises, "client_entreprise");
  const prestataireEntreprise = alias(entreprises, "prestataire_entreprise");
  const startedBySession = alias(occurrenceFieldSessions, "started_by_session");

  const [row] = await db
    .select({
      linkId: occurrenceFieldLinks.id,
      occurrenceId: clientServiceOccurrences.id,
      clientEntrepriseId: clientServices.entrepriseId,
      clientNom: clientEntreprise.nom,
      serviceNom: services.nom,
      prestataireNom: prestataireEntreprise.nom,
      siteNom: sites.nom,
      siteAdresseLigne1: sites.adresseLigne1,
      siteCodePostal: sites.codePostal,
      siteVille: sites.ville,
      statut: clientServiceOccurrences.statut,
      dateDebutPrevue: clientServiceOccurrences.dateDebutPrevue,
      dateFinPrevue: clientServiceOccurrences.dateFinPrevue,
      notes: clientServiceOccurrences.notes,
      startedByFieldSessionId: clientServiceOccurrences.startedByFieldSessionId,
      startedByNom: startedBySession.assigneeNom,
      doneByFieldSessionId: clientServiceOccurrences.doneByFieldSessionId,
    })
    .from(occurrenceFieldLinks)
    .innerJoin(
      clientServiceOccurrences,
      eq(clientServiceOccurrences.id, occurrenceFieldLinks.occurrenceId),
    )
    .innerJoin(
      clientServices,
      eq(clientServices.id, clientServiceOccurrences.clientServiceId),
    )
    .innerJoin(services, eq(services.id, clientServices.serviceId))
    .innerJoin(
      clientEntreprise,
      eq(clientEntreprise.id, clientServices.entrepriseId),
    )
    .leftJoin(sites, eq(sites.id, clientServiceOccurrences.siteId))
    .leftJoin(
      clientServiceExecutions,
      eq(clientServiceExecutions.id, clientServiceOccurrences.executionId),
    )
    .leftJoin(
      serviceEntreprises,
      eq(serviceEntreprises.id, clientServiceExecutions.serviceEntrepriseId),
    )
    .leftJoin(
      prestataireEntreprise,
      eq(prestataireEntreprise.id, serviceEntreprises.entrepriseId),
    )
    .leftJoin(
      startedBySession,
      eq(
        startedBySession.id,
        clientServiceOccurrences.startedByFieldSessionId,
      ),
    )
    .where(
      and(
        eq(occurrenceFieldLinks.token, token),
        isNull(occurrenceFieldLinks.revokedAt),
        gt(occurrenceFieldLinks.expiresAt, now),
      ),
    )
    .limit(1);

  if (!row) return null;

  // ── Tâches ────────────────────────────────────────────────────────────────
  const tacheRows = await db
    .select({
      id: occurrenceTaches.id,
      ordre: occurrenceTaches.ordre,
      titre: occurrenceTaches.titre,
      description: occurrenceTaches.description,
      emoji: occurrenceTaches.emoji,
      statut: occurrenceTaches.statut,
      assigneeNom: occurrenceTaches.assigneeNom,
      completeeParNom: occurrenceTaches.completeeParNom,
      startedAt: occurrenceTaches.startedAt,
      doneAt: occurrenceTaches.doneAt,
    })
    .from(occurrenceTaches)
    .where(eq(occurrenceTaches.occurrenceId, row.occurrenceId))
    .orderBy(asc(occurrenceTaches.ordre));

  // ── Pièces jointes ────────────────────────────────────────────────────────
  const pjByTacheId = new Map<string, TerrainTachePjType[]>();
  if (tacheRows.length > 0) {
    const tacheIds = tacheRows.map((t) => t.id);
    const pjRows = await db
      .select({
        tacheId: documentsLinks.occurrenceTacheId,
        linkId: documentsLinks.id,
        documentId: documents.id,
        storageKey: documents.storageKey,
        filename: documents.filename,
      })
      .from(documentsLinks)
      .innerJoin(documents, eq(documents.id, documentsLinks.documentId))
      .where(inArray(documentsLinks.occurrenceTacheId, tacheIds));

    for (const pj of pjRows) {
      if (!pj.tacheId) continue;
      const list = pjByTacheId.get(pj.tacheId) ?? [];
      list.push({
        linkId: pj.linkId,
        documentId: pj.documentId,
        storageKey: pj.storageKey,
        filename: pj.filename,
      });
      pjByTacheId.set(pj.tacheId, list);
    }
  }

  const taches: TerrainTacheType[] = tacheRows.map((t) => ({
    id: t.id,
    ordre: t.ordre,
    titre: t.titre,
    description: t.description,
    emoji: t.emoji,
    statut: t.statut,
    assigneeNom: t.assigneeNom,
    completeeParNom: t.completeeParNom,
    startedAt: t.startedAt,
    doneAt: t.doneAt,
    piecesJointes: pjByTacheId.get(t.id) ?? [],
  }));

  return {
    linkId: row.linkId,
    occurrenceId: row.occurrenceId,
    clientEntrepriseId: row.clientEntrepriseId,
    occurrence: {
      id: row.occurrenceId,
      serviceNom: row.serviceNom,
      prestataireNom: row.prestataireNom ?? null,
      clientNom: row.clientNom,
      clientEntrepriseId: row.clientEntrepriseId,
      siteNom: row.siteNom ?? "",
      siteAdresse: [row.siteAdresseLigne1, row.siteCodePostal, row.siteVille]
        .filter(Boolean)
        .join(", "),
      dateDebutPrevue: row.dateDebutPrevue,
      dateFinPrevue: row.dateFinPrevue,
      statut: row.statut,
      notes: row.notes,
      startedByFieldSessionId: row.startedByFieldSessionId ?? null,
      startedByNom: row.startedByNom ?? null,
      doneByFieldSessionId: row.doneByFieldSessionId ?? null,
    },
    taches,
  };
}
