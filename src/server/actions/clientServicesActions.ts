"use server";

import { db } from "@/db";
import {
  clientServiceExecutionPrix,
  clientServiceExecutions,
  clientServiceOccurrences,
  clientServicePerimetre,
  clientServiceReglesRecurrence,
  clientServices,
} from "@/db/schema/services";
import { clientPrestataireRelations } from "@/db/schema/entreprises";
import { userPrestataireAdhesions } from "@/db/schema/users";
import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import {
  getAllPrestations,
  getPrestationById,
  getPrestationsByEntreprise,
  getPrestationsByPrestataire,
  getPrestationWithJoinsById,
  prestationBelongsToEntreprise,
} from "@/server/queries/clientServices.query";
import {
  getUserClientAdhesion,
  getUserPrestataireAdhesion,
  hasAccessToEntreprise,
} from "@/server/queries/userAdhesions.query";
import {
  getAllPrestataireSiteIds,
  getResponsableSiteIdsByPrestataire,
} from "@/server/queries/userPrestataireSiteAttributions.query";
import { getAllClientSiteIds } from "@/server/queries/userSiteAttributions.query";
import {
  getActivePosture,
  getEffectivePlateformeRole,
  resolvePostureAwareSiteRole,
} from "@/server/utils/permissions.utils";
import { onClientServiceChanged } from "@/server/utils/clientServiceOccurrences.utils";
import { normalizeForSubmit } from "@/zod-helpers/normalize";
import {
  getPrestationsQuerySchema,
  insertClientServiceToDbSchema,
  insertPrestationActionSchema,
  insertPrestationWithExecutionActionSchema,
  perimetreEntrySchema,
  prestationByIdSchema,
  selectClientServiceSchema,
  updateClientServiceToDbSchema,
  updatePrestationActionSchema,
  updatePrestationStatutSchema,
} from "@/zod-schemas/clientServices.schema";
import { and, count, eq, gte, or } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";

// ==================== HELPERS ====================

/**
 * Vérifie si l'utilisateur peut créer ou modifier une prestation.
 * - Posture plateforme → toujours autorisé
 * - Posture client : client_admin OU responsable_site sur le site
 * - Posture prestataire : prestataire_admin OU responsable_site sur le site client
 *
 * Retourne { allowed, isPlateforme, isAdmin } pour affiner les contrôles downstream.
 */
async function canManagePrestation(
  userId: string,
  entrepriseId: string,
  siteId: string,
): Promise<{ allowed: boolean; isPlateforme: boolean; isAdmin: boolean }> {
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) return { allowed: true, isPlateforme: true, isAdmin: false };

  const posture = await getActivePosture();

  if (posture === "client") {
    const clientAdhesion = await getUserClientAdhesion({ userId, entrepriseId });
    if (clientAdhesion?.role === "admin") {
      return { allowed: true, isPlateforme: false, isAdmin: true };
    }
  } else if (posture === "prestataire") {
    const prestataireAdhesion = await getUserPrestataireAdhesion({ userId });
    if (prestataireAdhesion?.role === "admin") {
      const relation = await db.query.clientPrestataireRelations.findFirst({
        where: and(
          eq(
            clientPrestataireRelations.prestataireEntrepriseId,
            prestataireAdhesion.entrepriseId,
          ),
          eq(clientPrestataireRelations.clientEntrepriseId, entrepriseId),
        ),
        columns: { id: true },
      });
      if (relation) {
        return { allowed: true, isPlateforme: false, isAdmin: true };
      }
    }
  }

  const siteRole = await resolvePostureAwareSiteRole({ userId, siteId, entrepriseId });
  return { allowed: siteRole === "responsable_site", isPlateforme: false, isAdmin: false };
}

/**
 * Vérifie si l'utilisateur peut archiver ou supprimer une prestation.
 * Plus restrictif que canManagePrestation : responsable_site n'a pas ce droit.
 * - Posture plateforme → toujours autorisé
 * - Posture client : client_admin uniquement
 * - Posture prestataire : prestataire_admin uniquement
 */
async function canArchiveDeletePrestation(
  userId: string,
  entrepriseId: string,
): Promise<boolean> {
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) return true;

  const posture = await getActivePosture();

  if (posture === "client") {
    const clientAdhesion = await getUserClientAdhesion({ userId, entrepriseId });
    return clientAdhesion?.role === "admin";
  }

  if (posture === "prestataire") {
    const prestataireAdhesion = await getUserPrestataireAdhesion({ userId });
    if (prestataireAdhesion?.role === "admin") {
      const relation = await db.query.clientPrestataireRelations.findFirst({
        where: and(
          eq(
            clientPrestataireRelations.prestataireEntrepriseId,
            prestataireAdhesion.entrepriseId,
          ),
          eq(clientPrestataireRelations.clientEntrepriseId, entrepriseId),
        ),
        columns: { id: true },
      });
      return !!relation;
    }
    return false;
  }

  return false;
}

/**
 * Vérifie si une prestation est "mise en exécution" (au moins une exécution, un tarif ou une occurrence future).
 * Dans ce cas, le modeCommercial est verrouillé.
 */
async function isPrestationMiseEnExecution(
  prestationId: string,
): Promise<boolean> {
  const now = new Date();

  const [executionRow] = await db
    .select({ n: count() })
    .from(clientServiceExecutions)
    .where(eq(clientServiceExecutions.clientServiceId, prestationId));

  if ((executionRow?.n ?? 0) > 0) return true;

  const [occurrenceRow] = await db
    .select({ n: count() })
    .from(clientServiceOccurrences)
    .where(
      and(
        eq(clientServiceOccurrences.clientServiceId, prestationId),
        or(
          gte(clientServiceOccurrences.dateDebutPrevue, now),
          gte(clientServiceOccurrences.dateDebutReelle, now),
        ),
      ),
    );

  return (occurrenceRow?.n ?? 0) > 0;
}

// ==================== GET PRESTATIONS ====================

export const getPrestationsAction = actionClient
  .metadata({ actionName: "getPrestationsAction" })
  .inputSchema(getPrestationsQuerySchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    const {
      entrepriseId,
      prestataireEntrepriseId,
      statut,
      famillePlanification,
      serviceId,
      siteId,
      modeCommercial,
      orderBy,
      orderDir,
    } = parsedInput;

    // Branche prestataire : filtre via executions → serviceEntreprises
    if (prestataireEntrepriseId) {
      const adhesion = await db.query.userPrestataireAdhesions.findFirst({
        where: and(
          eq(userPrestataireAdhesions.userId, currentUser.id),
          eq(userPrestataireAdhesions.entrepriseId, prestataireEntrepriseId),
          eq(userPrestataireAdhesions.statut, "actif"),
        ),
      });
      const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
      if (!adhesion && !plateformeRole?.role) {
        throw errors.forbidden("Vous n'avez pas accès à ce prestataire.");
      }

      // Gate N2 : non-admin (manager inclus) → restreindre aux sites attribués via userPrestataireSiteAttributions
      let attributedSiteIds: string[] | undefined;
      if (!plateformeRole?.role && adhesion?.role !== "admin") { // manager = même règle que non-admin
        const siteIds = await getAllPrestataireSiteIds({
          userId: currentUser.id,
          clientEntrepriseId: entrepriseId,
        });
        if (siteIds.length === 0) return { prestations: [] };
        attributedSiteIds = siteIds;
      }

      const prestations = await getPrestationsByPrestataire(
        prestataireEntrepriseId,
        { clientEntrepriseId: entrepriseId, statut, famillePlanification, serviceId, siteId, modeCommercial, orderBy, orderDir, attributedSiteIds },
      );
      return { prestations };
    }

    if (!entrepriseId) {
      // Vue cross-clients : réservée à la plateforme
      const platformRole = await getEffectivePlateformeRole(currentUser.id);
      if (!platformRole?.role) {
        throw errors.forbidden(
          "Seule la plateforme peut accéder à la vue cross-clients.",
        );
      }
      const prestations = await getAllPrestations({
        statut,
        famillePlanification,
        serviceId,
        siteId,
        modeCommercial,
        orderBy,
        orderDir,
      });
      return { prestations };
    }

    // Vue standard : vérifier l'accès à l'entreprise (posture client)
    const hasAccess = await hasAccessToEntreprise(currentUser.id, entrepriseId);
    if (!hasAccess) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Gate N2 client : non-admin → restreindre aux sites attribués
    const posture = await getActivePosture();
    let attributedClientSiteIds: string[] | undefined;
    if (posture !== "plateforme") {
      const clientAdhesion = await getUserClientAdhesion({ userId: currentUser.id, entrepriseId });
      if (!clientAdhesion || clientAdhesion.role !== "admin") {
        const siteIds = await getAllClientSiteIds({ userId: currentUser.id, entrepriseId });
        if (siteIds.length === 0) return { prestations: [] };
        attributedClientSiteIds = siteIds;
      }
    }

    const prestations = await getPrestationsByEntreprise(entrepriseId, {
      statut,
      famillePlanification,
      serviceId,
      siteId,
      modeCommercial,
      orderBy,
      orderDir,
      attributedClientSiteIds,
    });

    return { prestations };
  });

// ==================== GET PRESTATION BY ID ====================

export const getPrestationByIdAction = actionClient
  .metadata({ actionName: "getPrestationByIdAction" })
  .inputSchema(prestationByIdSchema, {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    const { prestationId, entrepriseId } = parsedInput;

    // Vérifier l'accès
    const hasAccess = await hasAccessToEntreprise(currentUser.id, entrepriseId);
    if (!hasAccess) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Vérifier que la prestation appartient à l'entreprise
    const belongs = await prestationBelongsToEntreprise({
      prestationId,
      entrepriseId,
    });
    if (!belongs) {
      throw errors.notFound("Prestation");
    }

    const prestation = await getPrestationWithJoinsById(prestationId);
    if (!prestation) {
      throw errors.notFound("Prestation");
    }

    return { prestation };
  });

// ==================== INSERT PRESTATION ====================

export const insertPrestationAction = actionClient
  .metadata({ actionName: "insertPrestationAction" })
  .inputSchema(insertPrestationActionSchema, {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    const { entrepriseId, siteId } = parsedInput;

    // Vérifier les permissions : plateforme OU responsable_site sur le site d'ancrage
    const { allowed: canCreate, isPlateforme } = await canManagePrestation(
      currentUser.id,
      entrepriseId,
      siteId,
    );
    if (!canCreate) {
      throw errors.forbidden(
        "Vous devez être responsable de ce site pour créer une prestation.",
      );
    }

    // Règle métier : seule la plateforme peut créer en mode intermediaire_fm4all
    if (
      parsedInput.modeCommercial === "intermediaire_fm4all" &&
      !isPlateforme
    ) {
      throw errors.forbidden(
        "Seule la plateforme FM4ALL peut créer une prestation en mode intermédiaire.",
      );
    }
    const modeCommercial = parsedInput.modeCommercial ?? "direct";

    // Normaliser les données (strings → types corrects, "" → null)
    const normalized = normalizeForSubmit(parsedInput, {
      optionalDates: ["dateDebut", "dateFin"] as const,
      optionalStrings: ["notes"] as const,
    });

    // Préparer le payload DB
    const payload = insertClientServiceToDbSchema.parse({
      entrepriseId: normalized.entrepriseId,
      siteId: normalized.siteId,
      serviceId: normalized.serviceId,
      famillePlanification: normalized.famillePlanification,
      dateDebut: normalized.dateDebut,
      dateFin: normalized.dateFin,
      statut: "brouillon", // toujours brouillon à la création
      modeCommercial,
      notes: normalized.notes,
      createdById: currentUser.id,
      updatedById: currentUser.id,
    });

    // Transaction : créer la prestation + son périmètre atomiquement
    const parsedPrestation = await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(clientServices)
        .values(payload)
        .returning();

      if (!inserted) {
        throw errors.internal("Échec de la création de la prestation.");
      }

      // Insérer les entrées de périmètre
      await tx.insert(clientServicePerimetre).values(
        parsedInput.perimetre.map((entry, idx) => ({
          clientServiceId: inserted.id,
          siteId: entry.siteId,
          mode: entry.mode,
          scope: entry.scope,
          ordreAffichage: idx,
          createdById: currentUser.id,
          updatedById: currentUser.id,
        })),
      );

      return selectClientServiceSchema.parse(inserted);
    });

    // Si la prestation est directement créée en statut "actif" + recurrence_auto,
    // déclencher la génération des occurrences
    if (
      parsedPrestation.statut === "actif" &&
      parsedPrestation.famillePlanification === "recurrence_auto"
    ) {
      const { onClientServiceChanged } = await import(
        "@/server/utils/clientServiceOccurrences.utils"
      );
      await onClientServiceChanged({
        clientServiceId: parsedPrestation.id,
        now: new Date(),
      });
    }

    return {
      message: "Prestation créée avec succès.",
      prestation: parsedPrestation,
    };
  });

// ==================== UPDATE PRESTATION ====================

export const updatePrestationAction = actionClient
  .metadata({ actionName: "updatePrestationAction" })
  .inputSchema(updatePrestationActionSchema, {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    const { id: prestationId, entrepriseId } = parsedInput;

    // Vérifier que la prestation appartient à l'entreprise
    const belongs = await prestationBelongsToEntreprise({
      prestationId,
      entrepriseId,
    });
    if (!belongs) {
      throw errors.notFound("Prestation");
    }

    // Récupérer la prestation pour avoir le siteId avant la vérification des permissions
    const current = await getPrestationById(prestationId);
    if (!current) {
      throw errors.notFound("Prestation");
    }

    // Vérifier les permissions : plateforme OU responsable_site sur le site
    const { allowed: canEdit, isPlateforme } = await canManagePrestation(
      currentUser.id,
      entrepriseId,
      current.siteId,
    );
    if (!canEdit) {
      throw errors.forbidden(
        "Vous devez être responsable de ce site pour modifier une prestation.",
      );
    }

    // Interdire la modification si la prestation est terminée
    if (current.statut === "termine") {
      throw errors.conflict("Impossible de modifier une prestation terminée.");
    }

    // Règle modeCommercial : seule la plateforme peut le modifier, et seulement avant exécution
    if (
      parsedInput.modeCommercial !== undefined &&
      parsedInput.modeCommercial !== current.modeCommercial
    ) {
      if (!isPlateforme) {
        throw errors.forbidden(
          "Seule la plateforme FM4ALL peut modifier le mode commercial.",
        );
      }
      const isLocked = await isPrestationMiseEnExecution(prestationId);
      if (isLocked) {
        throw errors.conflict(
          "Le mode commercial ne peut plus être modifié : des exécutions, tarifs ou interventions existent déjà.",
        );
      }
    }

    // Normaliser les données
    const normalized = normalizeForSubmit(parsedInput, {
      optionalDates: ["dateDebut", "dateFin"] as const,
      optionalStrings: ["notes"] as const,
    });

    // Construire l'objet de mise à jour avec seulement les champs fournis
    const updateFields: Record<string, unknown> = {};
    if (normalized.famillePlanification !== undefined)
      updateFields.famillePlanification = normalized.famillePlanification;
    if (normalized.dateDebut !== undefined)
      updateFields.dateDebut = normalized.dateDebut;
    if (normalized.dateFin !== undefined)
      updateFields.dateFin = normalized.dateFin;
    if (parsedInput.modeCommercial !== undefined)
      updateFields.modeCommercial = parsedInput.modeCommercial;
    if (normalized.notes !== undefined) updateFields.notes = normalized.notes;

    const payload = updateClientServiceToDbSchema.parse({
      ...updateFields,
      updatedById: currentUser.id,
    });

    const [updated] = await db
      .update(clientServices)
      .set(payload)
      .where(eq(clientServices.id, prestationId))
      .returning();

    if (!updated) {
      throw errors.internal("Échec de la mise à jour de la prestation.");
    }

    const parsedPrestation = selectClientServiceSchema.parse(updated);

    // Si la prestation est active + recurrence_auto, re-générer les occurrences
    if (
      parsedPrestation.statut === "actif" &&
      parsedPrestation.famillePlanification === "recurrence_auto"
    ) {
      const { onClientServiceChanged } = await import(
        "@/server/utils/clientServiceOccurrences.utils"
      );
      await onClientServiceChanged({
        clientServiceId: parsedPrestation.id,
        now: new Date(),
      });
    }

    return {
      message: "Prestation mise à jour avec succès.",
      prestation: parsedPrestation,
    };
  });

// ==================== UPDATE PRESTATION STATUT (CYCLE DE VIE) ====================

/**
 * Transitions autorisées:
 * - brouillon → actif
 * - actif → en_pause
 * - actif → termine
 * - en_pause → actif
 * - en_pause → termine
 * - termine → [aucune transition autorisée]
 */
const TRANSITIONS_AUTORISEES: Record<string, readonly string[]> = {
  brouillon: ["actif"],
  actif: ["en_pause", "termine"],
  en_pause: ["actif", "termine"],
  termine: [],
};

export const updatePrestationStatutAction = actionClient
  .metadata({ actionName: "updatePrestationStatutAction" })
  .inputSchema(updatePrestationStatutSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    const { prestationId, entrepriseId, statut: newStatut } = parsedInput;

    // Vérifier que la prestation appartient à l'entreprise
    const belongs = await prestationBelongsToEntreprise({
      prestationId,
      entrepriseId,
    });
    if (!belongs) {
      throw errors.notFound("Prestation");
    }

    // Récupérer la prestation pour avoir le siteId avant la vérification des permissions
    const current = await getPrestationById(prestationId);
    if (!current) {
      throw errors.notFound("Prestation");
    }

    // Vérifier les permissions : plateforme OU responsable_site sur le site
    const { allowed: canEdit } = await canManagePrestation(
      currentUser.id,
      entrepriseId,
      current.siteId,
    );
    if (!canEdit) {
      throw errors.forbidden(
        "Vous devez être responsable de ce site pour modifier le statut d'une prestation.",
      );
    }

    const currentStatut = current.statut;

    // Vérifier la transition
    const allowed = TRANSITIONS_AUTORISEES[currentStatut] ?? [];
    if (!allowed.includes(newStatut)) {
      throw errors.conflict(
        `Transition invalide : ${currentStatut} → ${newStatut}. Transitions autorisées : ${allowed.length > 0 ? allowed.join(", ") : "aucune"}.`,
      );
    }

    // "termine" est un acte fort réservé aux admins (client ou prestataire) et à la plateforme
    if (newStatut === "termine") {
      const canArchive = await canArchiveDeletePrestation(currentUser.id, entrepriseId);
      if (!canArchive) {
        throw errors.forbidden(
          "Seul l'administrateur de l'entreprise peut terminer une prestation.",
        );
      }
    }

    // Guard : activation sans exécution active interdite
    if (newStatut === "actif") {
      const [execRow] = await db
        .select({ total: count() })
        .from(clientServiceExecutions)
        .where(
          and(
            eq(clientServiceExecutions.clientServiceId, prestationId),
            eq(clientServiceExecutions.actif, true),
          ),
        );
      if (!execRow || execRow.total === 0) {
        throw errors.conflict(
          "Impossible d'activer une prestation sans exécution active. " +
            "Ajoutez au moins une exécution (prestataire + tarifs) dans l'onglet Exécution & Tarifs.",
        );
      }

      // Guard : activation en récurrence auto sans règle active interdite
      if (current.famillePlanification === "recurrence_auto") {
        const [regleRow] = await db
          .select({ total: count() })
          .from(clientServiceReglesRecurrence)
          .where(
            and(
              eq(clientServiceReglesRecurrence.clientServiceId, prestationId),
              eq(clientServiceReglesRecurrence.actif, true),
            ),
          );
        if (!regleRow || regleRow.total === 0) {
          throw errors.conflict(
            "Impossible d'activer une prestation en récurrence automatique sans règle de planification. " +
              "Ajoutez au moins une règle dans l'onglet Planning.",
          );
        }
      }
    }

    // Effectuer la mise à jour
    const [updated] = await db
      .update(clientServices)
      .set({
        statut: newStatut,
        updatedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(clientServices.id, prestationId))
      .returning();

    if (!updated) {
      throw errors.internal("Échec de la mise à jour du statut.");
    }

    const parsedPrestation = selectClientServiceSchema.parse(updated);

    // Effets de bord sur les occurrences selon la transition (recurrence_auto uniquement)
    if (parsedPrestation.famillePlanification === "recurrence_auto") {
      const now = new Date();

      if (newStatut === "actif") {
        // Régénère la fenêtre glissante (supprime les planifiées futures + recrée)
        const { onClientServiceChanged } = await import(
          "@/server/utils/clientServiceOccurrences.utils"
        );
        await onClientServiceChanged({
          clientServiceId: parsedPrestation.id,
          now,
        });
      } else if (newStatut === "en_pause") {
        // Supprime les planifiées futures : seront régénérées au retour à actif
        const { deleteFuturePlanifieeOccurrences } = await import(
          "@/server/utils/clientServiceOccurrences.utils"
        );
        await deleteFuturePlanifieeOccurrences({
          clientServiceId: parsedPrestation.id,
          now,
        });
      } else if (newStatut === "termine") {
        // Annule les planifiées futures : conserve l'historique pour audit
        const { cancelFuturePlanifieeOccurrences } = await import(
          "@/server/utils/clientServiceOccurrences.utils"
        );
        await cancelFuturePlanifieeOccurrences({
          clientServiceId: parsedPrestation.id,
          now,
        });
      }
    }

    return {
      message: `Statut mis à jour : ${currentStatut} → ${newStatut}.`,
      prestation: parsedPrestation,
    };
  });

// ==================== DELETE PRESTATION ====================

export const deletePrestationAction = actionClient
  .metadata({ actionName: "deletePrestationAction" })
  .inputSchema(prestationByIdSchema, {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    const { prestationId, entrepriseId } = parsedInput;

    // Vérifier que la prestation appartient à l'entreprise
    const belongs = await prestationBelongsToEntreprise({
      prestationId,
      entrepriseId,
    });
    if (!belongs) {
      throw errors.notFound("Prestation");
    }

    // Récupérer la prestation pour avoir le siteId avant la vérification des permissions
    const current = await getPrestationById(prestationId);
    if (!current) {
      throw errors.notFound("Prestation");
    }

    // Vérifier les permissions : plateforme OU admin (client ou prestataire) uniquement
    const canDelete = await canArchiveDeletePrestation(currentUser.id, entrepriseId);
    if (!canDelete) {
      throw errors.forbidden(
        "Seul l'administrateur de l'entreprise peut supprimer une prestation.",
      );
    }

    // Seules les prestations en "brouillon" peuvent être supprimées
    if (current.statut !== "brouillon") {
      throw errors.conflict(
        "Seules les prestations en brouillon peuvent être supprimées. Terminez la prestation d'abord.",
      );
    }

    await db.delete(clientServices).where(eq(clientServices.id, prestationId));

    return {
      message: "Prestation supprimée avec succès.",
      prestationId,
    };
  });

// ==================== INSERT PRESTATION + EXECUTION (posture prestataire) ====================

/**
 * Crée une prestation ET son exécution dans une seule transaction.
 * Réservé à la posture prestataire : le prestataire est automatiquement résolu
 * depuis le serviceEntrepriseId fourni ; modeCommercial est toujours "direct".
 */
export const insertPrestationWithExecutionAction = actionClient
  .metadata({ actionName: "insertPrestationWithExecutionAction" })
  .inputSchema(insertPrestationWithExecutionActionSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { entrepriseId, siteId } = parsedInput;

    // Permission : plateforme OU responsable_site prestataire sur le site client
    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    if (!platformRole) {
      // Vérifier adhésion prestataire active
      const prestataireAdhesion =
        await db.query.userPrestataireAdhesions.findFirst({
          where: and(
            eq(userPrestataireAdhesions.userId, currentUser.id),
            eq(userPrestataireAdhesions.statut, "actif"),
          ),
        });
      if (!prestataireAdhesion) {
        throw errors.forbidden(
          "Vous devez être un prestataire actif pour créer une prestation.",
        );
      }

      // Vérifier responsable_site sur le site client
      const responsableSiteIds = await getResponsableSiteIdsByPrestataire({
        userId: currentUser.id,
        clientEntrepriseId: entrepriseId,
      });
      if (!responsableSiteIds.includes(siteId)) {
        throw errors.forbidden(
          "Vous devez être responsable de ce site chez ce client pour créer une prestation.",
        );
      }
    }

    const normalized = normalizeForSubmit(parsedInput, {
      optionalDates: ["dateDebut", "dateFin", "dateFinValidite"] as const,
      requiredDates: ["dateDebutValidite"] as const,
      requiredNumbers: ["priorite"] as const,
      optionalStrings: ["notes"] as const,
    });

    const payload = insertClientServiceToDbSchema.parse({
      entrepriseId: normalized.entrepriseId,
      siteId: normalized.siteId,
      serviceId: normalized.serviceId,
      famillePlanification: normalized.famillePlanification,
      dateDebut: normalized.dateDebut,
      dateFin: normalized.dateFin,
      statut: "brouillon",
      modeCommercial: "direct", // Toujours direct en posture prestataire
      notes: normalized.notes,
      createdById: currentUser.id,
      updatedById: currentUser.id,
    });

    const parsedPrestation = await db.transaction(async (tx) => {
      // 1. Créer la prestation
      const [inserted] = await tx
        .insert(clientServices)
        .values(payload)
        .returning();

      if (!inserted) throw errors.internal("Échec de la création de la prestation.");

      // 2. Insérer les entrées de périmètre
      await tx.insert(clientServicePerimetre).values(
        parsedInput.perimetre.map((entry, idx) => ({
          clientServiceId: inserted.id,
          siteId: entry.siteId,
          mode: entry.mode,
          scope: entry.scope,
          ordreAffichage: idx,
          createdById: currentUser.id,
          updatedById: currentUser.id,
        })),
      );

      // 3. Créer l'exécution
      const [execution] = await tx
        .insert(clientServiceExecutions)
        .values({
          clientServiceId: inserted.id,
          siteId,
          serviceEntrepriseId: parsedInput.serviceEntrepriseId,
          dateDebutValidite: normalized.dateDebutValidite,
          dateFinValidite: normalized.dateFinValidite,
          priorite: normalized.priorite,
          modePilotage: parsedInput.modePilotage,
          actif: true,
          createdById: currentUser.id,
          updatedById: currentUser.id,
        })
        .returning();

      if (!execution) throw errors.internal("Échec de la création de l'exécution.");

      // 4. Insérer les lignes de prix
      await tx.insert(clientServiceExecutionPrix).values(
        parsedInput.prix.map((p) => ({
          executionId: execution.id,
          typePrix: p.typePrix,
          montantHt: Math.round(Number(p.montantHt) * 100),
          coutPrestataireHt: null,
          margePourcent: null,
          periodeFacturation: p.periodeFacturation ?? null,
          nbOccurrencesIncluses:
            p.nbOccurrencesIncluses && p.nbOccurrencesIncluses !== ""
              ? Number(p.nbOccurrencesIncluses)
              : null,
          actif: true,
          createdById: currentUser.id,
          updatedById: currentUser.id,
        })),
      );

      return selectClientServiceSchema.parse(inserted);
    });

    return {
      message: "Prestation et exécution créées avec succès.",
      prestation: parsedPrestation,
    };
  });
