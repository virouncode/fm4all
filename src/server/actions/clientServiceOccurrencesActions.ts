"use server";

import { db } from "@/db";
import { documents, documentsLinks } from "@/db/schema/documents";
import { serviceEntreprises } from "@/db/schema/entreprises";
import {
  clientServiceExecutions,
  clientServiceOccurrences,
  occurrenceTaches,
} from "@/db/schema/services";
import { tickets } from "@/db/schema/tickets";
import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import {
  countFilteredOccurrencesByPrestationId,
  getOccurrencesByPrestationId,
  getOccurrenceWithDetailsById,
} from "@/server/queries/clientServiceExecutions.query";
import {
  getPrestationById,
  getPrestationWithJoinsById,
} from "@/server/queries/clientServices.query";
import { getUserClientAdhesion } from "@/server/queries/userAdhesions.query";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import { getUsersByEntrepriseId } from "@/server/queries/users.query";
import { promoteS3Key, s3, S3_BUCKET } from "@/server/s3/s3";
import {
  insertPrixAppliquesForOccurrence,
  pickExecutionForOccurrence,
  snapshotOccurrenceTaches,
} from "@/server/utils/clientServiceOccurrences.utils";
import { resolveUserEffectiveRoleOnSite } from "@/server/utils/userClientSiteAttributions.utils";
import {
  addTachePieceJointeSchema,
  deleteAdHocTacheSchema,
  deleteTachePieceJointeSchema,
  getAssignableUsersForOccurrenceSchema,
  getOccurrencesPageSchema,
  getOccurrenceTachesSchema,
  insertAdHocTacheSchema,
  insertOccurrenceOnDemandFormSchema,
  occurrenceTicketsSchema,
  ticketOccurrenceLinkSchema,
  updateAdHocTacheSchema,
  updateOccurrenceAssigneeSchema,
  updateOccurrenceDatesSchema,
  updateOccurrenceStatutSchema,
  updateOccurrenceTacheStatutSchema,
  updateTacheAssigneeSchema,
} from "@/zod-schemas/clientServiceOccurrences.schema";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import {
  and,
  asc,
  count,
  eq,
  gte,
  inArray,
  isNull,
  lte,
  max,
  or,
} from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";

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
  return siteRole === "responsable_site";
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
  .inputSchema(updateOccurrenceStatutSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const {
      occurrenceId,
      prestationId,
      entrepriseId,
      statut: newStatut,
    } = parsedInput;

    // Charger la prestation pour obtenir le siteId + vérifier appartenance
    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    // Vérifier les permissions selon le type de transition
    // annulee / non_honoree = décision managériale → canManage requis
    // en_cours / terminee   = travail terrain → canInteract suffit
    const isManagementTransition =
      newStatut === "annulee" || newStatut === "non_honoree";

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

    // RÈGLE CLÔTURE : aucune tâche ne doit encore être ouverte (a_faire ou en_cours)
    if (newStatut === "terminee") {
      const tasks = await db
        .select({ statut: occurrenceTaches.statut })
        .from(occurrenceTaches)
        .where(eq(occurrenceTaches.occurrenceId, occurrenceId));

      if (tasks.length > 0) {
        const hasOpenTask = tasks.some(
          (t) => t.statut === "a_faire" || t.statut === "en_cours",
        );
        if (hasOpenTask) {
          throw errors.conflict(
            "Des tâches sont encore ouvertes. Clôturez ou annulez toutes les tâches avant de terminer l'intervention.",
          );
        }
      }
    }

    // Mettre à jour le statut + snapshot de facturation dans la même transaction
    // (atomicité : si le snapshot échoue, l'occurrence ne passe pas à terminee)
    const now = new Date();
    const updated = await db.transaction(async (tx) => {
      const [row] = await tx
        .update(clientServiceOccurrences)
        .set({
          statut: newStatut,
          ...(newStatut === "en_cours" ? { dateDebutReelle: now } : {}),
          ...(newStatut === "terminee" || newStatut === "non_honoree"
            ? { dateFinReelle: now }
            : {}),
          updatedById: currentUser.id,
          updatedAt: now,
        })
        .where(eq(clientServiceOccurrences.id, occurrenceId))
        .returning();

      if (!row) {
        throw errors.internal("Échec de la mise à jour du statut.");
      }

      if (newStatut === "terminee") {
        await insertPrixAppliquesForOccurrence({ occurrenceId, tx });
      }

      return row;
    });

    return {
      message: `Statut mis à jour : ${occurrence.statut} → ${newStatut}.`,
      occurrence: updated,
    };
  });

// ==================== GET OCCURRENCES PAGE ====================

export const getOccurrencesPageAction = actionClient
  .metadata({ actionName: "getOccurrencesPageAction" })
  .inputSchema(getOccurrencesPageSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const {
      prestationId,
      entrepriseId,
      offset,
      limit,
      statut,
      nonAssignedOnly,
      siteId,
      sortDir,
    } = parsedInput;

    // Vérifier l'accès à l'entreprise (plateforme OU adhésion)
    const platformRole = await getUserPlateformeAdhesion(currentUser.id);
    if (!platformRole?.role) {
      const adhesion = await getUserClientAdhesion({
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
  .inputSchema(getOccurrenceTachesSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { occurrenceId, prestationId, entrepriseId } = parsedInput;

    // Vérifier accès à l'entreprise (plateforme OU adhésion)
    const platformRole = await getUserPlateformeAdhesion(currentUser.id);
    if (!platformRole?.role) {
      const adhesion = await getUserClientAdhesion({
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
  .inputSchema(updateOccurrenceDatesSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const {
      occurrenceId,
      prestationId,
      entrepriseId,
      dateDebutPrevue,
      dateFinPrevue,
    } = parsedInput;

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
      .select({
        id: clientServiceOccurrences.id,
        statut: clientServiceOccurrences.statut,
      })
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
  readonly (
    | "en_cours"
    | "terminee"
    | "non_honoree"
    | "non_applicable"
    | "annulee"
  )[]
> = {
  a_faire: ["en_cours", "non_applicable", "annulee"],
  en_cours: ["terminee", "non_honoree", "non_applicable", "annulee"],
};

export const updateOccurrenceTacheStatutAction = actionClient
  .metadata({ actionName: "updateOccurrenceTacheStatutAction" })
  .inputSchema(updateOccurrenceTacheStatutSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const {
      tacheId,
      occurrenceId,
      prestationId,
      entrepriseId,
      statut: newStatut,
    } = parsedInput;

    // Vérifier permissions selon le type de transition
    // non_honoree / annulee = décision managériale → canManage requis
    // en_cours / terminee / non_applicable = travail terrain → canInteract suffit
    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    const isManagementTransition =
      newStatut === "non_honoree" || newStatut === "annulee";

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
      if (tache.startedAt) {
        updateData.tempsPasseSecondes = Math.round(
          (now.getTime() - tache.startedAt.getTime()) / 1000,
        );
      }
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
  .inputSchema(addTachePieceJointeSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const {
      tacheId,
      occurrenceId,
      prestationId,
      entrepriseId,
      storageKey,
      filename,
      mimeType,
      sizeBytes,
    } = parsedInput;

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
      throw errors.conflict("Maximum 2 pièces jointes par tâche.");
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
  .inputSchema(deleteTachePieceJointeSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const {
      linkId,
      documentId,
      tacheId,
      occurrenceId,
      prestationId,
      entrepriseId,
    } = parsedInput;

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

// ==================== INSERT TACHE AD-HOC ====================

const FINAL_OCCURRENCE_STATUTS = [
  "terminee",
  "annulee",
  "non_honoree",
] as const;

export const insertAdHocTacheAction = actionClient
  .metadata({ actionName: "insertAdHocTacheAction" })
  .inputSchema(insertAdHocTacheSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { occurrenceId, prestationId, entrepriseId, titre, description } =
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
        "Vous devez être responsable ou intervenant de ce site pour ajouter une tâche.",
      );
    }

    // Charger l'occurrence et vérifier le statut
    const [occurrence] = await db
      .select({
        id: clientServiceOccurrences.id,
        statut: clientServiceOccurrences.statut,
      })
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
      FINAL_OCCURRENCE_STATUTS.includes(
        occurrence.statut as (typeof FINAL_OCCURRENCE_STATUTS)[number],
      )
    ) {
      throw errors.conflict(
        "Impossible d'ajouter une tâche à une intervention terminée, annulée ou non honorée.",
      );
    }

    // Calculer le prochain ordre (MAX + 1)
    const [{ maxOrdre }] = await db
      .select({ maxOrdre: max(occurrenceTaches.ordre) })
      .from(occurrenceTaches)
      .where(eq(occurrenceTaches.occurrenceId, occurrenceId));

    const ordre = (maxOrdre ?? 0) + 1;

    const [tache] = await db
      .insert(occurrenceTaches)
      .values({
        occurrenceId,
        listeItemId: null,
        ordre,
        titre: titre.trim(),
        description: description?.trim() || null,
        statut: "a_faire",
        createdById: currentUser.id,
        updatedById: currentUser.id,
      })
      .returning();

    if (!tache) throw errors.internal("Échec de la création de la tâche.");

    return { tache: { ...tache, piecesJointes: [] } };
  });

// ==================== UPDATE TACHE AD-HOC (titre/description) ====================

export const updateAdHocTacheAction = actionClient
  .metadata({ actionName: "updateAdHocTacheAction" })
  .inputSchema(updateAdHocTacheSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const {
      tacheId,
      occurrenceId,
      prestationId,
      entrepriseId,
      titre,
      description,
    } = parsedInput;

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
        "Vous devez être responsable ou intervenant de ce site pour modifier une tâche.",
      );
    }

    // Charger la tâche
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

    // Seulement les tâches ad-hoc (listeItemId IS NULL)
    if (tache.listeItemId !== null) {
      throw errors.conflict(
        "Seules les tâches ad-hoc peuvent avoir leur titre ou description modifiés.",
      );
    }

    // Verrouiller si terminée
    if (tache.statut === "terminee") {
      throw errors.conflict("Impossible de modifier une tâche déjà terminée.");
    }

    const [updated] = await db
      .update(occurrenceTaches)
      .set({
        titre: titre.trim(),
        description: description?.trim() || null,
        updatedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(occurrenceTaches.id, tacheId))
      .returning();

    if (!updated) throw errors.internal("Échec de la mise à jour de la tâche.");

    return { tache: updated };
  });

// ==================== DELETE TACHE AD-HOC ====================

export const deleteAdHocTacheAction = actionClient
  .metadata({ actionName: "deleteAdHocTacheAction" })
  .inputSchema(deleteAdHocTacheSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { tacheId, occurrenceId, prestationId, entrepriseId } = parsedInput;

    // 1. Vérifier que la prestation existe et appartient à l'entreprise
    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    // 2. Permission : gestionnaire ou plateforme uniquement
    const canManage = await canManagePrestation(
      currentUser.id,
      entrepriseId,
      prestation.siteId,
    );
    if (!canManage) {
      throw errors.forbidden(
        "Vous devez être responsable de ce site pour supprimer une tâche.",
      );
    }

    // 3. Vérifier que la tâche existe et appartient à l'occurrence
    const [tache] = await db
      .select({
        id: occurrenceTaches.id,
        listeItemId: occurrenceTaches.listeItemId,
      })
      .from(occurrenceTaches)
      .where(
        and(
          eq(occurrenceTaches.id, tacheId),
          eq(occurrenceTaches.occurrenceId, occurrenceId),
        ),
      )
      .limit(1);

    if (!tache) throw errors.notFound("Tâche");

    // 4. Guard : uniquement les tâches ad-hoc
    if (tache.listeItemId !== null) {
      throw errors.conflict(
        "Seules les tâches ad-hoc peuvent être supprimées. Utilisez \"non applicable\" pour les tâches de la checklist.",
      );
    }

    // 5. Charger les documents liés (pour cleanup S3 + suppression orphelins)
    const linkedDocs = await db
      .select({
        documentId: documentsLinks.documentId,
        storageKey: documents.storageKey,
      })
      .from(documentsLinks)
      .innerJoin(documents, eq(documents.id, documentsLinks.documentId))
      .where(eq(documentsLinks.occurrenceTacheId, tacheId));

    const documentIds = linkedDocs.map((d) => d.documentId);
    const storageKeys = linkedDocs.map((d) => d.storageKey);

    // 6. Transaction : supprimer la tâche (cascade FK → documentsLinks) + documents orphelins
    await db.transaction(async (tx) => {
      // Supprime la tâche (les documentsLinks sont cascade-supprimés par la FK)
      await tx
        .delete(occurrenceTaches)
        .where(eq(occurrenceTaches.id, tacheId));

      // Supprimer les documents orphelins
      if (documentIds.length > 0) {
        await tx
          .delete(documents)
          .where(inArray(documents.id, documentIds));
      }
    });

    // 7. Cleanup S3 best-effort
    for (const key of storageKeys) {
      s3.send(
        new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }),
      ).catch(() => {
        // Fichiers orphelins nettoyés par tâche de fond
      });
    }

    return { tacheId };
  });

// ==================== UPDATE TACHE ASSIGNEE ====================

export const updateTacheAssigneeAction = actionClient
  .metadata({ actionName: "updateTacheAssigneeAction" })
  .inputSchema(updateTacheAssigneeSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { tacheId, occurrenceId, entrepriseId, assigneeUserId } = parsedInput;

    // Vérifier accès entreprise
    const platformRole = await getUserPlateformeAdhesion(currentUser.id);
    if (!platformRole?.role) {
      const adhesion = await getUserClientAdhesion({
        userId: currentUser.id,
        entrepriseId,
      });
      if (!adhesion) {
        throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
      }
    }

    // Charger la tâche (vérifier qu'elle appartient à l'occurrence + assignee courant)
    const [tacheData] = await db
      .select({ currentAssigneeUserId: occurrenceTaches.assigneeUserId })
      .from(occurrenceTaches)
      .where(
        and(
          eq(occurrenceTaches.id, tacheId),
          eq(occurrenceTaches.occurrenceId, occurrenceId),
        ),
      )
      .limit(1);

    if (!tacheData) throw errors.notFound("Tâche");

    // Charger l'occurrence pour siteId et prestataireEntrepriseId
    const occurrence = await getOccurrenceWithDetailsById(occurrenceId);
    if (!occurrence) throw errors.notFound("Occurrence");

    const { siteId, prestataireEntrepriseId } = occurrence;
    const { currentAssigneeUserId } = tacheData;

    // Règles d'assignation :
    // - Self-assign / self-unassign : canInteract (responsable_site OU intervenant_site)
    // - Assign autre / unassign autre : canManage (responsable_site) uniquement
    const isSelfAssign = assigneeUserId === currentUser.id;
    const isSelfUnassign =
      assigneeUserId === null && currentAssigneeUserId === currentUser.id;

    if (!isSelfAssign && !isSelfUnassign) {
      // Assign/unassign quelqu'un d'autre → responsable du prestataire requis (pas du client)
      if (!prestataireEntrepriseId) {
        throw errors.conflict(
          "Aucun prestataire n'est assigné à cette intervention.",
        );
      }
      const canManage = await canManagePrestation(
        currentUser.id,
        prestataireEntrepriseId,
        siteId,
      );
      if (!canManage) {
        throw errors.forbidden(
          "Seuls les responsables du prestataire peuvent assigner ou désassigner d'autres utilisateurs.",
        );
      }
    } else if (prestataireEntrepriseId) {
      // Self-assign / self-unassign avec prestataire → canInteract dans l'entreprise prestataire
      const canInteract = await canInteractWithPrestation(
        currentUser.id,
        prestataireEntrepriseId,
        siteId,
      );
      if (!canInteract) {
        throw errors.forbidden(
          "Vous n'avez pas les droits pour vous assigner sur cette intervention.",
        );
      }
    } else {
      // Self-unassign sans prestataire → plateforme uniquement (nettoyage)
      const platformRole = await getUserPlateformeAdhesion(currentUser.id);
      if (!platformRole?.role) {
        throw errors.forbidden("Vous n'avez pas les droits pour cette action.");
      }
    }

    // Guard : l'assigné doit appartenir à l'entreprise prestataire de l'occurrence
    if (assigneeUserId !== null) {
      if (!prestataireEntrepriseId) {
        throw errors.conflict(
          "Aucun prestataire n'est assigné à cette intervention.",
        );
      }
      const assigneeAdhesion = await getUserClientAdhesion({
        userId: assigneeUserId,
        entrepriseId: prestataireEntrepriseId,
      });
      if (!assigneeAdhesion) {
        throw errors.forbidden(
          "Cet utilisateur n'appartient pas au prestataire de l'intervention.",
        );
      }
    }

    const [updatedTache] = await db
      .update(occurrenceTaches)
      .set({
        assigneeUserId,
        updatedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(occurrenceTaches.id, tacheId))
      .returning({
        id: occurrenceTaches.id,
        assigneeUserId: occurrenceTaches.assigneeUserId,
      });

    if (!updatedTache)
      throw errors.internal("Échec de la mise à jour de l'assigné.");

    return { assigneeUserId: updatedTache.assigneeUserId };
  });

// ==================== GET ASSIGNABLE USERS FOR OCCURRENCE ====================

export const getAssignableUsersForOccurrenceAction = actionClient
  .metadata({ actionName: "getAssignableUsersForOccurrenceAction" })
  .inputSchema(getAssignableUsersForOccurrenceSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { entrepriseId } = parsedInput;

    const platformRole = await getUserPlateformeAdhesion(currentUser.id);
    if (!platformRole?.role) {
      const adhesion = await getUserClientAdhesion({
        userId: currentUser.id,
        entrepriseId,
      });
      if (!adhesion) {
        throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
      }
    }

    const usersData = await getUsersByEntrepriseId(entrepriseId);

    return {
      users: usersData.map((u) => ({
        id: u.id,
        prenom: u.prenom,
        nom: u.nom,
        email: u.email,
      })),
    };
  });

// ==================== LINK / UNLINK TICKET ↔ OCCURRENCE ====================

export const linkTicketToOccurrenceAction = actionClient
  .metadata({ actionName: "linkTicketToOccurrenceAction" })
  .inputSchema(ticketOccurrenceLinkSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { ticketId, occurrenceId, entrepriseId } = parsedInput;

    const platformRole = await getUserPlateformeAdhesion(currentUser.id);
    if (!platformRole?.role) {
      const adhesion = await getUserClientAdhesion({
        userId: currentUser.id,
        entrepriseId,
      });
      if (!adhesion) {
        throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
      }
    }

    // Vérifier que le ticket appartient à l'entreprise
    const [ticket] = await db
      .select({
        id: tickets.id,
        proprietaireEntrepriseId: tickets.proprietaireEntrepriseId,
      })
      .from(tickets)
      .where(eq(tickets.id, ticketId))
      .limit(1);

    if (!ticket) throw errors.notFound("Ticket");
    if (ticket.proprietaireEntrepriseId !== entrepriseId) {
      throw errors.forbidden("Ce ticket n'appartient pas à cette entreprise.");
    }

    const [updatedTicket] = await db
      .update(tickets)
      .set({
        occurenceId: occurrenceId,
        updatedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, ticketId))
      .returning({ id: tickets.id, occurenceId: tickets.occurenceId });

    if (!updatedTicket)
      throw errors.internal("Échec de la liaison ticket ↔ occurrence.");

    return { ticket: updatedTicket };
  });

export const unlinkTicketFromOccurrenceAction = actionClient
  .metadata({ actionName: "unlinkTicketFromOccurrenceAction" })
  .inputSchema(ticketOccurrenceLinkSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { ticketId, occurrenceId, entrepriseId } = parsedInput;

    const platformRole = await getUserPlateformeAdhesion(currentUser.id);
    if (!platformRole?.role) {
      const adhesion = await getUserClientAdhesion({
        userId: currentUser.id,
        entrepriseId,
      });
      if (!adhesion) {
        throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
      }
    }

    // Vérifier que le ticket est bien lié à cette occurrence
    const [linkedTicket] = await db
      .select({ id: tickets.id })
      .from(tickets)
      .where(
        and(eq(tickets.id, ticketId), eq(tickets.occurenceId, occurrenceId)),
      )
      .limit(1);

    if (!linkedTicket) throw errors.notFound("Ticket lié à cette occurrence");

    await db
      .update(tickets)
      .set({
        occurenceId: null,
        updatedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, ticketId));

    return { unlinked: true };
  });

export const getAvailableTicketsForLinkingAction = actionClient
  .metadata({ actionName: "getAvailableTicketsForLinkingAction" })
  .inputSchema(occurrenceTicketsSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { occurrenceId, entrepriseId } = parsedInput;

    const platformRole = await getUserPlateformeAdhesion(currentUser.id);
    if (!platformRole?.role) {
      const adhesion = await getUserClientAdhesion({
        userId: currentUser.id,
        entrepriseId,
      });
      if (!adhesion) {
        throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
      }
    }

    // Tickets de l'entreprise qui ne sont pas liés à une AUTRE occurrence
    const availableTickets = await db
      .select({
        id: tickets.id,
        titre: tickets.titre,
        statut: tickets.statut,
        priorite: tickets.priorite,
        type: tickets.type,
        occurenceId: tickets.occurenceId,
        createdAt: tickets.createdAt,
      })
      .from(tickets)
      .where(
        and(
          eq(tickets.proprietaireEntrepriseId, entrepriseId),
          or(
            isNull(tickets.occurenceId),
            eq(tickets.occurenceId, occurrenceId),
          ),
        ),
      )
      .orderBy(tickets.createdAt);

    return { tickets: availableTickets };
  });

// ==================== GET TICKETS BY OCCURRENCE ====================

export const getTicketsByOccurrenceAction = actionClient
  .metadata({ actionName: "getTicketsByOccurrenceAction" })
  .inputSchema(occurrenceTicketsSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { occurrenceId, entrepriseId } = parsedInput;

    const platformRole = await getUserPlateformeAdhesion(currentUser.id);
    if (!platformRole?.role) {
      const adhesion = await getUserClientAdhesion({
        userId: currentUser.id,
        entrepriseId,
      });
      if (!adhesion) {
        throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
      }
    }

    const linkedTickets = await db
      .select({
        id: tickets.id,
        titre: tickets.titre,
        statut: tickets.statut,
        priorite: tickets.priorite,
        type: tickets.type,
        createdAt: tickets.createdAt,
      })
      .from(tickets)
      .where(eq(tickets.occurenceId, occurrenceId))
      .orderBy(tickets.createdAt);

    return { tickets: linkedTickets };
  });

// ==================== UPDATE OCCURRENCE ASSIGNEE ====================

export const updateOccurrenceAssigneeAction = actionClient
  .metadata({ actionName: "updateOccurrenceAssigneeAction" })
  .inputSchema(updateOccurrenceAssigneeSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { occurrenceId, entrepriseId, assigneeUserId, applyToTaches } =
      parsedInput;

    // Charger l'occurrence
    const occurrence = await getOccurrenceWithDetailsById(occurrenceId);
    if (!occurrence) throw errors.notFound("Occurrence");

    const { siteId, prestataireEntrepriseId } = occurrence;

    // Permission : responsable_site du prestataire OU plateforme
    if (!prestataireEntrepriseId) {
      throw errors.conflict(
        "Aucun prestataire n'est assigné à cette intervention.",
      );
    }
    const canManage = await canManagePrestation(
      currentUser.id,
      prestataireEntrepriseId,
      siteId,
    );
    if (!canManage) {
      throw errors.forbidden(
        "Seuls les responsables du prestataire peuvent gérer l'assignation de cette intervention.",
      );
    }

    // Garde : l'assigné doit appartenir à l'entreprise prestataire
    if (assigneeUserId !== null) {
      const assigneeAdhesion = await getUserClientAdhesion({
        userId: assigneeUserId,
        entrepriseId: prestataireEntrepriseId,
      });
      if (!assigneeAdhesion) {
        throw errors.forbidden(
          "Cet utilisateur n'appartient pas au prestataire de l'intervention.",
        );
      }
    }

    await db.transaction(async (tx) => {
      // 1. Mettre à jour l'occurrence
      await tx
        .update(clientServiceOccurrences)
        .set({
          assigneeUserId,
          updatedById: currentUser.id,
          updatedAt: new Date(),
        })
        .where(eq(clientServiceOccurrences.id, occurrenceId));

      // 2. Si demandé, propager aux tâches non terminées
      if (applyToTaches) {
        await tx
          .update(occurrenceTaches)
          .set({
            assigneeUserId,
            updatedById: currentUser.id,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(occurrenceTaches.occurrenceId, occurrenceId),
              // Uniquement les tâches encore actives
              or(
                eq(occurrenceTaches.statut, "a_faire"),
                eq(occurrenceTaches.statut, "en_cours"),
              ),
            ),
          );
      }
    });

    // Vérifier les permissions d'accès à l'entreprise cliente pour le retour
    if (!entrepriseId) throw errors.forbidden("ID entreprise manquant.");

    return { occurrenceId, assigneeUserId };
  });

// ==================== INSERT OCCURRENCE ON-DEMAND ====================

export const insertOccurrenceOnDemandAction = actionClient
  .metadata({ actionName: "insertOccurrenceOnDemandAction" })
  .inputSchema(insertOccurrenceOnDemandFormSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { prestationId, entrepriseId, dateDebutPrevue, dateFinPrevue, notes } =
      parsedInput;

    // 1. Vérifier que la prestation existe et appartient à l'entreprise
    // getPrestationWithJoinsById inclut siteNom nécessaire pour le retour OccurrenceListItem
    const prestation = await getPrestationWithJoinsById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }
    if (prestation.statut !== "actif") {
      throw errors.conflict(
        "Impossible de créer un passage sur une prestation qui n'est pas active.",
      );
    }

    // 2. Permissions : gestionnaire ou plateforme uniquement
    const canManage = await canManagePrestation(
      currentUser.id,
      entrepriseId,
      prestation.siteId,
    );
    if (!canManage) {
      throw errors.forbidden(
        "Vous devez être responsable de ce site pour créer un passage.",
      );
    }

    // 3. Parser les dates
    const dateDebut = new Date(dateDebutPrevue);
    const dateFin = dateFinPrevue ? new Date(dateFinPrevue) : null;

    // 4. Trouver l'exécution applicable — obligatoire pour créer une occurrence
    const executionId = await pickExecutionForOccurrence({
      clientServiceId: prestationId,
      entrepriseId,
      siteId: prestation.siteId,
      targetDate: dateDebut,
    });

    if (executionId === null) {
      throw errors.conflict(
        "Aucune exécution active ne couvre cette date. Ajoutez un prestataire avant de créer une intervention.",
      );
    }

    // 5. Insérer l'occurrence (+ snapshot tâches si template) dans une transaction
    const occurrence = await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(clientServiceOccurrences)
        .values({
          clientServiceId: prestationId,
          siteId: prestation.siteId,
          dateDebutPrevue: dateDebut,
          dateFinPrevue: dateFin,
          executionId,
          statut: "planifiee",
          notes: notes ?? null,
          createdById: currentUser.id,
          updatedById: currentUser.id,
        })
        .returning();

      if (!inserted) throw errors.internal("Échec de la création du passage.");

      // Snapshot des tâches depuis la checklist de l'exécution (si définie)
      if (executionId) {
        const [exec] = await tx
          .select({ tacheListeTemplateId: clientServiceExecutions.tacheListeTemplateId })
          .from(clientServiceExecutions)
          .where(eq(clientServiceExecutions.id, executionId))
          .limit(1);
        if (exec?.tacheListeTemplateId) {
          await snapshotOccurrenceTaches({
            occurrenceId: inserted.id,
            tacheListeTemplateId: exec.tacheListeTemplateId,
            tx,
          });
        }
      }

      return inserted;
    });

    // 6. Construire le retour au format OccurrenceListItem
    // (siteNom provient de la prestation déjà chargée — pas de query supplémentaire)
    const occurrenceListItem = {
      id: occurrence.id,
      clientServiceId: occurrence.clientServiceId,
      siteId: occurrence.siteId,
      siteNom: prestation.siteNom,
      executionId: occurrence.executionId,
      dateDebutPrevue: occurrence.dateDebutPrevue,
      dateFinPrevue: occurrence.dateFinPrevue,
      dateDebutReelle: occurrence.dateDebutReelle,
      dateFinReelle: occurrence.dateFinReelle,
      statut: occurrence.statut,
      notes: occurrence.notes,
      createdAt: occurrence.createdAt,
      assigneeUserId: occurrence.assigneeUserId,
      assigneePrenom: null as string | null,
      assigneeNom: null as string | null,
    };

    return { occurrence: occurrenceListItem };
  });
