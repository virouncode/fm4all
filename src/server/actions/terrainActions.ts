"use server";

import { db } from "@/db";
import { documents, documentsLinks } from "@/db/schema/documents";
import {
  clientServiceOccurrences,
  clientServices,
  occurrenceFieldLinks,
  occurrenceFieldSessions,
  occurrenceTaches,
} from "@/db/schema/services";
import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { pusherServer } from "@/lib/pusher";
import { promoteS3Key } from "@/server/s3/s3";
import {
  addTachePieceJointeFieldSchema,
  openTerrainSessionSchema,
  startOccurrenceFieldSchema,
  terminateOccurrenceFieldSchema,
  updateTacheFieldSchema,
} from "@/zod-schemas/terrain.schema";
import { and, eq, gt, isNull } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { headers } from "next/headers";

// ---------------------------------------------------------------------------
// Helper — valide le token et retourne linkId + occurrenceId + clientEntrepriseId
// ---------------------------------------------------------------------------

async function validateToken(token: string) {
  const now = new Date();
  const [row] = await db
    .select({
      linkId: occurrenceFieldLinks.id,
      occurrenceId: occurrenceFieldLinks.occurrenceId,
      clientEntrepriseId: clientServices.entrepriseId,
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
    .where(
      and(
        eq(occurrenceFieldLinks.token, token),
        isNull(occurrenceFieldLinks.revokedAt),
        gt(occurrenceFieldLinks.expiresAt, now),
      ),
    )
    .limit(1);

  if (!row) throw errors.forbidden("Lien terrain invalide ou expiré.");
  return row;
}

// ---------------------------------------------------------------------------
// Helper — valide que la session appartient bien au lien
// ---------------------------------------------------------------------------

async function validateSession(sessionId: string, linkId: string) {
  const [session] = await db
    .select({
      id: occurrenceFieldSessions.id,
      assigneeNom: occurrenceFieldSessions.assigneeNom,
    })
    .from(occurrenceFieldSessions)
    .where(
      and(
        eq(occurrenceFieldSessions.id, sessionId),
        eq(occurrenceFieldSessions.fieldLinkId, linkId),
      ),
    )
    .limit(1);

  if (!session) throw errors.forbidden("Session terrain invalide.");
  return session;
}

// ---------------------------------------------------------------------------
// Action — Ouvrir une session terrain (créer ou récupérer)
// ---------------------------------------------------------------------------

export const openTerrainSessionAction = actionClient
  .metadata({ actionName: "openTerrainSessionAction" })
  .inputSchema(openTerrainSessionSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const { token, agentNom } = parsedInput;
    const { linkId, occurrenceId } = await validateToken(token);

    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? null;
    const userAgent = headersList.get("user-agent") ?? null;

    const [session] = await db
      .insert(occurrenceFieldSessions)
      .values({
        fieldLinkId: linkId,
        assigneeNom: agentNom.trim(),
        startedAt: new Date(),
        ip,
        userAgent,
      })
      .returning({ id: occurrenceFieldSessions.id });

    if (!session) throw new Error("Échec création session.");

    return { sessionId: session.id, occurrenceId, linkId };
  });

// ---------------------------------------------------------------------------
// Action — Démarrer l'intervention (occurrence planifiee → en_cours)
// ---------------------------------------------------------------------------

export const startOccurrenceFieldAction = actionClient
  .metadata({ actionName: "startOccurrenceFieldAction" })
  .inputSchema(startOccurrenceFieldSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const { token, sessionId } = parsedInput;
    const { linkId, occurrenceId } = await validateToken(token);
    const session = await validateSession(sessionId, linkId);

    await db
      .update(clientServiceOccurrences)
      .set({
        statut: "en_cours",
        startedByFieldSessionId: sessionId,
        assigneeNom: session.assigneeNom,
        dateDebutReelle: new Date(),
      })
      .where(
        and(
          eq(clientServiceOccurrences.id, occurrenceId),
          eq(clientServiceOccurrences.statut, "planifiee"),
        ),
      );

    await pusherServer.trigger(`terrain-${occurrenceId}`, "occurrence-updated", {
      statut: "en_cours",
      startedByNom: session.assigneeNom,
    });

    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Action — Mettre à jour le statut d'une tâche
// ---------------------------------------------------------------------------

export const updateTacheFieldAction = actionClient
  .metadata({ actionName: "updateTacheFieldAction" })
  .inputSchema(updateTacheFieldSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const { token, tacheId, statut, sessionId } = parsedInput;
    const { linkId, occurrenceId } = await validateToken(token);
    const session = await validateSession(sessionId, linkId);

    const now = new Date();
    const isTerminal =
      statut === "terminee" ||
      statut === "non_honoree" ||
      statut === "non_applicable" ||
      statut === "annulee";

    const updateValues: Partial<typeof occurrenceTaches.$inferInsert> = {
      statut,
    };

    if (statut === "en_cours") {
      updateValues.assigneeNom = session.assigneeNom;
      updateValues.startedAt = now;
      updateValues.startedByFieldSessionId = sessionId;
    } else if (isTerminal) {
      updateValues.completeeParNom = session.assigneeNom;
      updateValues.doneAt = now;
      updateValues.doneByFieldSessionId = sessionId;
    }

    // Vérification que la tâche appartient bien à cette occurrence
    const [tache] = await db
      .select({ id: occurrenceTaches.id, assigneeNom: occurrenceTaches.assigneeNom, completeeParNom: occurrenceTaches.completeeParNom })
      .from(occurrenceTaches)
      .where(
        and(
          eq(occurrenceTaches.id, tacheId),
          eq(occurrenceTaches.occurrenceId, occurrenceId),
        ),
      )
      .limit(1);

    if (!tache) throw errors.forbidden("Tâche introuvable pour cette intervention.");

    await db
      .update(occurrenceTaches)
      .set(updateValues)
      .where(eq(occurrenceTaches.id, tacheId));

    await pusherServer.trigger(`terrain-${occurrenceId}`, "tache-updated", {
      tacheId,
      statut,
      assigneeNom: statut === "en_cours" ? session.assigneeNom : tache.assigneeNom,
      completeeParNom: isTerminal ? session.assigneeNom : tache.completeeParNom,
    });

    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Action — Terminer l'intervention (occurrence → terminee)
// ---------------------------------------------------------------------------

export const terminateOccurrenceFieldAction = actionClient
  .metadata({ actionName: "terminateOccurrenceFieldAction" })
  .inputSchema(terminateOccurrenceFieldSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const { token, sessionId } = parsedInput;
    const { linkId, occurrenceId } = await validateToken(token);
    const session = await validateSession(sessionId, linkId);

    const now = new Date();

    await db
      .update(clientServiceOccurrences)
      .set({
        statut: "terminee",
        doneByFieldSessionId: sessionId,
        dateFinReelle: now,
      })
      .where(eq(clientServiceOccurrences.id, occurrenceId));

    // Clore la session
    await db
      .update(occurrenceFieldSessions)
      .set({ endedAt: now })
      .where(eq(occurrenceFieldSessions.id, sessionId));

    await pusherServer.trigger(`terrain-${occurrenceId}`, "occurrence-updated", {
      statut: "terminee",
      startedByNom: session.assigneeNom,
    });

    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Action — Ajouter une pièce jointe à une tâche
// ---------------------------------------------------------------------------

export const addTachePieceJointeFieldAction = actionClient
  .metadata({ actionName: "addTachePieceJointeFieldAction" })
  .inputSchema(addTachePieceJointeFieldSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const { token, tacheId, storageKey, filename, mimeType, sizeBytes } =
      parsedInput;
    const { occurrenceId, clientEntrepriseId } = await validateToken(token);

    // Vérifier que la tâche appartient à cette occurrence
    const [tache] = await db
      .select({ id: occurrenceTaches.id })
      .from(occurrenceTaches)
      .where(
        and(
          eq(occurrenceTaches.id, tacheId),
          eq(occurrenceTaches.occurrenceId, occurrenceId),
        ),
      )
      .limit(1);

    if (!tache) throw errors.forbidden("Tâche introuvable pour cette intervention.");

    // Promouvoir le fichier temp → permanent
    const permanentKey = await promoteS3Key({ tempKey: storageKey });

    // Créer le document et le lien en transaction
    const result = await db.transaction(async (tx) => {
      const [doc] = await tx
        .insert(documents)
        .values({
          proprietaireEntrepriseId: clientEntrepriseId,
          categorie: "tache_piece_jointe",
          storageProvider: "s3",
          storageKey: permanentKey,
          filename,
          mimeType,
          sizeBytes,
        })
        .returning({ id: documents.id });

      if (!doc) throw new Error("Échec création document.");

      const [link] = await tx
        .insert(documentsLinks)
        .values({
          proprietaireEntrepriseId: clientEntrepriseId,
          documentId: doc.id,
          occurrenceTacheId: tacheId,
        })
        .returning({ id: documentsLinks.id });

      if (!link) throw new Error("Échec création lien document.");

      return { documentId: doc.id, linkId: link.id };
    });

    await pusherServer.trigger(`terrain-${occurrenceId}`, "piece-jointe-added", {
      tacheId,
      linkId: result.linkId,
      documentId: result.documentId,
      storageKey: permanentKey,
      filename,
    });

    return { ok: true, documentId: result.documentId, linkId: result.linkId };
  });
