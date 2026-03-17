"use server";

import { db } from "@/db";
import { serviceEntreprises } from "@/db/schema/entreprises";
import {
  clientServiceExecutions,
  tacheListeItems,
  tacheListesTemplates,
} from "@/db/schema/services";
import { userClientAdhesions, userPrestataireAdhesions } from "@/db/schema/users";
import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import {
  getAvailableTacheListesTemplates,
  getTacheListeTemplateWithItems,
  getTacheListesTemplatesByProprietaire,
  getTacheListesWithServiceNames,
} from "@/server/queries/tacheListesTemplates.query";
import { getActivePosture, getEffectivePlateformeRole } from "@/server/utils/permissions.utils";
import { hasAccessToEntreprise } from "@/server/queries/userAdhesions.query";
import {
  deleteTacheListeItemSchema,
  deleteTacheListeTemplateSchema,
  getAvailableTacheListesTemplatesSchema,
  getChecklistsForPageSchema,
  getTacheListeTemplateSchema,
  getTacheListesTemplatesSchema,
  insertTacheListeItemSchema,
  insertTacheListeTemplateSchema,
  reorderTacheListeItemsSchema,
  updateTacheListeItemSchema,
  updateTacheListeTemplateSchema,
} from "@/zod-schemas/tacheListesTemplates.schema";
import { normalizeForSubmit } from "@/zod-helpers/normalize";
import { getServicesByEntrepriseId } from "@/server/queries/entreprises.query";
import { getAllServices } from "@/server/queries/services.query";
import { and, asc, eq, max } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";

// ==================== HELPERS ====================

/**
 * Vérifie que l'utilisateur peut écrire des checklists pour cette entreprise.
 * Requiert au minimum le rôle "manager" (client ou prestataire) ou rôle plateforme.
 *
 * Posture-aware : ne vérifie que la table correspondant à la posture active du cookie.
 * - posture "prestataire" → vérifie userPrestataireAdhesions uniquement
 * - posture "client" ou absente → vérifie userClientAdhesions uniquement
 * Empêche qu'un admin client (double casquette) bypasse sa posture prestataire.
 */
async function canManageChecklists(
  userId: string,
  entrepriseId: string | null,
): Promise<boolean> {
  if (!entrepriseId) return false;

  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) return true;

  const posture = await getActivePosture();

  if (posture === "prestataire") {
    const adhesion = await db.query.userPrestataireAdhesions.findFirst({
      where: and(
        eq(userPrestataireAdhesions.userId, userId),
        eq(userPrestataireAdhesions.entrepriseId, entrepriseId),
        eq(userPrestataireAdhesions.statut, "actif"),
      ),
    });
    const role = adhesion?.role;
    return role === "admin" || role === "manager";
  }

  // posture "client" ou absente (défaut le plus sûr)
  const adhesion = await db.query.userClientAdhesions.findFirst({
    where: and(
      eq(userClientAdhesions.userId, userId),
      eq(userClientAdhesions.entrepriseId, entrepriseId),
      eq(userClientAdhesions.statut, "actif"),
    ),
  });
  const role = adhesion?.role;
  return role === "admin" || role === "manager";
}

/** Vérifie que l'utilisateur a le rôle plateforme */
async function isPlatformUser(userId: string): Promise<boolean> {
  const platformRole = await getEffectivePlateformeRole(userId);
  return !!platformRole?.role;
}

/** Retourne l'entreprise du prestataire lié à une exécution */
async function getExecutionPrestataireEntrepriseId(
  executionId: string,
): Promise<string | null> {
  const [row] = await db
    .select({ prestataireEntrepriseId: serviceEntreprises.entrepriseId })
    .from(clientServiceExecutions)
    .innerJoin(
      serviceEntreprises,
      eq(serviceEntreprises.id, clientServiceExecutions.serviceEntrepriseId),
    )
    .where(eq(clientServiceExecutions.id, executionId))
    .limit(1);
  return row?.prestataireEntrepriseId ?? null;
}

// ==================== GET AVAILABLE PACKS ====================

/**
 * Retourne les packs disponibles selon le contexte :
 * - Toujours les packs système (proprietaireEntrepriseId IS NULL)
 * - Les packs de l'entreprise passée en input (client ou créateur)
 * - Si executionId fourni : aussi les packs du prestataire lié à l'exécution
 */
export const getAvailableTacheListesTemplatesAction = actionClient
  .metadata({ actionName: "getAvailableTacheListesTemplatesAction" })
  .inputSchema(getAvailableTacheListesTemplatesSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { serviceId, entrepriseId, executionId } = parsedInput;

    // Résolution préalable du prestataireEntrepriseId (réutilisé pour le check d'accès ET pour les packs)
    // Priorité : parsedInput.prestataireEntrepriseId > résolu depuis executionId
    const prestataireEntrepriseId =
      parsedInput.prestataireEntrepriseId ??
      (executionId ? await getExecutionPrestataireEntrepriseId(executionId) : null);

    // En posture prestataire, l'entrepriseId passé est celui du CLIENT — le prestataire
    // n'a pas d'adhésion client, donc on vérifie l'accès contre son propre entrepriseId
    // (récupéré depuis l'exécution).
    const posture = await getActivePosture();
    const entrepriseIdToCheck =
      posture === "prestataire" && prestataireEntrepriseId
        ? prestataireEntrepriseId
        : entrepriseId;

    const hasAccess = await hasAccessToEntreprise(currentUser.id, entrepriseIdToCheck);
    if (!hasAccess) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Résolution des entreprises visibles (les packs système IS NULL sont inclus automatiquement par la query)
    const entrepriseIds: string[] = [entrepriseId];

    if (prestataireEntrepriseId && !entrepriseIds.includes(prestataireEntrepriseId)) {
      entrepriseIds.push(prestataireEntrepriseId);
    }

    const packs = await getAvailableTacheListesTemplates({
      serviceId,
      entrepriseIds,
    });

    return { packs };
  });

// ==================== GET PACKS FOR MANAGER ====================

/**
 * Retourne tous les packs (actifs + inactifs) pour un propriétaire.
 * proprietaireEntrepriseId = null → packs système (réservé aux utilisateurs plateforme)
 */
export const getTacheListesTemplatesAction = actionClient
  .metadata({ actionName: "getTacheListesTemplatesAction" })
  .inputSchema(getTacheListesTemplatesSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { proprietaireEntrepriseId, serviceId } = parsedInput;

    if (proprietaireEntrepriseId === null) {
      // Templates système : réservé aux utilisateurs plateforme
      const isPlatform = await isPlatformUser(currentUser.id);
      if (!isPlatform) {
        throw errors.forbidden(
          "Seuls les utilisateurs plateforme peuvent gérer les templates système.",
        );
      }
    } else {
      const hasAccess = await hasAccessToEntreprise(
        currentUser.id,
        proprietaireEntrepriseId,
      );
      if (!hasAccess) {
        throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
      }
    }

    const packs = await getTacheListesTemplatesByProprietaire({
      proprietaireEntrepriseId,
      serviceId,
    });

    return { packs };
  });

// ==================== INSERT PACK ====================

/**
 * Crée un nouveau pack.
 * proprietaireEntrepriseId = null → pack système (réservé aux utilisateurs plateforme)
 */
export const insertTacheListeTemplateAction = actionClient
  .metadata({ actionName: "insertTacheListeTemplateAction" })
  .inputSchema(insertTacheListeTemplateSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { nom, serviceId, proprietaireEntrepriseId } = parsedInput;

    if (proprietaireEntrepriseId === null) {
      // Pack système : rôle plateforme requis
      const isPlatform = await isPlatformUser(currentUser.id);
      if (!isPlatform) {
        throw errors.forbidden(
          "Seuls les utilisateurs plateforme peuvent créer des templates système.",
        );
      }
    } else {
      const canManage = await canManageChecklists(
        currentUser.id,
        proprietaireEntrepriseId,
      );
      if (!canManage) {
        throw errors.forbidden(
          "Vous devez être au moins manager pour créer une checklist.",
        );
      }
    }

    const [pack] = await db
      .insert(tacheListesTemplates)
      .values({
        nom,
        serviceId,
        proprietaireEntrepriseId,
        actif: true,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      })
      .returning();

    return { pack };
  });

// ==================== UPDATE PACK ====================

export const updateTacheListeTemplateAction = actionClient
  .metadata({ actionName: "updateTacheListeTemplateAction" })
  .inputSchema(updateTacheListeTemplateSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { id, entrepriseId, nom, actif } = parsedInput;

    // Vérifier que le pack appartient à cette entreprise (ou rôle plateforme pour pack système)
    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    if (!platformRole?.role) {
      const hasSufficientRole = await canManageChecklists(currentUser.id, entrepriseId);
      if (!hasSufficientRole) {
        throw errors.forbidden(
          "Vous devez être au moins manager pour modifier une checklist.",
        );
      }

      const [packRow] = await db
        .select({
          proprietaireEntrepriseId:
            tacheListesTemplates.proprietaireEntrepriseId,
        })
        .from(tacheListesTemplates)
        .where(eq(tacheListesTemplates.id, id))
        .limit(1);

      if (!packRow) throw errors.notFound("Pack introuvable.");

      if (packRow.proprietaireEntrepriseId === null) {
        throw errors.forbidden(
          "Seuls les utilisateurs plateforme peuvent modifier les templates système.",
        );
      }
      if (packRow.proprietaireEntrepriseId !== entrepriseId) {
        throw errors.forbidden(
          "Vous ne pouvez modifier que vos propres packs.",
        );
      }
    }

    const updateData: Partial<typeof tacheListesTemplates.$inferInsert> = {
      updatedById: currentUser.id,
    };
    if (nom !== undefined) updateData.nom = nom;
    if (actif !== undefined) updateData.actif = actif;

    const [pack] = await db
      .update(tacheListesTemplates)
      .set(updateData)
      .where(eq(tacheListesTemplates.id, id))
      .returning();

    return { pack };
  });

// ==================== DELETE PACK ====================

export const deleteTacheListeTemplateAction = actionClient
  .metadata({ actionName: "deleteTacheListeTemplateAction" })
  .inputSchema(deleteTacheListeTemplateSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { id, entrepriseId } = parsedInput;

    // Vérifier propriété du pack (ou rôle plateforme)
    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    if (!platformRole?.role) {
      const hasSufficientRole = await canManageChecklists(currentUser.id, entrepriseId);
      if (!hasSufficientRole) {
        throw errors.forbidden(
          "Vous devez être au moins manager pour supprimer une checklist.",
        );
      }

      const [packRow] = await db
        .select({
          proprietaireEntrepriseId:
            tacheListesTemplates.proprietaireEntrepriseId,
        })
        .from(tacheListesTemplates)
        .where(eq(tacheListesTemplates.id, id))
        .limit(1);

      if (!packRow) throw errors.notFound("Pack introuvable.");
      if (packRow.proprietaireEntrepriseId === null) {
        throw errors.forbidden(
          "Seuls les utilisateurs plateforme peuvent supprimer les templates système.",
        );
      }
      if (packRow.proprietaireEntrepriseId !== entrepriseId) {
        throw errors.forbidden(
          "Vous ne pouvez supprimer que vos propres packs.",
        );
      }
    }

    // CASCADE supprime les items (ON DELETE CASCADE sur tache_liste_items.liste_template_id)
    // ON DELETE SET NULL sur client_services.tache_liste_template_id et client_service_executions
    await db
      .delete(tacheListesTemplates)
      .where(eq(tacheListesTemplates.id, id));

    return { success: true };
  });

// ==================== INSERT ITEM ====================

export const insertTacheListeItemAction = actionClient
  .metadata({ actionName: "insertTacheListeItemAction" })
  .inputSchema(insertTacheListeItemSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: ["description"] as const,
    });

    const { listeTemplateId, entrepriseId, titre, dureeEstimeeMinutes, emoji } =
      normalized;

    // Vérifier que le pack appartient à cette entreprise
    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    if (!platformRole?.role) {
      const hasSufficientRole = await canManageChecklists(currentUser.id, entrepriseId);
      if (!hasSufficientRole) {
        throw errors.forbidden(
          "Vous devez être au moins manager pour modifier une checklist.",
        );
      }

      const [packRow] = await db
        .select({
          proprietaireEntrepriseId:
            tacheListesTemplates.proprietaireEntrepriseId,
        })
        .from(tacheListesTemplates)
        .where(eq(tacheListesTemplates.id, listeTemplateId))
        .limit(1);

      if (!packRow) throw errors.notFound("Pack introuvable.");
      if (packRow.proprietaireEntrepriseId === null) {
        throw errors.forbidden(
          "Seuls les utilisateurs plateforme peuvent modifier les templates système.",
        );
      }
      if (packRow.proprietaireEntrepriseId !== entrepriseId) {
        throw errors.forbidden(
          "Vous ne pouvez modifier que vos propres packs.",
        );
      }
    }

    // Calculer le prochain ordre (max + 1)
    const [maxRow] = await db
      .select({ maxOrdre: max(tacheListeItems.ordre) })
      .from(tacheListeItems)
      .where(eq(tacheListeItems.listeTemplateId, listeTemplateId));

    const nextOrdre = (maxRow?.maxOrdre ?? 0) + 1;

    const [item] = await db
      .insert(tacheListeItems)
      .values({
        listeTemplateId,
        ordre: nextOrdre,
        titre,
        description: normalized.description ?? null,
        actif: true,
        dureeEstimeeMinutes: dureeEstimeeMinutes ?? null,
        emoji: emoji ?? null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      })
      .returning();

    return { item };
  });

// ==================== UPDATE ITEM ====================

export const updateTacheListeItemAction = actionClient
  .metadata({ actionName: "updateTacheListeItemAction" })
  .inputSchema(updateTacheListeItemSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: ["description"] as const,
    });

    const { id, entrepriseId, titre, ordre, actif, dureeEstimeeMinutes, emoji } =
      normalized;

    // Vérifier propriété via le pack
    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    if (!platformRole?.role) {
      const hasSufficientRole = await canManageChecklists(currentUser.id, entrepriseId);
      if (!hasSufficientRole) {
        throw errors.forbidden(
          "Vous devez être au moins manager pour modifier une checklist.",
        );
      }

      const [itemRow] = await db
        .select({
          proprietaireEntrepriseId:
            tacheListesTemplates.proprietaireEntrepriseId,
        })
        .from(tacheListeItems)
        .innerJoin(
          tacheListesTemplates,
          eq(tacheListesTemplates.id, tacheListeItems.listeTemplateId),
        )
        .where(eq(tacheListeItems.id, id))
        .limit(1);

      if (!itemRow) throw errors.notFound("Item introuvable.");
      if (itemRow.proprietaireEntrepriseId === null) {
        throw errors.forbidden(
          "Seuls les utilisateurs plateforme peuvent modifier les templates système.",
        );
      }
      if (itemRow.proprietaireEntrepriseId !== entrepriseId) {
        throw errors.forbidden(
          "Vous ne pouvez modifier que vos propres items.",
        );
      }
    }

    const updateData: Partial<typeof tacheListeItems.$inferInsert> = {
      updatedById: currentUser.id,
    };
    if (titre !== undefined) updateData.titre = titre;
    if (normalized.description !== undefined)
      updateData.description = normalized.description ?? null;
    if (ordre !== undefined) updateData.ordre = ordre;
    if (actif !== undefined) updateData.actif = actif;
    if (dureeEstimeeMinutes !== undefined)
      updateData.dureeEstimeeMinutes = dureeEstimeeMinutes;
    if (emoji !== undefined) updateData.emoji = emoji;

    const [item] = await db
      .update(tacheListeItems)
      .set(updateData)
      .where(eq(tacheListeItems.id, id))
      .returning();

    return { item };
  });

// ==================== DELETE ITEM ====================

export const deleteTacheListeItemAction = actionClient
  .metadata({ actionName: "deleteTacheListeItemAction" })
  .inputSchema(deleteTacheListeItemSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { id, entrepriseId } = parsedInput;

    // Récupérer l'item avec son pack en une seule query (nécessaire pour les checks ET la renumération)
    const [itemRow] = await db
      .select({
        proprietaireEntrepriseId: tacheListesTemplates.proprietaireEntrepriseId,
        listeTemplateId: tacheListeItems.listeTemplateId,
      })
      .from(tacheListeItems)
      .innerJoin(
        tacheListesTemplates,
        eq(tacheListesTemplates.id, tacheListeItems.listeTemplateId),
      )
      .where(eq(tacheListeItems.id, id))
      .limit(1);

    if (!itemRow) throw errors.notFound("Item introuvable.");

    // Vérifier propriété via le pack
    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    if (!platformRole?.role) {
      const hasSufficientRole = await canManageChecklists(currentUser.id, entrepriseId);
      if (!hasSufficientRole) {
        throw errors.forbidden(
          "Vous devez être au moins manager pour supprimer une tâche.",
        );
      }

      if (itemRow.proprietaireEntrepriseId === null) {
        throw errors.forbidden(
          "Seuls les utilisateurs plateforme peuvent modifier les templates système.",
        );
      }
      if (itemRow.proprietaireEntrepriseId !== entrepriseId) {
        throw errors.forbidden(
          "Vous ne pouvez supprimer que vos propres items.",
        );
      }
    }

    // Suppression + renumération dans une transaction atomique
    await db.transaction(async (tx) => {
      await tx.delete(tacheListeItems).where(eq(tacheListeItems.id, id));

      const remaining = await tx
        .select({ id: tacheListeItems.id })
        .from(tacheListeItems)
        .where(eq(tacheListeItems.listeTemplateId, itemRow.listeTemplateId))
        .orderBy(asc(tacheListeItems.ordre));

      for (let i = 0; i < remaining.length; i++) {
        await tx
          .update(tacheListeItems)
          .set({ ordre: i + 1, updatedById: currentUser.id })
          .where(eq(tacheListeItems.id, remaining[i].id));
      }
    });

    return { success: true };
  });

// ==================== REORDER ITEMS ====================

export const reorderTacheListeItemsAction = actionClient
  .metadata({ actionName: "reorderTacheListeItemsAction" })
  .inputSchema(reorderTacheListeItemsSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { listeTemplateId, entrepriseId, orderedIds } = parsedInput;

    // Vérifier propriété du pack
    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    if (!platformRole?.role) {
      const hasSufficientRole = await canManageChecklists(currentUser.id, entrepriseId);
      if (!hasSufficientRole) {
        throw errors.forbidden(
          "Vous devez être au moins manager pour réordonner les tâches.",
        );
      }

      const [packRow] = await db
        .select({
          proprietaireEntrepriseId:
            tacheListesTemplates.proprietaireEntrepriseId,
        })
        .from(tacheListesTemplates)
        .where(eq(tacheListesTemplates.id, listeTemplateId))
        .limit(1);

      if (!packRow) throw errors.notFound("Pack introuvable.");
      if (packRow.proprietaireEntrepriseId === null) {
        throw errors.forbidden(
          "Seuls les utilisateurs plateforme peuvent modifier les templates système.",
        );
      }
      if (packRow.proprietaireEntrepriseId !== entrepriseId) {
        throw errors.forbidden(
          "Vous ne pouvez modifier que vos propres packs.",
        );
      }
    }

    await db.transaction(async (tx) => {
      // Passe 1 : offset élevé pour éviter la contrainte unique (liste_template_id, ordre)
      // lors du réordonnancement (ex: swap ordre 1 et 2 créerait un doublon sinon)
      for (let i = 0; i < orderedIds.length; i++) {
        await tx
          .update(tacheListeItems)
          .set({ ordre: 10000 + i + 1 })
          .where(
            and(
              eq(tacheListeItems.id, orderedIds[i]),
              eq(tacheListeItems.listeTemplateId, listeTemplateId),
            ),
          );
      }
      // Passe 2 : ordre final
      for (let i = 0; i < orderedIds.length; i++) {
        await tx
          .update(tacheListeItems)
          .set({ ordre: i + 1, updatedById: currentUser.id })
          .where(
            and(
              eq(tacheListeItems.id, orderedIds[i]),
              eq(tacheListeItems.listeTemplateId, listeTemplateId),
            ),
          );
      }
    });

    const pack = await getTacheListeTemplateWithItems(listeTemplateId);

    return { pack };
  });

// ==================== GET SINGLE PACK BY ID ====================

/**
 * Retourne un pack avec ses items (actifs + inactifs) — pour preview.
 * Accessible si : pack système (proprietaireEntrepriseId = null)
 *              OU utilisateur a accès à l'entreprise propriétaire.
 */
export const getTacheListeTemplateAction = actionClient
  .metadata({ actionName: "getTacheListeTemplateAction" })
  .inputSchema(getTacheListeTemplateSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const pack = await getTacheListeTemplateWithItems(parsedInput.id);
    if (!pack) throw errors.notFound("Pack introuvable.");

    // Packs système : accessibles à tous les utilisateurs authentifiés
    if (pack.proprietaireEntrepriseId !== null) {
      const hasAccess = await hasAccessToEntreprise(
        currentUser.id,
        pack.proprietaireEntrepriseId,
      );
      if (!hasAccess) {
        throw errors.forbidden("Vous n'avez pas accès à cette checklist.");
      }
    }

    return { pack };
  });

// ==================== GET CHECKLISTS FOR PAGE ====================

/**
 * Action pour la page /app/checklists.
 *
 * Postures client/prestataire :
 *   - Packs système (actifs uniquement, read-only)
 *   - Packs de l'entreprise (tous, éditables)
 *
 * Posture plateforme :
 *   - proprietaireFilter = undefined → tous les packs (système + tous clients)
 *   - proprietaireFilter = null      → seulement les packs système
 *   - proprietaireFilter = uuid      → seulement les packs de cette entreprise
 */
export const getChecklistsForPageAction = actionClient
  .metadata({ actionName: "getChecklistsForPageAction" })
  .inputSchema(getChecklistsForPageSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { posture, entrepriseId, serviceId, proprietaireFilter } = parsedInput;

    if (posture === "plateforme") {
      const isPlatform = await isPlatformUser(currentUser.id);
      if (!isPlatform) {
        throw errors.forbidden("Accès réservé aux utilisateurs plateforme.");
      }

      // proprietaireFilter: undefined → tous, null → système, uuid → entreprise spécifique
      const packs = await getTacheListesWithServiceNames({
        proprietaireEntrepriseId: proprietaireFilter,
        serviceId,
        activeOnly: false,
      });

      return { systemPacks: [], ownPacks: packs };
    }

    // Posture client ou prestataire
    if (!entrepriseId) {
      throw errors.forbidden("entrepriseId obligatoire.");
    }

    const hasAccess = await hasAccessToEntreprise(currentUser.id, entrepriseId);
    if (!hasAccess) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Pour un prestataire, limiter aux services qu'il propose
    // Pour un client, retourner tous les services (pour le filtre)
    const [prestataireServices, allServices] = await Promise.all([
      posture === "prestataire"
        ? getServicesByEntrepriseId(entrepriseId).then((rows) =>
            rows.map((s) => ({ id: s.serviceId, nom: s.nom })),
          )
        : Promise.resolve(undefined),
      posture === "client"
        ? getAllServices().then((rows) =>
            rows.map((s) => ({ id: s.id, nom: s.nom })),
          )
        : Promise.resolve(undefined),
    ]);
    const prestataireServiceIds = prestataireServices?.map((s) => s.id);

    const [systemPacks, ownPacks] = await Promise.all([
      getTacheListesWithServiceNames({
        proprietaireEntrepriseId: null,
        serviceId,
        serviceIds: prestataireServiceIds,
        activeOnly: true,
      }),
      getTacheListesWithServiceNames({
        proprietaireEntrepriseId: entrepriseId,
        serviceId,
        serviceIds: prestataireServiceIds,
        activeOnly: false,
      }),
    ]);

    return {
      systemPacks,
      ownPacks,
      prestataireServices: prestataireServices ?? null,
      clientServices: allServices ?? null,
    };
  });
