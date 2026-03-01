"use server";

import { db } from "@/db";
import { documents, documentsLinks } from "@/db/schema/documents";
import { clientServiceOccurrences, occurrenceTaches } from "@/db/schema/services";
import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import { getPrestationById } from "@/server/queries/clientServices.query";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import { resolveUserEffectiveRoleOnSite } from "@/server/utils/userSiteAttributions.utils";
import {
  countFilteredOccurrencesByPrestationId,
  getOccurrencesByPrestationId,
} from "@/server/queries/clientServiceExecutions.query";
import { getUserAdhesion } from "@/server/queries/userAdhesions.query";
import { promoteS3Key, s3, S3_BUCKET } from "@/server/s3/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { and, asc, count, eq } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { z } from "zod";

// ==================== HELPERS ====================

// Contrôle total : plateforme OU responsable_site (annulation, non-honorée, etc.)
async function canManagePrestation(
  userId: string,
  entrepriseId: string,
  siteId: string,
): Promise<boolean> {
  const platformRole = await getUserPlateformeAdhesion(userId);
  if (platformRole?.role) return true;

  const siteRole = await resolveUserEffectiveRoleOnSite({
    userId,
    siteId,
    entrepriseId,
  });
  return siteRole === "responsable_site";
}

// Interaction terrain : plateforme OU responsable_site OU intervenant_site (démarrer, terminer, tâches)
async function canInteractWithPrestation(
  userId: string,
  entrepriseId: string,
  siteId: string,
): Promise<boolean> {
  const platformRole = await getUserPlateformeAdhesion(userId);
  if (platformRole?.role) return true;

  const siteRole = await resolveUserEffectiveRoleOnSite({
    userId,
    siteId,
    entrepriseId,
  });
  return siteRole === "responsable_site" || siteRole === "intervenant_site";
}

// Transitions autorisées par statut courant
const OCCURRENCE_TRANSITIONS: Record<
  string,
  readonly ("en_cours" | "terminee" | "non_honoree" | "annulee")[]
> = {
  planifiee: ["en_cours", "annulee"],
  en_cours: ["terminee", "non_honoree", "annulee"],
};

// ==================== UPDATE OCCURRENCE STATUT ====================

export const updateOccurrenceStatutAction = actionClient
  .metadata({ actionName: "updateOccurrenceStatutAction" })
  .inputSchema(
    z.object({
      occurrenceId: z.string().uuid("ID de l'occurrence invalide"),
      prestationId: z.string().uuid("ID de la prestation invalide"),
      entrepriseId: z.string().uuid("ID de l'entreprise invalide"),
      statut: z.enum(["en_cours", "terminee", "non_honoree", "annulee"]),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { occurrenceId, prestationId, entrepriseId, statut: newStatut } =
      parsedInput;

    // Charger la prestation pour obtenir le siteId + vérifier appartenance
    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    // Vérifier les permissions selon le type de transition
    // annulee / non_honoree = décision managériale → canManage requis
    // en_cours / terminee   = travail terrain → canInteract suffit
    const isManagementTransition = newStatut === "annulee" || newStatut === "non_honoree";

    if (isManagementTransition) {
      const canManage = await canManagePrestation(
        currentUser.id,
        entrepriseId,
        prestation.siteId,
      );
      if (!canManage) {
        throw errors.forbidden(
          "Vous devez être responsable de ce site pour annuler ou marquer une intervention comme non honorée.",
        );
      }
    } else {
      const canInteract = await canInteractWithPrestation(
        currentUser.id,
        entrepriseId,
        prestation.siteId,
      );
      if (!canInteract) {
        throw errors.forbidden(
          "Vous devez être responsable ou intervenant de ce site pour modifier le statut d'une intervention.",
        );
      }
    }

    // Charger l'occurrence
    const [occurrence] = await db
      .select()
      .from(clientServiceOccurrences)
      .where(
        and(
          eq(clientServiceOccurrences.id, occurrenceId),
          eq(clientServiceOccurrences.clientServiceId, prestationId),
        ),
      )
      .limit(1);

    if (!occurrence) {
      throw errors.notFound("Intervention");
    }

    // Vérifier la transition
    const allowedTransitions = OCCURRENCE_TRANSITIONS[occurrence.statut] ?? [];
    if (!allowedTransitions.includes(newStatut)) {
      throw errors.conflict(
        `Transition invalide : ${occurrence.statut} → ${newStatut}.`,
      );
    }

    // RÈGLE CRITIQUE : bloquer le démarrage si aucune exécution assignée
    if (newStatut === "en_cours" && !occurrence.executionId) {
      throw errors.conflict(
        "Aucun prestataire assigné à cette intervention. Attribuez un prestataire actif avant de démarrer.",
      );
    }

    // RÈGLE CLÔTURE : toutes les tâches doivent être terminée ou non_applicable
    if (newStatut === "terminee") {
      const tasks = await db
        .select({ statut: occurrenceTaches.statut })
        .from(occurrenceTaches)
        .where(eq(occurrenceTaches.occurrenceId, occurrenceId));

      if (tasks.length > 0) {
        const allDone = tasks.every(
          (t) => t.statut === "terminee" || t.statut === "non_applicable",
        );
        if (!allDone) {
          throw errors.conflict(
            "Toutes les tâches doivent être terminées ou non applicables avant de clôturer l'intervention.",
          );
        }
      }
    }

    // Mettre à jour le statut
    const [updated] = await db
      .update(clientServiceOccurrences)
      .set({
        statut: newStatut,
        updatedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(clientServiceOccurrences.id, occurrenceId))
      .returning();

    if (!updated) {
      throw errors.internal("Échec de la mise à jour du statut.");
    }

    return {
      message: `Statut mis à jour : ${occurrence.statut} → ${newStatut}.`,
      occurrence: updated,
    };
  });

// ==================== GET OCCURRENCES PAGE ====================

export const getOccurrencesPageAction = actionClient
  .metadata({ actionName: "getOccurrencesPageAction" })
  .inputSchema(
    z.object({
      prestationId: z.string().uuid(),
      entrepriseId: z.string().uuid(),
      offset: z.number().int().min(0),
      limit: z.number().int().min(1).max(100).default(50),
      statut: z
        .enum(["planifiee", "en_cours", "terminee", "non_honoree", "annulee"])
        .optional(),
      nonAssignedOnly: z.boolean().optional(),
      siteId: z.string().uuid().optional(),
      sortDir: z.enum(["asc", "desc"]).optional(),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { prestationId, entrepriseId, offset, limit, statut, nonAssignedOnly, siteId, sortDir } =
      parsedInput;

    // Vérifier l'accès à l'entreprise (plateforme OU adhésion)
    const platformRole = await getUserPlateformeAdhesion(currentUser.id);
    if (!platformRole?.role) {
      const adhesion = await getUserAdhesion({
        userId: currentUser.id,
        entrepriseId,
      });
      if (!adhesion) {
        throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
      }
    }

    const [occurrences, filteredTotal] = await Promise.all([
      getOccurrencesByPrestationId(prestationId, {
        offset,
        limit,
        statut,
        nonAssignedOnly,
        siteId,
        sortDir,
      }),
      // Count seulement pour la première page (offset=0 = filtre/tri changé)
      offset === 0
        ? countFilteredOccurrencesByPrestationId(prestationId, {
            statut,
            nonAssignedOnly,
            siteId,
          })
        : Promise.resolve(undefined),
    ]);

    return { occurrences, filteredTotal };
  });

// ==================== GET OCCURRENCE TACHES ====================

export const getOccurrenceTachesAction = actionClient
  .metadata({ actionName: "getOccurrenceTachesAction" })
  .inputSchema(
    z.object({
      occurrenceId: z.string().uuid("ID de l'occurrence invalide"),
      prestationId: z.string().uuid("ID de la prestation invalide"),
      entrepriseId: z.string().uuid("ID de l'entreprise invalide"),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { occurrenceId, prestationId, entrepriseId } = parsedInput;

    // Vérifier accès à l'entreprise (plateforme OU adhésion)
    const platformRole = await getUserPlateformeAdhesion(currentUser.id);
    if (!platformRole?.role) {
      const adhesion = await getUserAdhesion({
        userId: currentUser.id,
        entrepriseId,
      });
      if (!adhesion) {
        throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
      }
    }

    // Vérifier que l'occurrence appartient à la prestation
    const [occurrence] = await db
      .select({ id: clientServiceOccurrences.id })
      .from(clientServiceOccurrences)
      .where(
        and(
          eq(clientServiceOccurrences.id, occurrenceId),
          eq(clientServiceOccurrences.clientServiceId, prestationId),
        ),
      )
      .limit(1);

    if (!occurrence) throw errors.notFound("Intervention");

    const taches = await db
      .select()
      .from(occurrenceTaches)
      .where(eq(occurrenceTaches.occurrenceId, occurrenceId))
      .orderBy(asc(occurrenceTaches.ordre));

    return { taches };
  });

// ==================== UPDATE OCCURRENCE DATES ====================

export const updateOccurrenceDatesAction = actionClient
  .metadata({ actionName: "updateOccurrenceDatesAction" })
  .inputSchema(
    z.object({
      occurrenceId: z.string().uuid("ID de l'occurrence invalide"),
      prestationId: z.string().uuid("ID de la prestation invalide"),
      entrepriseId: z.string().uuid("ID de l'entreprise invalide"),
      dateDebutPrevue: z.string().nullable(),
      dateFinPrevue: z.string().nullable(),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { occurrenceId, prestationId, entrepriseId, dateDebutPrevue, dateFinPrevue } =
      parsedInput;

    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    const canManage = await canManagePrestation(
      currentUser.id,
      entrepriseId,
      prestation.siteId,
    );
    if (!canManage) {
      throw errors.forbidden(
        "Vous devez être responsable de ce site pour modifier les dates d'une intervention.",
      );
    }

    const [occurrence] = await db
      .select({ id: clientServiceOccurrences.id, statut: clientServiceOccurrences.statut })
      .from(clientServiceOccurrences)
      .where(
        and(
          eq(clientServiceOccurrences.id, occurrenceId),
          eq(clientServiceOccurrences.clientServiceId, prestationId),
        ),
      )
      .limit(1);

    if (!occurrence) throw errors.notFound("Intervention");

    if (
      occurrence.statut === "terminee" ||
      occurrence.statut === "annulee" ||
      occurrence.statut === "non_honoree"
    ) {
      throw errors.conflict(
        "Impossible de modifier les dates d'une intervention terminée, annulée ou non honorée.",
      );
    }

    const [updated] = await db
      .update(clientServiceOccurrences)
      .set({
        dateDebutPrevue: dateDebutPrevue ? new Date(dateDebutPrevue) : null,
        dateFinPrevue: dateFinPrevue ? new Date(dateFinPrevue) : null,
        updatedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(clientServiceOccurrences.id, occurrenceId))
      .returning();

    if (!updated) throw errors.internal("Échec de la mise à jour des dates.");

    return {
      dateDebutPrevue: updated.dateDebutPrevue,
      dateFinPrevue: updated.dateFinPrevue,
    };
  });

// ==================== UPDATE OCCURRENCE TACHE STATUT ====================

// Transitions autorisées par statut courant pour les tâches
const TACHE_TRANSITIONS: Record<
  string,
  readonly ("en_cours" | "terminee" | "non_honoree" | "non_applicable" | "annulee")[]
> = {
  a_faire: ["en_cours", "non_applicable", "annulee"],
  en_cours: ["terminee", "non_honoree", "non_applicable", "annulee"],
};

export const updateOccurrenceTacheStatutAction = actionClient
  .metadata({ actionName: "updateOccurrenceTacheStatutAction" })
  .inputSchema(
    z.object({
      tacheId: z.string().uuid("ID de la tâche invalide"),
      occurrenceId: z.string().uuid("ID de l'occurrence invalide"),
      prestationId: z.string().uuid("ID de la prestation invalide"),
      entrepriseId: z.string().uuid("ID de l'entreprise invalide"),
      statut: z.enum(["en_cours", "terminee", "non_honoree", "non_applicable", "annulee"]),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { tacheId, occurrenceId, prestationId, entrepriseId, statut: newStatut } =
      parsedInput;

    // Vérifier permissions selon le type de transition
    // non_honoree / annulee = décision managériale → canManage requis
    // en_cours / terminee / non_applicable = travail terrain → canInteract suffit
    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    const isManagementTransition = newStatut === "non_honoree" || newStatut === "annulee";

    if (isManagementTransition) {
      const canManage = await canManagePrestation(
        currentUser.id,
        entrepriseId,
        prestation.siteId,
      );
      if (!canManage) {
        throw errors.forbidden(
          "Vous devez être responsable de ce site pour marquer une tâche comme non honorée ou l'annuler.",
        );
      }
    } else {
      const canInteract = await canInteractWithPrestation(
        currentUser.id,
        entrepriseId,
        prestation.siteId,
      );
      if (!canInteract) {
        throw errors.forbidden(
          "Vous devez être responsable ou intervenant de ce site pour modifier le statut d'une tâche.",
        );
      }
    }

    // Charger la tâche (avec vérification que l'occurrence correspond)
    const [tache] = await db
      .select()
      .from(occurrenceTaches)
      .where(
        and(
          eq(occurrenceTaches.id, tacheId),
          eq(occurrenceTaches.occurrenceId, occurrenceId),
        ),
      )
      .limit(1);

    if (!tache) throw errors.notFound("Tâche");

    // Vérifier la transition
    const allowedTransitions = TACHE_TRANSITIONS[tache.statut] ?? [];
    if (!allowedTransitions.includes(newStatut)) {
      throw errors.conflict(
        `Transition invalide : ${tache.statut} → ${newStatut}.`,
      );
    }

    // Guard : une tâche ne peut démarrer que si l'intervention est elle-même en cours
    if (newStatut === "en_cours") {
      const [occRow] = await db
        .select({ statut: clientServiceOccurrences.statut })
        .from(clientServiceOccurrences)
        .where(eq(clientServiceOccurrences.id, occurrenceId))
        .limit(1);

      if (!occRow || occRow.statut !== "en_cours") {
        throw errors.conflict(
          "Impossible de démarrer une tâche : l'intervention n'est pas encore démarrée.",
        );
      }
    }

    const now = new Date();
    const updateData: Partial<typeof occurrenceTaches.$inferInsert> = {
      statut: newStatut,
      updatedById: currentUser.id,
      updatedAt: now,
    };

    if (newStatut === "en_cours" && !tache.startedAt) {
      updateData.startedAt = now;
    }
    if (newStatut === "terminee" || newStatut === "non_honoree") {
      updateData.doneAt = now;
      updateData.completeeParUserId = currentUser.id;
    }

    const [updated] = await db
      .update(occurrenceTaches)
      .set(updateData)
      .where(eq(occurrenceTaches.id, tacheId))
      .returning();

    if (!updated) throw errors.internal("Échec de la mise à jour de la tâche.");

    return { tache: updated };
  });

// ==================== TACHE PIECE JOINTE — ADD ====================

export const addTachePieceJointeAction = actionClient
  .metadata({ actionName: "addTachePieceJointeAction" })
  .inputSchema(
    z.object({
      tacheId: z.string().uuid("ID de la tâche invalide"),
      occurrenceId: z.string().uuid("ID de l'occurrence invalide"),
      prestationId: z.string().uuid("ID de la prestation invalide"),
      entrepriseId: z.string().uuid("ID de l'entreprise invalide"),
      storageKey: z.string().min(1, "Clé S3 requise"),
      filename: z.string().min(1, "Nom de fichier requis"),
      mimeType: z.string().min(1, "Type MIME requis"),
      sizeBytes: z.number().int().positive("Taille invalide"),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { tacheId, occurrenceId, prestationId, entrepriseId, storageKey, filename, mimeType, sizeBytes } =
      parsedInput;

    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    const canInteract = await canInteractWithPrestation(
      currentUser.id,
      entrepriseId,
      prestation.siteId,
    );
    if (!canInteract) {
      throw errors.forbidden(
        "Vous devez être responsable ou intervenant de ce site pour ajouter une pièce jointe.",
      );
    }

    // Vérifier que la tâche existe, appartient à l'occurrence, et est en cours
    const [tache] = await db
      .select({ id: occurrenceTaches.id, statut: occurrenceTaches.statut })
      .from(occurrenceTaches)
      .where(
        and(
          eq(occurrenceTaches.id, tacheId),
          eq(occurrenceTaches.occurrenceId, occurrenceId),
        ),
      )
      .limit(1);

    if (!tache) throw errors.notFound("Tâche");

    if (tache.statut !== "en_cours") {
      throw errors.conflict(
        "Les pièces jointes ne peuvent être ajoutées que sur une tâche en cours.",
      );
    }

    // Vérifier la limite (max 2 PJs par tâche)
    const [{ nb }] = await db
      .select({ nb: count() })
      .from(documentsLinks)
      .where(eq(documentsLinks.occurrenceTacheId, tacheId));

    if (nb >= 2) {
      throw errors.conflict(
        "Maximum 2 pièces jointes par tâche.",
      );
    }

    // Transaction : promouvoir la clé S3 + insérer document + lien
    const pieceJointe = await db.transaction(async (tx) => {
      const promotedKey = await promoteS3Key({ tempKey: storageKey });

      const [doc] = await tx
        .insert(documents)
        .values({
          proprietaireEntrepriseId: entrepriseId,
          categorie: "tache_piece_jointe",
          storageProvider: "s3",
          storageKey: promotedKey,
          filename,
          mimeType,
          sizeBytes,
          createdById: currentUser.id,
        })
        .returning();

      const [link] = await tx
        .insert(documentsLinks)
        .values({
          documentId: doc.id,
          proprietaireEntrepriseId: entrepriseId,
          occurrenceTacheId: tacheId,
          visibilite: "public",
          createdById: currentUser.id,
          updatedById: currentUser.id,
        })
        .returning();

      return {
        linkId: link.id,
        documentId: doc.id,
        storageKey: doc.storageKey,
        filename: doc.filename,
        mimeType: doc.mimeType,
        sizeBytes: doc.sizeBytes,
      };
    });

    return { pieceJointe };
  });

// ==================== TACHE PIECE JOINTE — DELETE ====================

export const deleteTachePieceJointeAction = actionClient
  .metadata({ actionName: "deleteTachePieceJointeAction" })
  .inputSchema(
    z.object({
      linkId: z.string().uuid("ID du lien invalide"),
      documentId: z.string().uuid("ID du document invalide"),
      tacheId: z.string().uuid("ID de la tâche invalide"),
      occurrenceId: z.string().uuid("ID de l'occurrence invalide"),
      prestationId: z.string().uuid("ID de la prestation invalide"),
      entrepriseId: z.string().uuid("ID de l'entreprise invalide"),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { linkId, documentId, tacheId, occurrenceId, prestationId, entrepriseId } =
      parsedInput;

    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    const canInteract = await canInteractWithPrestation(
      currentUser.id,
      entrepriseId,
      prestation.siteId,
    );
    if (!canInteract) {
      throw errors.forbidden(
        "Vous devez être responsable ou intervenant de ce site pour supprimer une pièce jointe.",
      );
    }

    // Vérifier que la tâche existe et appartient à l'occurrence
    const [tache] = await db
      .select({ id: occurrenceTaches.id, statut: occurrenceTaches.statut })
      .from(occurrenceTaches)
      .where(
        and(
          eq(occurrenceTaches.id, tacheId),
          eq(occurrenceTaches.occurrenceId, occurrenceId),
        ),
      )
      .limit(1);

    if (!tache) throw errors.notFound("Tâche");

    // Vérifier que le lien appartient bien à cette tâche et récupérer la clé S3
    const [link] = await db
      .select({
        id: documentsLinks.id,
        storageKey: documents.storageKey,
      })
      .from(documentsLinks)
      .innerJoin(documents, eq(documents.id, documentsLinks.documentId))
      .where(
        and(
          eq(documentsLinks.id, linkId),
          eq(documentsLinks.occurrenceTacheId, tacheId),
          eq(documentsLinks.documentId, documentId),
        ),
      )
      .limit(1);

    if (!link) throw errors.notFound("Pièce jointe");

    // Supprimer le lien + document en transaction
    await db.transaction(async (tx) => {
      await tx.delete(documentsLinks).where(eq(documentsLinks.id, linkId));
      await tx.delete(documents).where(eq(documents.id, documentId));
    });

    // Supprimer le fichier S3 (hors transaction, best-effort)
    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: S3_BUCKET,
          Key: link.storageKey,
        }),
      );
    } catch {
      // Non bloquant : le fichier orphelin sera nettoyé par un job
    }

    return { deleted: true };
  });
