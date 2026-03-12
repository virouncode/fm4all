"use server";

import { db } from "@/db";
import { userClientAdhesions, userClientSiteAttributions, userPrestataireAdhesions } from "@/db/schema/users";
import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import { getEffectivePlateformeRole } from "@/server/utils/permissions.utils";
import {
  getAvailableSitesForAttribution,
  getUserClientSiteAttributions,
} from "@/server/queries/userSiteAttributions.query";
import { isUserDescendant } from "@/server/utils/usersArborescence.utils";
import {
  canonizeAttributions,
  resolveUserEffectiveRoleOnSite,
  siteHasOtherEffectiveResponsable,
} from "@/server/utils/userClientSiteAttributions.utils";
import {
  bulkInsertMixedAttributionsFormSchema,
  bulkInsertUserSiteAttributionsFormSchema,
  deleteUserSiteAttributionSchema,
  insertUserSiteAttributionFormSchema,
  roleClientAttributionSchema,
  selectUserClientSiteAttributionSchema,
  updateUserSiteAttributionFormSchema,
} from "@/zod-schemas/userSiteAttribution.schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

// Helper: Get user's role level in enterprise
async function getUserRoleLevel(
  userId: string,
  entrepriseId: string,
): Promise<number> {
  // Check platform role first (level 4) — tout rôle plateforme = niveau 4
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) {
    return 4;
  }

  // Check enterprise client role avec statut actif
  const adhesion = await db.query.userClientAdhesions.findFirst({
    where: and(
      eq(userClientAdhesions.userId, userId),
      eq(userClientAdhesions.entrepriseId, entrepriseId),
      eq(userClientAdhesions.statut, "actif"),
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

// Helper: Empêche l'auto-attribution/suppression/modification de ses propres accès
function assertNoSelfAction(
  targetUserId: string,
  currentUserId: string,
  level: number,
  message: string,
): void {
  if (targetUserId !== currentUserId) return;
  const advisor = level >= 2 ? "un administrateur" : "votre responsable";
  throw errors.forbidden(`${message} Demandez à ${advisor}.`);
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
      assertNoSelfAction(parsedInput.userId, currentUser.id, 2, "Vous ne pouvez pas vous attribuer un rôle sur un site.");

      // Le manager ne peut pas attribuer responsable_site (réservé admin, §5)
      if (parsedInput.role === "responsable_site") {
        throw errors.forbidden(
          "Seul un administrateur peut attribuer le rôle responsable_site.",
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
      // (resolveUserEffectiveRoleOnSite prend en compte scope=subtree, contrairement à userHasRoleOnSite)
      const resolvedManagerRole = await resolveUserEffectiveRoleOnSite({
        userId: currentUser.id,
        siteId: parsedInput.siteId,
        entrepriseId: parsedInput.entrepriseId,
      });

      if (resolvedManagerRole !== "responsable_site") {
        throw errors.forbidden(
          "Vous ne pouvez attribuer que des sites où vous êtes responsable (avec scope=subtree).",
        );
      }
    }
    // Voie 3: Collaborateur avec délégation locale
    else if (currentUserLevel === 1) {
      assertNoSelfAction(parsedInput.userId, currentUser.id, 1, "Vous ne pouvez pas vous attribuer un rôle sur un site.");

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

    // §10 — Vérifier que la cible a une adhésion active dans l'entreprise
    const targetAdhesion = await db.query.userClientAdhesions.findFirst({
      where: and(
        eq(userClientAdhesions.userId, parsedInput.userId),
        eq(userClientAdhesions.entrepriseId, parsedInput.entrepriseId),
        eq(userClientAdhesions.statut, "actif"),
      ),
    });
    if (!targetAdhesion) {
      throw errors.forbidden(
        "L'utilisateur cible n'est pas membre actif de cette entreprise.",
      );
    }

    // Vérifier qu'aucun autre rôle n'existe déjà pour ce site (contrainte: un rôle par site)
    const existingAttribution = await db.query.userClientSiteAttributions.findFirst({
      where: and(
        eq(userClientSiteAttributions.userId, parsedInput.userId),
        eq(userClientSiteAttributions.siteId, parsedInput.siteId),
        eq(userClientSiteAttributions.entrepriseId, parsedInput.entrepriseId),
      ),
    });

    if (existingAttribution) {
      throw errors.conflict(
        `Cet utilisateur a déjà le rôle "${existingAttribution.role}" sur ce site. Un seul rôle par site est autorisé.`,
      );
    }

    // Insert attribution
    const [inserted] = await db
      .insert(userClientSiteAttributions)
      .values({
        userId: parsedInput.userId,
        siteId: parsedInput.siteId,
        mode: parsedInput.mode,
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

    const validated = selectUserClientSiteAttributionSchema.parse(inserted);
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
      assertNoSelfAction(parsedInput.userId, currentUser.id, 2, "Vous ne pouvez pas vous attribuer des rôles sur des sites.");

      // Le manager ne peut pas attribuer responsable_site (réservé admin, §5)
      if (parsedInput.role === "responsable_site") {
        throw errors.forbidden(
          "Seul un administrateur peut attribuer le rôle responsable_site.",
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
      // (resolveUserEffectiveRoleOnSite prend en compte scope=subtree, contrairement à userHasRoleOnSite)
      for (const siteId of parsedInput.siteIds) {
        const resolvedBulkRole = await resolveUserEffectiveRoleOnSite({
          userId: currentUser.id,
          siteId,
          entrepriseId: parsedInput.entrepriseId,
        });

        if (resolvedBulkRole !== "responsable_site") {
          throw errors.forbidden(
            "Vous ne pouvez attribuer que des sites où vous êtes responsable (avec scope=subtree).",
          );
        }
      }
    }
    // Voie 3: Collaborateur avec délégation locale
    else if (currentUserLevel === 1) {
      assertNoSelfAction(parsedInput.userId, currentUser.id, 1, "Vous ne pouvez pas vous attribuer des rôles sur des sites.");

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

    // §10 — Vérifier que la cible a une adhésion active dans l'entreprise
    const targetAdhesionBulk = await db.query.userClientAdhesions.findFirst({
      where: and(
        eq(userClientAdhesions.userId, parsedInput.userId),
        eq(userClientAdhesions.entrepriseId, parsedInput.entrepriseId),
        eq(userClientAdhesions.statut, "actif"),
      ),
    });
    if (!targetAdhesionBulk) {
      throw errors.forbidden(
        "L'utilisateur cible n'est pas membre actif de cette entreprise.",
      );
    }

    // Bulk insert
    const attributions = await db.transaction(async (tx) => {
      // Vérifier qu'aucun des siteIds n'a déjà une attribution (contrainte: un rôle par site)
      const existingAttributions = await tx.query.userClientSiteAttributions.findMany({
        where: and(
          eq(userClientSiteAttributions.userId, parsedInput.userId),
          eq(userClientSiteAttributions.entrepriseId, parsedInput.entrepriseId),
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
        .insert(userClientSiteAttributions)
        .values(values)
        .onConflictDoNothing()
        .returning();

      return inserted;
    });

    const validated = z
      .array(selectUserClientSiteAttributionSchema)
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
      assertNoSelfAction(parsedInput.userId, currentUser.id, 2, "Vous ne pouvez pas vous attribuer des rôles sur des sites.");

      // Le manager ne peut pas attribuer responsable_site (réservé admin, §5)
      if (roles.includes("responsable_site")) {
        throw errors.forbidden(
          "Seul un administrateur peut attribuer le rôle responsable_site.",
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
      // (resolveUserEffectiveRoleOnSite prend en compte scope=subtree, contrairement à userHasRoleOnSite)
      for (const siteId of uniqueSiteIds) {
        const resolvedMixedRole = await resolveUserEffectiveRoleOnSite({
          userId: currentUser.id,
          siteId,
          entrepriseId: parsedInput.entrepriseId,
        });

        if (resolvedMixedRole !== "responsable_site") {
          throw errors.forbidden(
            "Vous ne pouvez attribuer que des sites où vous êtes responsable (avec scope=subtree).",
          );
        }
      }
    }
    // Voie 3: Collaborateur avec délégation locale
    else if (currentUserLevel === 1) {
      assertNoSelfAction(parsedInput.userId, currentUser.id, 1, "Vous ne pouvez pas vous attribuer des rôles sur des sites.");

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

    // §10 — Vérifier que la cible a une adhésion active dans l'entreprise
    const targetAdhesionMixed = await db.query.userClientAdhesions.findFirst({
      where: and(
        eq(userClientAdhesions.userId, parsedInput.userId),
        eq(userClientAdhesions.entrepriseId, parsedInput.entrepriseId),
        eq(userClientAdhesions.statut, "actif"),
      ),
    });
    if (!targetAdhesionMixed) {
      throw errors.forbidden(
        "L'utilisateur cible n'est pas membre actif de cette entreprise.",
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
            .delete(userClientSiteAttributions)
            .where(
              and(
                eq(userClientSiteAttributions.id, exclusionId),
                eq(userClientSiteAttributions.userId, parsedInput.userId),
                eq(userClientSiteAttributions.entrepriseId, parsedInput.entrepriseId),
              ),
            );
        }
      }

      // 2. Filtrer canonized : exclure les attributions mode=inclure déjà couvertes par le DB existant
      // (ex: sous-site couvert par un subtree parent — supprimer l'exclusion suffit, pas besoin d'insérer)
      const canonizedToInsert: typeof canonized = [];
      for (const attr of canonized) {
        if (attr.mode === "exclure") {
          canonizedToInsert.push(attr);
          continue;
        }
        const effectiveRole = await resolveUserEffectiveRoleOnSite({
          userId: parsedInput.userId,
          siteId: attr.siteId,
          entrepriseId: parsedInput.entrepriseId,
          tx,
        });
        // Si l'existant couvre déjà ce site avec le même rôle → pas besoin d'insérer
        if (effectiveRole !== attr.role) {
          canonizedToInsert.push(attr);
        }
      }

      // 3. Vérifier qu'aucun des siteIds n'a déjà une attribution (contrainte: un rôle par site)
      const existingAttributions = await tx.query.userClientSiteAttributions.findMany(
        {
          where: and(
            eq(userClientSiteAttributions.userId, parsedInput.userId),
            eq(userClientSiteAttributions.entrepriseId, parsedInput.entrepriseId),
          ),
          columns: { siteId: true, role: true },
        },
      );

      const existingSiteIds = new Set(
        existingAttributions.map((a) => a.siteId),
      );
      const conflicts = canonizedToInsert
        .map((a) => a.siteId)
        .filter((siteId) => existingSiteIds.has(siteId));

      if (conflicts.length > 0) {
        throw errors.conflict(
          `${conflicts.length} site(s) ont déjà une attribution. Un seul rôle par site est autorisé.`,
        );
      }

      // 4. Préparer les values pour insertion
      const values = canonizedToInsert.map((attr) => ({
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
        .insert(userClientSiteAttributions)
        .values(values)
        .onConflictDoNothing()
        .returning();

      // ========================================
      // POST-INSERTION CLEANUP : Supprimer les lignes existantes devenues redondantes
      // ========================================

      // 1. Récupérer TOUTES les attributions de l'utilisateur (existantes + nouvelles)
      const allUserAttributions = await tx
        .select()
        .from(userClientSiteAttributions)
        .where(
          and(
            eq(userClientSiteAttributions.userId, parsedInput.userId),
            eq(userClientSiteAttributions.entrepriseId, parsedInput.entrepriseId),
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
            .delete(userClientSiteAttributions)
            .where(eq(userClientSiteAttributions.id, id));
        }
      }

      return { inserted, deletedCount: idsToDelete.length };
    });

    const validated = z
      .array(selectUserClientSiteAttributionSchema)
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
    const attribution = await db.query.userClientSiteAttributions.findFirst({
      where: eq(userClientSiteAttributions.id, parsedInput.id),
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
      assertNoSelfAction(parsedInput.userId, currentUser.id, 2, "Vous ne pouvez pas retirer vos propres attributions.");

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
      // (resolveUserEffectiveRoleOnSite prend en compte scope=subtree, contrairement à userHasRoleOnSite)
      const resolvedDeleteRole = await resolveUserEffectiveRoleOnSite({
        userId: currentUser.id,
        siteId: attribution.siteId,
        entrepriseId: attribution.entrepriseId,
      });

      if (resolvedDeleteRole !== "responsable_site") {
        throw errors.forbidden(
          "Vous ne pouvez retirer que des sites où vous êtes responsable (avec scope=subtree).",
        );
      }
    }
    // Voie 3: Collaborateur avec délégation locale
    else if (currentUserLevel === 1) {
      assertNoSelfAction(parsedInput.userId, currentUser.id, 1, "Vous ne pouvez pas retirer vos propres attributions.");

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
    // Tient compte des attributions scope=subtree des sites parents
    if (attribution.role === "responsable_site") {
      const hasOtherResponsable = await siteHasOtherEffectiveResponsable({
        siteId: attribution.siteId,
        entrepriseId: attribution.entrepriseId,
        excludeAttributionId: parsedInput.id,
      });

      if (!hasOtherResponsable) {
        throw errors.forbidden(
          "Impossible de supprimer cette attribution : le site doit toujours avoir au moins un responsable.",
        );
      }
    }

    // Delete
    await db
      .delete(userClientSiteAttributions)
      .where(eq(userClientSiteAttributions.id, parsedInput.id));

    return { success: true };
  });

// Action 4: Get user site attributions
export const getUserClientSiteAttributionsAction = actionClient
  .metadata({ actionName: "getUserClientSiteAttributionsAction" })
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
    const currentUser = session.user;

    // Vérifier que currentUser a accès à cette entreprise
    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    if (!platformRole?.role) {
      const [clientAdhesion, prestataireAdhesion] = await Promise.all([
        db.query.userClientAdhesions.findFirst({
          where: and(
            eq(userClientAdhesions.userId, currentUser.id),
            eq(userClientAdhesions.entrepriseId, parsedInput.entrepriseId),
            eq(userClientAdhesions.statut, "actif"),
          ),
        }),
        db.query.userPrestataireAdhesions.findFirst({
          where: and(
            eq(userPrestataireAdhesions.userId, currentUser.id),
            eq(userPrestataireAdhesions.entrepriseId, parsedInput.entrepriseId),
            eq(userPrestataireAdhesions.statut, "actif"),
          ),
        }),
      ]);

      if (!clientAdhesion && !prestataireAdhesion) {
        throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
      }
    }

    const { attributions, allSites } = await getUserClientSiteAttributions({
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
      role: roleClientAttributionSchema,
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
    // (resolveUserEffectiveRoleOnSite prend en compte scope=subtree, contrairement à userHasRoleOnSite)
    if (currentUserLevel === 2) {
      const filteredSites: typeof allAvailableSites = [];

      for (const site of allAvailableSites) {
        const resolvedAvailableRole = await resolveUserEffectiveRoleOnSite({
          userId: currentUser.id,
          siteId: site.id,
          entrepriseId: parsedInput.entrepriseId,
        });

        if (resolvedAvailableRole === "responsable_site") {
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
    const attribution = await db.query.userClientSiteAttributions.findFirst({
      where: eq(userClientSiteAttributions.id, parsedInput.id),
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
      assertNoSelfAction(parsedInput.userId, currentUser.id, 2, "Vous ne pouvez pas modifier vos propres attributions.");

      // Le manager ne peut pas attribuer responsable_site (réservé admin, §5)
      if (parsedInput.role === "responsable_site") {
        throw errors.forbidden(
          "Seul un administrateur peut attribuer le rôle responsable_site.",
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
      // (resolveUserEffectiveRoleOnSite prend en compte scope=subtree, contrairement à userHasRoleOnSite)
      const resolvedUpdateRole = await resolveUserEffectiveRoleOnSite({
        userId: currentUser.id,
        siteId: attribution.siteId,
        entrepriseId: attribution.entrepriseId,
      });

      if (resolvedUpdateRole !== "responsable_site") {
        throw errors.forbidden(
          "Vous ne pouvez modifier que des sites où vous êtes responsable (avec scope=subtree).",
        );
      }
    }
    // Voie 3: Collaborateur avec délégation locale
    else if (currentUserLevel === 1) {
      assertNoSelfAction(parsedInput.userId, currentUser.id, 1, "Vous ne pouvez pas modifier vos propres attributions.");

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

    // Garde-fou : Si on change responsable_site → autre rôle, vérifier qu'il reste au moins 1 responsable
    // Tient compte des attributions scope=subtree des sites parents
    if (
      attribution.role === "responsable_site" &&
      parsedInput.role !== "responsable_site"
    ) {
      const hasOtherResponsable = await siteHasOtherEffectiveResponsable({
        siteId: attribution.siteId,
        entrepriseId: attribution.entrepriseId,
        excludeAttributionId: parsedInput.id,
      });

      if (!hasOtherResponsable) {
        throw errors.forbidden(
          "Impossible de modifier ce rôle : le site doit toujours avoir au moins un responsable. Ajoutez un autre responsable avant de modifier ce rôle.",
        );
      }
    }

    // Vérifier si le nouveau rôle est déjà couvert par un ancêtre subtree
    // Si oui → supprimer la ligne (elle deviendrait redondante)
    // Si non → remplacer avec le nouveau rôle
    const txResult = await db.transaction(async (tx) => {
      // Supprimer la ligne actuelle
      await tx
        .delete(userClientSiteAttributions)
        .where(eq(userClientSiteAttributions.id, parsedInput.id));

      // Vérifier le rôle effectif sans cette ligne (parent subtree uniquement)
      const effectiveRoleWithout = await resolveUserEffectiveRoleOnSite({
        userId: attribution.userId,
        siteId: attribution.siteId,
        entrepriseId: attribution.entrepriseId,
        tx,
      });

      // Parent couvre déjà avec le même rôle → pas besoin de réinsérer
      if (effectiveRoleWithout === parsedInput.role) {
        return { attribution: null };
      }

      // Rôle différent ou pas de couverture → réinsérer avec le nouveau rôle
      const [inserted] = await tx
        .insert(userClientSiteAttributions)
        .values({
          userId: attribution.userId,
          siteId: attribution.siteId,
          mode: parsedInput.mode,
          scope: parsedInput.scope,
          role: parsedInput.role,
          entrepriseId: attribution.entrepriseId,
          createdById: attribution.createdById,
          updatedById: currentUser.id,
        })
        .returning();

      return { attribution: inserted };
    });

    const validated = txResult.attribution
      ? selectUserClientSiteAttributionSchema.parse(txResult.attribution)
      : null;
    return { attribution: validated };
  });
