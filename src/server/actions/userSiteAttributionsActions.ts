"use server";

import { db } from "@/db";
import { entrepriseRoles } from "@/db/schema/entreprises";
import { userAdhesions, userSiteAttributions } from "@/db/schema/users";
import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import {
  getAvailableSitesForAttribution,
  getUserSiteAttributions,
} from "@/server/queries/userSiteAttributions.query";
import { isUserDescendant } from "@/server/utils/usersArborescence.utils";
import {
  canonizeAttributions,
  resolveUserEffectiveRoleOnSite,
  userHasRoleOnSite,
} from "@/server/utils/userSiteAttributions.utils";
import {
  bulkInsertMixedAttributionsFormSchema,
  bulkInsertUserSiteAttributionsFormSchema,
  deleteUserSiteAttributionSchema,
  insertUserSiteAttributionFormSchema,
  roleAttributionSchema,
  selectUserSiteAttributionSchema,
  updateUserSiteAttributionFormSchema,
} from "@/zod-schemas/userSiteAttribution.schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

// Helper: Get user's role level in enterprise
async function getUserRoleLevel(
  userId: string,
  entrepriseId: string,
): Promise<number> {
  // Check platform role first (level 4)
  const platformRole = await getUserPlateformeAdhesion(userId);
  if (platformRole?.role === "super_admin_plateforme") {
    return 4;
  }

  // Check enterprise role
  const adhesion = await db.query.userAdhesions.findFirst({
    where: and(
      eq(userAdhesions.userId, userId),
      eq(userAdhesions.entrepriseId, entrepriseId),
    ),
  });

  if (!adhesion) return 0;

  const roleLevels: Record<string, number> = {
    admin: 3,
    manager: 2,
    collaborateur: 1,
  };

  return roleLevels[adhesion.role] || 0;
}

// Helper: Check if enterprise has "prestataire" role
async function isEntreprisePrestataire(
  entrepriseId: string,
): Promise<boolean> {
  const prestataireRole = await db.query.entrepriseRoles.findFirst({
    where: and(
      eq(entrepriseRoles.entrepriseId, entrepriseId),
      eq(entrepriseRoles.role, "prestataire"),
    ),
  });

  return !!prestataireRole;
}

// Action 1: Insert single attribution
export const insertUserSiteAttributionAction = actionClient
  .metadata({ actionName: "insertUserSiteAttributionAction" })
  .inputSchema(insertUserSiteAttributionFormSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) {
      throw errors.unauthorized("Vous n'êtes pas authentifié");
    }
    const currentUser = session.user;

    // Permission check (3 voies : Admin, Manager, Collaborateur avec délégation)
    const currentUserLevel = await getUserRoleLevel(
      currentUser.id,
      parsedInput.entrepriseId,
    );

    if (currentUserLevel < 1) {
      throw errors.unauthorized(
        "Vous n'avez pas les permissions nécessaires",
      );
    }

    // Voie 1: Admin/Super Admin → Tous les pouvoirs
    if (currentUserLevel >= 3) {
      // OK, continue
    }
    // Voie 2: Manager → Validations strictes
    else if (currentUserLevel === 2) {
      // NOUVEAU : Interdire l'auto-attribution
      if (parsedInput.userId === currentUser.id) {
        throw errors.forbidden(
          "Vous ne pouvez pas vous attribuer un rôle sur un site. Demandez à un administrateur.",
        );
      }

      // 1. Vérifier que targetUser est un descendant dans usersArborescence
      const isDescendant = await isUserDescendant({
        entrepriseId: parsedInput.entrepriseId,
        ancetreId: currentUser.id,
        descendantId: parsedInput.userId,
      });

      if (!isDescendant) {
        throw errors.forbidden(
          "Vous ne pouvez attribuer des sites qu'à vos subordonnés directs ou indirects.",
        );
      }

      // 2. Vérifier que le site fait partie des sites où le manager est responsable_site
      const isResponsable = await userHasRoleOnSite({
        userId: currentUser.id,
        siteId: parsedInput.siteId,
        role: "responsable_site",
        entrepriseId: parsedInput.entrepriseId,
      });

      if (!isResponsable) {
        throw errors.forbidden(
          "Vous ne pouvez attribuer que des sites où vous êtes responsable (avec scope=subtree).",
        );
      }
    }
    // Voie 3: Collaborateur avec délégation locale
    else if (currentUserLevel === 1) {
      // NOUVEAU : Interdire l'auto-attribution
      if (parsedInput.userId === currentUser.id) {
        throw errors.forbidden(
          "Vous ne pouvez pas vous attribuer un rôle sur un site. Demandez à votre responsable.",
        );
      }

      // Vérifier que le currentUser est responsable_site sur le site cible
      const resolved = await resolveUserEffectiveRoleOnSite({
        userId: currentUser.id,
        siteId: parsedInput.siteId,
        entrepriseId: parsedInput.entrepriseId,
      });

      if (resolved !== "responsable_site") {
        throw errors.forbidden(
          "Vous devez être responsable du site pour déléguer des accès.",
        );
      }

      // Ne peut déléguer que demandeur_site et observateur_site
      if (!["demandeur_site", "observateur_site"].includes(parsedInput.role)) {
        throw errors.forbidden(
          "Vous ne pouvez déléguer que les rôles demandeur et observateur.",
        );
      }

      // Vérifier que l'utilisateur cible est un descendant
      const isDescendant = await isUserDescendant({
        entrepriseId: parsedInput.entrepriseId,
        ancetreId: currentUser.id,
        descendantId: parsedInput.userId,
      });

      if (!isDescendant) {
        throw errors.forbidden(
          "Vous ne pouvez déléguer des accès qu'à vos subordonnés directs ou indirects.",
        );
      }
    } else {
      throw errors.unauthorized("Vous n'avez pas les permissions nécessaires");
    }

    // Validation contrainte prestataire : intervenant_site uniquement si posture=prestataire
    if (parsedInput.role === "intervenant_site") {
      const isPrestataire = await isEntreprisePrestataire(
        parsedInput.entrepriseId,
      );

      if (!isPrestataire) {
        throw errors.forbidden(
          "Le rôle 'intervenant_site' ne peut être attribué que dans une entreprise prestataire.",
        );
      }
    }

    // Vérifier qu'aucun autre rôle n'existe déjà pour ce site (contrainte: un rôle par site)
    const existingAttribution = await db.query.userSiteAttributions.findFirst({
      where: and(
        eq(userSiteAttributions.userId, parsedInput.userId),
        eq(userSiteAttributions.siteId, parsedInput.siteId),
        eq(userSiteAttributions.entrepriseId, parsedInput.entrepriseId),
      ),
    });

    if (existingAttribution) {
      throw errors.conflict(
        `Cet utilisateur a déjà le rôle "${existingAttribution.role}" sur ce site. Un seul rôle par site est autorisé.`,
      );
    }

    // Insert attribution
    const [inserted] = await db
      .insert(userSiteAttributions)
      .values({
        userId: parsedInput.userId,
        siteId: parsedInput.siteId,
        role: parsedInput.role,
        scope: parsedInput.scope,
        entrepriseId: parsedInput.entrepriseId,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      })
      .onConflictDoNothing()
      .returning();

    if (!inserted) {
      throw errors.conflict("Cette attribution existe déjà");
    }

    const validated = selectUserSiteAttributionSchema.parse(inserted);
    return { attribution: validated };
  });

// Action 2: Bulk insert attributions
export const bulkInsertUserSiteAttributionsAction = actionClient
  .metadata({ actionName: "bulkInsertUserSiteAttributionsAction" })
  .inputSchema(bulkInsertUserSiteAttributionsFormSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) {
      throw errors.unauthorized("Vous n'êtes pas authentifié");
    }
    const currentUser = session.user;

    // Permission check (3 voies : Admin, Manager, Collaborateur avec délégation)
    const currentUserLevel = await getUserRoleLevel(
      currentUser.id,
      parsedInput.entrepriseId,
    );

    if (currentUserLevel < 1) {
      throw errors.unauthorized(
        "Vous n'avez pas les permissions nécessaires",
      );
    }

    // Voie 1: Admin/Super Admin → Tous les pouvoirs
    if (currentUserLevel >= 3) {
      // OK, continue
    }
    // Voie 2: Manager → Validations strictes
    else if (currentUserLevel === 2) {
      // NOUVEAU : Interdire l'auto-attribution
      if (parsedInput.userId === currentUser.id) {
        throw errors.forbidden(
          "Vous ne pouvez pas vous attribuer des rôles sur des sites. Demandez à un administrateur.",
        );
      }

      // 1. Vérifier que targetUser est un descendant dans usersArborescence
      const isDescendant = await isUserDescendant({
        entrepriseId: parsedInput.entrepriseId,
        ancetreId: currentUser.id,
        descendantId: parsedInput.userId,
      });

      if (!isDescendant) {
        throw errors.forbidden(
          "Vous ne pouvez attribuer des sites qu'à vos subordonnés directs ou indirects.",
        );
      }

      // 2. Pour bulk insert, vérifier chaque siteId individuellement
      for (const siteId of parsedInput.siteIds) {
        const isResponsable = await userHasRoleOnSite({
          userId: currentUser.id,
          siteId,
          role: "responsable_site",
          entrepriseId: parsedInput.entrepriseId,
        });

        if (!isResponsable) {
          throw errors.forbidden(
            "Vous ne pouvez attribuer que des sites où vous êtes responsable (avec scope=subtree).",
          );
        }
      }
    }
    // Voie 3: Collaborateur avec délégation locale
    else if (currentUserLevel === 1) {
      // NOUVEAU : Interdire l'auto-attribution
      if (parsedInput.userId === currentUser.id) {
        throw errors.forbidden(
          "Vous ne pouvez pas vous attribuer des rôles sur des sites. Demandez à votre responsable.",
        );
      }

      // Ne peut déléguer que demandeur_site et observateur_site
      if (!["demandeur_site", "observateur_site"].includes(parsedInput.role)) {
        throw errors.forbidden(
          "Vous ne pouvez déléguer que les rôles demandeur et observateur.",
        );
      }

      // Vérifier que le currentUser est responsable_site sur chaque site
      for (const siteId of parsedInput.siteIds) {
        const resolved = await resolveUserEffectiveRoleOnSite({
          userId: currentUser.id,
          siteId,
          entrepriseId: parsedInput.entrepriseId,
        });

        if (resolved !== "responsable_site") {
          throw errors.forbidden(
            "Vous devez être responsable de chaque site pour déléguer des accès.",
          );
        }
      }

      // Vérifier que l'utilisateur cible est un descendant
      const isDescendant = await isUserDescendant({
        entrepriseId: parsedInput.entrepriseId,
        ancetreId: currentUser.id,
        descendantId: parsedInput.userId,
      });

      if (!isDescendant) {
        throw errors.forbidden(
          "Vous ne pouvez déléguer des accès qu'à vos subordonnés directs ou indirects.",
        );
      }
    } else {
      throw errors.unauthorized("Vous n'avez pas les permissions nécessaires");
    }

    // Validation contrainte prestataire : intervenant_site uniquement si posture=prestataire
    if (parsedInput.role === "intervenant_site") {
      const isPrestataire = await isEntreprisePrestataire(
        parsedInput.entrepriseId,
      );

      if (!isPrestataire) {
        throw errors.forbidden(
          "Le rôle 'intervenant_site' ne peut être attribué que dans une entreprise prestataire.",
        );
      }
    }

    // Bulk insert
    const attributions = await db.transaction(async (tx) => {
      // Vérifier qu'aucun des siteIds n'a déjà une attribution (contrainte: un rôle par site)
      const existingAttributions = await tx.query.userSiteAttributions.findMany({
        where: and(
          eq(userSiteAttributions.userId, parsedInput.userId),
          eq(userSiteAttributions.entrepriseId, parsedInput.entrepriseId),
        ),
        columns: { siteId: true, role: true },
      });

      const existingSiteIds = new Set(existingAttributions.map((a) => a.siteId));
      const conflicts = parsedInput.siteIds.filter((siteId) =>
        existingSiteIds.has(siteId),
      );

      if (conflicts.length > 0) {
        throw errors.conflict(
          `${conflicts.length} site(s) ont déjà une attribution. Un seul rôle par site est autorisé.`,
        );
      }

      const values = parsedInput.siteIds.map((siteId) => ({
        userId: parsedInput.userId,
        siteId,
        mode: parsedInput.mode,
        scope: parsedInput.scope,
        role: parsedInput.role,
        entrepriseId: parsedInput.entrepriseId,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      }));

      const inserted = await tx
        .insert(userSiteAttributions)
        .values(values)
        .onConflictDoNothing()
        .returning();

      return inserted;
    });

    const validated = z
      .array(selectUserSiteAttributionSchema)
      .parse(attributions);
    return { attributions: validated, count: validated.length };
  });

/**
 * Action 2b: Bulk insert MIXED attributions (mode/scope/role différents par site)
 * Utilisé pour les cas complexes : racines (inclure) + exclusions (exclure)
 * Applique la canonisation automatique pour supprimer les redondances
 */
export const bulkInsertMixedAttributionsAction = actionClient
  .metadata({ actionName: "bulkInsertMixedAttributionsAction" })
  .inputSchema(bulkInsertMixedAttributionsFormSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) {
      throw errors.unauthorized("Vous n'êtes pas authentifié");
    }
    const currentUser = session.user;

    // Permission check (3 voies : Admin, Manager, Collaborateur avec délégation)
    const currentUserLevel = await getUserRoleLevel(
      currentUser.id,
      parsedInput.entrepriseId,
    );

    if (currentUserLevel < 1) {
      throw errors.unauthorized(
        "Vous n'avez pas les permissions nécessaires",
      );
    }

    // Extraire tous les siteIds pour les validations
    const allSiteIds = parsedInput.attributions.map((a) => a.siteId);
    const uniqueSiteIds = [...new Set(allSiteIds)];

    // Validation : Pas de doublons dans les siteIds
    if (allSiteIds.length !== uniqueSiteIds.length) {
      throw errors.validation(
        "Impossible d'attribuer plusieurs fois le même site dans une seule requête.",
      );
    }

    // Extraire tous les rôles pour validation
    const roles = [...new Set(parsedInput.attributions.map((a) => a.role))];

    // Voie 1: Admin/Super Admin → Tous les pouvoirs
    if (currentUserLevel >= 3) {
      // OK, continue
    }
    // Voie 2: Manager → Validations strictes
    else if (currentUserLevel === 2) {
      // NOUVEAU : Interdire l'auto-attribution
      if (parsedInput.userId === currentUser.id) {
        throw errors.forbidden(
          "Vous ne pouvez pas vous attribuer des rôles sur des sites. Demandez à un administrateur.",
        );
      }

      // 1. Vérifier que targetUser est un descendant dans usersArborescence
      const isDescendant = await isUserDescendant({
        entrepriseId: parsedInput.entrepriseId,
        ancetreId: currentUser.id,
        descendantId: parsedInput.userId,
      });

      if (!isDescendant) {
        throw errors.forbidden(
          "Vous ne pouvez attribuer des sites qu'à vos subordonnés directs ou indirects.",
        );
      }

      // 2. Vérifier chaque siteId individuellement
      for (const siteId of uniqueSiteIds) {
        const isResponsable = await userHasRoleOnSite({
          userId: currentUser.id,
          siteId,
          role: "responsable_site",
          entrepriseId: parsedInput.entrepriseId,
        });

        if (!isResponsable) {
          throw errors.forbidden(
            "Vous ne pouvez attribuer que des sites où vous êtes responsable (avec scope=subtree).",
          );
        }
      }
    }
    // Voie 3: Collaborateur avec délégation locale
    else if (currentUserLevel === 1) {
      // NOUVEAU : Interdire l'auto-attribution
      if (parsedInput.userId === currentUser.id) {
        throw errors.forbidden(
          "Vous ne pouvez pas vous attribuer des rôles sur des sites. Demandez à votre responsable.",
        );
      }

      // Ne peut déléguer que demandeur_site et observateur_site
      const invalidRoles = roles.filter(
        (r) => !["demandeur_site", "observateur_site"].includes(r),
      );
      if (invalidRoles.length > 0) {
        throw errors.forbidden(
          "Vous ne pouvez déléguer que les rôles demandeur et observateur.",
        );
      }

      // Vérifier que le currentUser est responsable_site sur chaque site
      for (const siteId of uniqueSiteIds) {
        const resolved = await resolveUserEffectiveRoleOnSite({
          userId: currentUser.id,
          siteId,
          entrepriseId: parsedInput.entrepriseId,
        });

        if (resolved !== "responsable_site") {
          throw errors.forbidden(
            "Vous devez être responsable de chaque site pour déléguer des accès.",
          );
        }
      }

      // Vérifier que l'utilisateur cible est un descendant
      const isDescendant = await isUserDescendant({
        entrepriseId: parsedInput.entrepriseId,
        ancetreId: currentUser.id,
        descendantId: parsedInput.userId,
      });

      if (!isDescendant) {
        throw errors.forbidden(
          "Vous ne pouvez déléguer des accès qu'à vos subordonnés directs ou indirects.",
        );
      }
    } else {
      throw errors.unauthorized("Vous n'avez pas les permissions nécessaires");
    }

    // Validation contrainte prestataire : intervenant_site uniquement si posture=prestataire
    if (roles.includes("intervenant_site")) {
      const isPrestataire = await isEntreprisePrestataire(
        parsedInput.entrepriseId,
      );

      if (!isPrestataire) {
        throw errors.forbidden(
          "Le rôle 'intervenant_site' ne peut être attribué que dans une entreprise prestataire.",
        );
      }
    }

    // Validation contrainte mode/scope : mode=exclure MUST avoir scope=self
    const invalidExclusions = parsedInput.attributions.filter(
      (a) => a.mode === "exclure" && a.scope !== "self",
    );
    if (invalidExclusions.length > 0) {
      throw errors.validation(
        "Les exclusions (mode=exclure) doivent avoir scope=self.",
      );
    }

    // CANONISATION : Nettoyer les redondances AVANT insert
    const canonized = await canonizeAttributions({
      attributions: parsedInput.attributions,
      userId: parsedInput.userId,
      entrepriseId: parsedInput.entrepriseId,
    });

    // Bulk insert avec transaction
    const attributions = await db.transaction(async (tx) => {
      // 1. Supprimer les exclusions existantes si fourni (pour réactivation)
      if (parsedInput.exclusionsToDelete && parsedInput.exclusionsToDelete.length > 0) {
        for (const exclusionId of parsedInput.exclusionsToDelete) {
          await tx
            .delete(userSiteAttributions)
            .where(
              and(
                eq(userSiteAttributions.id, exclusionId),
                eq(userSiteAttributions.userId, parsedInput.userId),
                eq(userSiteAttributions.entrepriseId, parsedInput.entrepriseId),
              ),
            );
        }
      }

      // 2. Vérifier qu'aucun des siteIds n'a déjà une attribution (contrainte: un rôle par site)
      const existingAttributions = await tx.query.userSiteAttributions.findMany(
        {
          where: and(
            eq(userSiteAttributions.userId, parsedInput.userId),
            eq(userSiteAttributions.entrepriseId, parsedInput.entrepriseId),
          ),
          columns: { siteId: true, role: true },
        },
      );

      const existingSiteIds = new Set(
        existingAttributions.map((a) => a.siteId),
      );
      const conflicts = canonized
        .map((a) => a.siteId)
        .filter((siteId) => existingSiteIds.has(siteId));

      if (conflicts.length > 0) {
        throw errors.conflict(
          `${conflicts.length} site(s) ont déjà une attribution. Un seul rôle par site est autorisé.`,
        );
      }

      // 3. Préparer les values pour insertion
      const values = canonized.map((attr) => ({
        userId: parsedInput.userId,
        siteId: attr.siteId,
        mode: attr.mode,
        scope: attr.scope,
        role: attr.role,
        entrepriseId: parsedInput.entrepriseId,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      }));

      const inserted = await tx
        .insert(userSiteAttributions)
        .values(values)
        .onConflictDoNothing()
        .returning();

      // ========================================
      // POST-INSERTION CLEANUP : Supprimer les lignes existantes devenues redondantes
      // ========================================

      // 1. Récupérer TOUTES les attributions de l'utilisateur (existantes + nouvelles)
      const allUserAttributions = await tx
        .select()
        .from(userSiteAttributions)
        .where(
          and(
            eq(userSiteAttributions.userId, parsedInput.userId),
            eq(userSiteAttributions.entrepriseId, parsedInput.entrepriseId),
          ),
        );

      // 2. Convertir en format pour canonizeAttributions()
      const allAsInput = allUserAttributions.map((attr) => ({
        siteId: attr.siteId,
        mode: attr.mode,
        scope: attr.scope,
        role: attr.role,
      }));

      // 3. Re-canoniser TOUTES les attributions
      const canonizedAll = await canonizeAttributions({
        attributions: allAsInput,
        userId: parsedInput.userId,
        entrepriseId: parsedInput.entrepriseId,
      });

      // 4. Identifier les attributions à supprimer (celles dans DB mais PAS dans canonical)
      // Matching sur (siteId, mode, scope, role)
      const idsToDelete = allUserAttributions
        .filter((existing) => {
          // Chercher si cette attribution existe encore dans canonical
          const stillNeeded = canonizedAll.some(
            (canon) =>
              canon.siteId === existing.siteId &&
              canon.mode === existing.mode &&
              canon.scope === existing.scope &&
              canon.role === existing.role,
          );
          return !stillNeeded; // Si pas trouvée dans canonical → à supprimer
        })
        .map((attr) => attr.id);

      // 5. Supprimer les lignes devenues redondantes
      if (idsToDelete.length > 0) {
        for (const id of idsToDelete) {
          await tx
            .delete(userSiteAttributions)
            .where(eq(userSiteAttributions.id, id));
        }
      }

      return { inserted, deletedCount: idsToDelete.length };
    });

    const validated = z
      .array(selectUserSiteAttributionSchema)
      .parse(attributions.inserted);
    return {
      attributions: validated,
      count: validated.length,
      canonizedCount: canonized.length,
      originalCount: parsedInput.attributions.length,
      deletedCount: attributions.deletedCount,
    };
  });

// Action 3: Delete attribution
export const deleteUserSiteAttributionAction = actionClient
  .metadata({ actionName: "deleteUserSiteAttributionAction" })
  .inputSchema(deleteUserSiteAttributionSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) {
      throw errors.unauthorized("Vous n'êtes pas authentifié");
    }
    const currentUser = session.user;

    // Fetch attribution to get entrepriseId
    const attribution = await db.query.userSiteAttributions.findFirst({
      where: eq(userSiteAttributions.id, parsedInput.id),
    });

    if (!attribution) {
      throw errors.notFound("Attribution");
    }

    // Permission check (3 voies : Admin, Manager, Collaborateur avec délégation)
    const currentUserLevel = await getUserRoleLevel(
      currentUser.id,
      attribution.entrepriseId,
    );

    if (currentUserLevel < 1) {
      throw errors.unauthorized(
        "Vous n'avez pas les permissions nécessaires",
      );
    }

    // Voie 1: Admin/Super Admin → Tous les pouvoirs
    if (currentUserLevel >= 3) {
      // OK, continue
    }
    // Voie 2: Manager → Validations strictes
    else if (currentUserLevel === 2) {
      // NOUVEAU : Interdire l'auto-suppression
      if (parsedInput.userId === currentUser.id) {
        throw errors.forbidden(
          "Vous ne pouvez pas retirer vos propres attributions. Demandez à un administrateur.",
        );
      }

      // 1. Vérifier que targetUser est un descendant dans usersArborescence
      const isDescendant = await isUserDescendant({
        entrepriseId: attribution.entrepriseId,
        ancetreId: currentUser.id,
        descendantId: parsedInput.userId,
      });

      if (!isDescendant) {
        throw errors.forbidden(
          "Vous ne pouvez retirer des sites qu'à vos subordonnés directs ou indirects.",
        );
      }

      // 2. Vérifier que le site fait partie des sites où le manager est responsable_site
      const isResponsable = await userHasRoleOnSite({
        userId: currentUser.id,
        siteId: attribution.siteId,
        role: "responsable_site",
        entrepriseId: attribution.entrepriseId,
      });

      if (!isResponsable) {
        throw errors.forbidden(
          "Vous ne pouvez retirer que des sites où vous êtes responsable (avec scope=subtree).",
        );
      }
    }
    // Voie 3: Collaborateur avec délégation locale
    else if (currentUserLevel === 1) {
      // NOUVEAU : Interdire l'auto-suppression
      if (parsedInput.userId === currentUser.id) {
        throw errors.forbidden(
          "Vous ne pouvez pas retirer vos propres attributions. Demandez à votre responsable.",
        );
      }

      // Ne peut retirer que demandeur_site et observateur_site
      if (!["demandeur_site", "observateur_site"].includes(attribution.role)) {
        throw errors.forbidden(
          "Vous ne pouvez retirer que les rôles demandeur et observateur que vous avez délégués.",
        );
      }

      // Vérifier que le currentUser est responsable_site sur le site de l'attribution
      const resolved = await resolveUserEffectiveRoleOnSite({
        userId: currentUser.id,
        siteId: attribution.siteId,
        entrepriseId: attribution.entrepriseId,
      });

      if (resolved !== "responsable_site") {
        throw errors.forbidden(
          "Vous devez être responsable du site pour retirer des accès délégués.",
        );
      }

      // Vérifier que l'utilisateur cible est un descendant
      const isDescendant = await isUserDescendant({
        entrepriseId: attribution.entrepriseId,
        ancetreId: currentUser.id,
        descendantId: parsedInput.userId,
      });

      if (!isDescendant) {
        throw errors.forbidden(
          "Vous ne pouvez retirer des accès qu'à vos subordonnés directs ou indirects.",
        );
      }
    } else {
      throw errors.unauthorized("Vous n'avez pas les permissions nécessaires");
    }

    // Garde-fou : Ne jamais supprimer le dernier responsable_site d'un site
    if (attribution.role === "responsable_site") {
      const otherResponsables = await db.query.userSiteAttributions.findMany({
        where: and(
          eq(userSiteAttributions.siteId, attribution.siteId),
          eq(userSiteAttributions.role, "responsable_site"),
          eq(userSiteAttributions.entrepriseId, attribution.entrepriseId),
        ),
      });

      if (otherResponsables.length === 1) {
        throw errors.forbidden(
          "Impossible de supprimer cette attribution : le site doit toujours avoir au moins un responsable.",
        );
      }
    }

    // Delete
    await db
      .delete(userSiteAttributions)
      .where(eq(userSiteAttributions.id, parsedInput.id));

    return { success: true };
  });

// Action 4: Get user site attributions
export const getUserSiteAttributionsAction = actionClient
  .metadata({ actionName: "getUserSiteAttributionsAction" })
  .inputSchema(
    z.object({
      userId: z.uuid("ID utilisateur invalide"),
      entrepriseId: z.uuid("ID entreprise invalide"),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) {
      throw errors.unauthorized("Vous n'êtes pas authentifié");
    }

    const { attributions, allSites } = await getUserSiteAttributions({
      userId: parsedInput.userId,
      entrepriseId: parsedInput.entrepriseId,
    });

    return { attributions, allSites };
  });

// Action 5: Get available sites for attribution
export const getAvailableSitesForAttributionAction = actionClient
  .metadata({ actionName: "getAvailableSitesForAttributionAction" })
  .inputSchema(
    z.object({
      userId: z.uuid("ID utilisateur invalide"),
      entrepriseId: z.uuid("ID entreprise invalide"),
      role: roleAttributionSchema,
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) {
      throw errors.unauthorized("Vous n'êtes pas authentifié");
    }
    const currentUser = session.user;

    // Permission check et filtrage selon le niveau de l'utilisateur actuel
    const currentUserLevel = await getUserRoleLevel(
      currentUser.id,
      parsedInput.entrepriseId,
    );

    if (currentUserLevel < 1) {
      throw errors.unauthorized("Vous n'avez pas les permissions nécessaires");
    }

    // Récupérer TOUS les sites de l'entreprise non attribués au userId cible
    const allAvailableSites = await getAvailableSitesForAttribution(
      parsedInput.userId,
      parsedInput.entrepriseId,
      parsedInput.role,
    );

    // Voie 1 : Admin/Super Admin → Retourner tous les sites
    if (currentUserLevel >= 3) {
      return { sites: allAvailableSites };
    }

    // Voie 2 : Manager → Filtrer les sites où il est responsable_site
    if (currentUserLevel === 2) {
      const filteredSites: typeof allAvailableSites = [];

      for (const site of allAvailableSites) {
        const isResponsable = await userHasRoleOnSite({
          userId: currentUser.id,
          siteId: site.id,
          role: "responsable_site",
          entrepriseId: parsedInput.entrepriseId,
        });

        if (isResponsable) {
          filteredSites.push(site);
        }
      }

      return { sites: filteredSites };
    }

    // Voie 3 : Collaborateur → Filtrer les sites où il est responsable_site
    if (currentUserLevel === 1) {
      const filteredSites: typeof allAvailableSites = [];

      for (const site of allAvailableSites) {
        const resolved = await resolveUserEffectiveRoleOnSite({
          userId: currentUser.id,
          siteId: site.id,
          entrepriseId: parsedInput.entrepriseId,
        });

        if (resolved === "responsable_site") {
          filteredSites.push(site);
        }
      }

      return { sites: filteredSites };
    }

    // Fallback (ne devrait jamais arriver)
    return { sites: [] };
  });

// Action 6: Update attribution
export const updateUserSiteAttributionAction = actionClient
  .metadata({ actionName: "updateUserSiteAttributionAction" })
  .inputSchema(updateUserSiteAttributionFormSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) {
      throw errors.unauthorized("Vous n'êtes pas authentifié");
    }
    const currentUser = session.user;

    // Fetch attribution to get entrepriseId
    const attribution = await db.query.userSiteAttributions.findFirst({
      where: eq(userSiteAttributions.id, parsedInput.id),
    });

    if (!attribution) {
      throw errors.notFound("Attribution");
    }

    // Permission check (3 voies : Admin, Manager, Collaborateur avec délégation)
    const currentUserLevel = await getUserRoleLevel(
      currentUser.id,
      attribution.entrepriseId,
    );

    if (currentUserLevel < 1) {
      throw errors.unauthorized(
        "Vous n'avez pas les permissions nécessaires",
      );
    }

    // Voie 1: Admin/Super Admin → Tous les pouvoirs
    if (currentUserLevel >= 3) {
      // OK, continue
    }
    // Voie 2: Manager → Validations strictes
    else if (currentUserLevel === 2) {
      // NOUVEAU : Interdire l'auto-modification
      if (parsedInput.userId === currentUser.id) {
        throw errors.forbidden(
          "Vous ne pouvez pas modifier vos propres attributions. Demandez à un administrateur.",
        );
      }

      // 1. Vérifier que targetUser est un descendant dans usersArborescence
      const isDescendant = await isUserDescendant({
        entrepriseId: attribution.entrepriseId,
        ancetreId: currentUser.id,
        descendantId: parsedInput.userId,
      });

      if (!isDescendant) {
        throw errors.forbidden(
          "Vous ne pouvez modifier des attributions que pour vos subordonnés directs ou indirects.",
        );
      }

      // 2. Vérifier que le site fait partie des sites où le manager est responsable_site
      const isResponsable = await userHasRoleOnSite({
        userId: currentUser.id,
        siteId: attribution.siteId,
        role: "responsable_site",
        entrepriseId: attribution.entrepriseId,
      });

      if (!isResponsable) {
        throw errors.forbidden(
          "Vous ne pouvez modifier que des sites où vous êtes responsable (avec scope=subtree).",
        );
      }
    }
    // Voie 3: Collaborateur avec délégation locale
    else if (currentUserLevel === 1) {
      // NOUVEAU : Interdire l'auto-modification
      if (parsedInput.userId === currentUser.id) {
        throw errors.forbidden(
          "Vous ne pouvez pas modifier vos propres attributions. Demandez à votre responsable.",
        );
      }

      // Ne peut modifier que vers demandeur_site ou observateur_site
      if (!["demandeur_site", "observateur_site"].includes(parsedInput.role)) {
        throw errors.forbidden(
          "Vous ne pouvez modifier que vers les rôles demandeur et observateur.",
        );
      }

      // Vérifier que le currentUser est responsable_site sur le site de l'attribution
      const resolved = await resolveUserEffectiveRoleOnSite({
        userId: currentUser.id,
        siteId: attribution.siteId,
        entrepriseId: attribution.entrepriseId,
      });

      if (resolved !== "responsable_site") {
        throw errors.forbidden(
          "Vous devez être responsable du site pour modifier des accès délégués.",
        );
      }

      // Vérifier que l'utilisateur cible est un descendant
      const isDescendant = await isUserDescendant({
        entrepriseId: attribution.entrepriseId,
        ancetreId: currentUser.id,
        descendantId: parsedInput.userId,
      });

      if (!isDescendant) {
        throw errors.forbidden(
          "Vous ne pouvez modifier des accès que pour vos subordonnés directs ou indirects.",
        );
      }
    } else {
      throw errors.unauthorized("Vous n'avez pas les permissions nécessaires");
    }

    // Validation contrainte prestataire : intervenant_site uniquement si posture=prestataire
    if (parsedInput.role === "intervenant_site") {
      const isPrestataire = await isEntreprisePrestataire(
        attribution.entrepriseId,
      );

      if (!isPrestataire) {
        throw errors.forbidden(
          "Le rôle 'intervenant_site' ne peut être attribué que dans une entreprise prestataire.",
        );
      }
    }

    // Garde-fou : Si on change responsable_site → autre rôle, vérifier qu'il reste au moins 1 responsable
    if (
      attribution.role === "responsable_site" &&
      parsedInput.role !== "responsable_site"
    ) {
      const otherResponsables = await db.query.userSiteAttributions.findMany({
        where: and(
          eq(userSiteAttributions.siteId, attribution.siteId),
          eq(userSiteAttributions.role, "responsable_site"),
          eq(userSiteAttributions.entrepriseId, attribution.entrepriseId),
        ),
      });

      if (otherResponsables.length === 1) {
        throw errors.forbidden(
          "Impossible de modifier ce rôle : le site doit toujours avoir au moins un responsable. Ajoutez un autre responsable avant de modifier ce rôle.",
        );
      }
    }

    // Validation contrainte mode/scope : mode=exclure MUST avoir scope=self
    if (parsedInput.mode === "exclure" && parsedInput.scope !== "self") {
      throw errors.validation(
        "Les exclusions (mode=exclure) doivent avoir scope=self.",
      );
    }

    // Update
    const [updated] = await db
      .update(userSiteAttributions)
      .set({
        mode: parsedInput.mode,
        scope: parsedInput.scope,
        role: parsedInput.role,
        updatedById: currentUser.id,
      })
      .where(eq(userSiteAttributions.id, parsedInput.id))
      .returning();

    const validated = selectUserSiteAttributionSchema.parse(updated);
    return { attribution: validated };
  });
