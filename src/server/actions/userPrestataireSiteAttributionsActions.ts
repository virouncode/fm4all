"use server";

import { db } from "@/db";
import { clientPrestataireRelations } from "@/db/schema/entreprises";
import { sitesArborescence } from "@/db/schema/sites";
import {
  userPrestataireAdhesions,
  userPrestataireSiteAttributions,
} from "@/db/schema/users";
import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import { getUserPrestataireSiteAttributions } from "@/server/queries/userPrestataireSiteAttributions.query";
import { getEffectivePlateformeRole } from "@/server/utils/permissions.utils";
import { isUserDescendant } from "@/server/utils/usersArborescence.utils";
import {
  bulkInsertMixedPrestataireAttributionsFormSchema,
  selectUserPrestataireSiteAttributionSchema,
} from "@/zod-schemas/userSiteAttribution.schema";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

// ==================== HELPERS ====================

/**
 * Retourne le niveau de rôle de l'utilisateur dans l'entreprise prestataire.
 * 4 = super_admin_plateforme, 3 = admin, 2 = manager, 1 = collaborateur, 0 = aucun accès
 */
async function getPrestatairRoleLevel(
  userId: string,
  prestataireEntrepriseId: string,
): Promise<number> {
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role === "super_admin_plateforme") return 4;

  const adhesion = await db.query.userPrestataireAdhesions.findFirst({
    where: and(
      eq(userPrestataireAdhesions.userId, userId),
      eq(userPrestataireAdhesions.entrepriseId, prestataireEntrepriseId),
    ),
  });

  if (!adhesion) return 0;

  const roleLevels: Record<string, number> = {
    admin: 3,
    manager: 2,
    collaborateur: 1,
  };
  return roleLevels[adhesion.role] ?? 0;
}

/**
 * Vérifie si l'utilisateur prestataire est responsable_site sur un site client donné.
 * Résolution simple : cherche une attribution directe mode=inclure, role=responsable_site
 * ou un ancêtre avec scope=subtree, mode=inclure, role=responsable_site sans exclusion.
 */
async function prestataireUserHasResponsabiliteOnSite(
  userId: string,
  siteId: string,
  clientEntrepriseId: string,
): Promise<boolean> {
  // Attribution directe ?
  const directAttr = await db.query.userPrestataireSiteAttributions.findFirst({
    where: and(
      eq(userPrestataireSiteAttributions.userId, userId),
      eq(userPrestataireSiteAttributions.siteId, siteId),
      eq(userPrestataireSiteAttributions.entrepriseId, clientEntrepriseId),
      eq(userPrestataireSiteAttributions.role, "responsable_site"),
      eq(userPrestataireSiteAttributions.mode, "inclure"),
    ),
  });
  if (directAttr) return true;

  // Chercher via héritage subtree
  const ancestors = await db
    .select({ ancetreId: sitesArborescence.ancetreId })
    .from(sitesArborescence)
    .where(
      and(
        eq(sitesArborescence.descendantId, siteId),
        eq(sitesArborescence.entrepriseId, clientEntrepriseId),
      ),
    );

  const ancestorIds = ancestors
    .map((a) => a.ancetreId)
    .filter((id): id is string => id !== null && id !== siteId);

  if (ancestorIds.length === 0) return false;

  const subtreeAttr = await db.query.userPrestataireSiteAttributions.findFirst({
    where: and(
      eq(userPrestataireSiteAttributions.userId, userId),
      eq(userPrestataireSiteAttributions.entrepriseId, clientEntrepriseId),
      eq(userPrestataireSiteAttributions.role, "responsable_site"),
      eq(userPrestataireSiteAttributions.mode, "inclure"),
      eq(userPrestataireSiteAttributions.scope, "subtree"),
      inArray(userPrestataireSiteAttributions.siteId, ancestorIds),
    ),
  });

  if (!subtreeAttr) return false;

  // Vérifier qu'il n'y a pas d'exclusion directe sur ce site
  const exclusion = await db.query.userPrestataireSiteAttributions.findFirst({
    where: and(
      eq(userPrestataireSiteAttributions.userId, userId),
      eq(userPrestataireSiteAttributions.siteId, siteId),
      eq(userPrestataireSiteAttributions.entrepriseId, clientEntrepriseId),
      eq(userPrestataireSiteAttributions.mode, "exclure"),
    ),
  });

  return !exclusion;
}

// ==================== ACTION : SUPPRESSION ====================

export const deleteUserPrestataireSiteAttributionAction = actionClient
  .metadata({ actionName: "deleteUserPrestataireSiteAttributionAction" })
  .inputSchema(
    z.object({
      id: z.uuid("ID attribution invalide"),
      userId: z.uuid("ID utilisateur invalide"),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }
    const currentUser = session.user;

    // Récupérer l'attribution pour connaître son contexte
    const attribution = await db.query.userPrestataireSiteAttributions.findFirst(
      {
        where: and(
          eq(userPrestataireSiteAttributions.id, parsedInput.id),
          eq(userPrestataireSiteAttributions.userId, parsedInput.userId),
        ),
      },
    );
    if (!attribution) {
      throw errors.notFound("Attribution non trouvée.");
    }

    // Récupérer l'entreprise prestataire
    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    let prestataireEntrepriseId: string;

    if (platformRole?.role) {
      const targetAdhesion = await db.query.userPrestataireAdhesions.findFirst({
        where: eq(userPrestataireAdhesions.userId, parsedInput.userId),
      });
      if (!targetAdhesion) {
        throw errors.notFound(
          "L'utilisateur cible n'est pas membre d'une entreprise prestataire.",
        );
      }
      prestataireEntrepriseId = targetAdhesion.entrepriseId;
    } else {
      const prestataireAdhesion =
        await db.query.userPrestataireAdhesions.findFirst({
          where: and(
            eq(userPrestataireAdhesions.userId, currentUser.id),
            eq(userPrestataireAdhesions.statut, "actif"),
          ),
        });
      if (!prestataireAdhesion) {
        throw errors.forbidden("Accès refusé.");
      }
      prestataireEntrepriseId = prestataireAdhesion.entrepriseId;

      const relation = await db.query.clientPrestataireRelations.findFirst({
        where: and(
          eq(
            clientPrestataireRelations.clientEntrepriseId,
            attribution.entrepriseId,
          ),
          eq(
            clientPrestataireRelations.prestataireEntrepriseId,
            prestataireEntrepriseId,
          ),
        ),
      });
      if (!relation) {
        throw errors.forbidden(
          "Vous n'avez pas accès aux sites de ce client.",
        );
      }
    }

    const currentUserLevel = await getPrestatairRoleLevel(
      currentUser.id,
      prestataireEntrepriseId,
    );

    if (currentUserLevel < 2) {
      throw errors.forbidden("Vous n'avez pas les permissions nécessaires.");
    }

    // Manager : ne peut supprimer que les attributions de ses subordonnés
    if (currentUserLevel === 2 && parsedInput.userId !== currentUser.id) {
      const isDescendant = await isUserDescendant({
        entrepriseId: prestataireEntrepriseId,
        ancetreId: currentUser.id,
        descendantId: parsedInput.userId,
      });
      if (!isDescendant) {
        throw errors.forbidden(
          "Vous ne pouvez supprimer que les attributions de vos subordonnés.",
        );
      }
    }

    await db
      .delete(userPrestataireSiteAttributions)
      .where(
        and(
          eq(userPrestataireSiteAttributions.id, parsedInput.id),
          eq(userPrestataireSiteAttributions.userId, parsedInput.userId),
        ),
      );

    return { deleted: true };
  });

// ==================== ACTION : LECTURE ====================

export const getUserPrestataireSiteAttributionsAction = actionClient
  .metadata({ actionName: "getUserPrestataireSiteAttributionsAction" })
  .inputSchema(
    z.object({
      userId: z.uuid("ID utilisateur invalide"),
      clientEntrepriseId: z.uuid("ID entreprise cliente invalide"),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }
    const currentUser = session.user;

    // Plateforme → autorisé
    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    if (!platformRole?.role) {
      // Vérifier adhésion prestataire active (ATTR-04)
      const prestataireAdhesion =
        await db.query.userPrestataireAdhesions.findFirst({
          where: and(
            eq(userPrestataireAdhesions.userId, currentUser.id),
            eq(userPrestataireAdhesions.statut, "actif"),
          ),
        });
      if (!prestataireAdhesion) {
        throw errors.forbidden("Accès refusé.");
      }

      // Vérifier relation client-prestataire
      const relation = await db.query.clientPrestataireRelations.findFirst({
        where: and(
          eq(
            clientPrestataireRelations.clientEntrepriseId,
            parsedInput.clientEntrepriseId,
          ),
          eq(
            clientPrestataireRelations.prestataireEntrepriseId,
            prestataireAdhesion.entrepriseId,
          ),
        ),
      });
      if (!relation) {
        throw errors.forbidden(
          "Vous n'avez pas accès aux sites de ce client.",
        );
      }
    }

    const result = await getUserPrestataireSiteAttributions({
      userId: parsedInput.userId,
      clientEntrepriseId: parsedInput.clientEntrepriseId,
    });

    return result;
  });

// ==================== ACTION : ÉCRITURE ====================

export const bulkInsertMixedPrestataireAttributionsAction = actionClient
  .metadata({ actionName: "bulkInsertMixedPrestataireAttributionsAction" })
  .inputSchema(bulkInsertMixedPrestataireAttributionsFormSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }
    const currentUser = session.user;

    // Récupérer l'adhésion prestataire du current user (pour connaître son entreprise)
    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    let prestataireEntrepriseId: string;

    if (platformRole?.role) {
      // Plateforme → utiliser l'entreprise du user cible
      const targetAdhesion = await db.query.userPrestataireAdhesions.findFirst({
        where: eq(userPrestataireAdhesions.userId, parsedInput.userId),
      });
      if (!targetAdhesion) {
        throw errors.notFound(
          "L'utilisateur cible n'est pas membre d'une entreprise prestataire.",
        );
      }
      prestataireEntrepriseId = targetAdhesion.entrepriseId;
    } else {
      // ATTR-04 — vérifier adhésion prestataire active
      const prestataireAdhesion =
        await db.query.userPrestataireAdhesions.findFirst({
          where: and(
            eq(userPrestataireAdhesions.userId, currentUser.id),
            eq(userPrestataireAdhesions.statut, "actif"),
          ),
        });
      if (!prestataireAdhesion) {
        throw errors.forbidden("Accès refusé.");
      }
      prestataireEntrepriseId = prestataireAdhesion.entrepriseId;

      // Vérifier relation client-prestataire
      const relation = await db.query.clientPrestataireRelations.findFirst({
        where: and(
          eq(
            clientPrestataireRelations.clientEntrepriseId,
            parsedInput.clientEntrepriseId,
          ),
          eq(
            clientPrestataireRelations.prestataireEntrepriseId,
            prestataireEntrepriseId,
          ),
        ),
      });
      if (!relation) {
        throw errors.forbidden(
          "Vous n'avez pas accès aux sites de ce client.",
        );
      }
    }

    // Niveau de permission du current user dans l'entreprise prestataire
    const currentUserLevel = await getPrestatairRoleLevel(
      currentUser.id,
      prestataireEntrepriseId,
    );

    if (currentUserLevel < 1) {
      throw errors.forbidden("Vous n'avez pas les permissions nécessaires.");
    }

    // Validation : Pas de doublons dans les siteIds
    const allSiteIds = parsedInput.attributions.map((a) => a.siteId);
    const uniqueSiteIds = [...new Set(allSiteIds)];
    if (allSiteIds.length !== uniqueSiteIds.length) {
      throw errors.validation(
        "Impossible d'attribuer plusieurs fois le même site dans une seule requête.",
      );
    }

    const roles = [
      ...new Set(parsedInput.attributions.map((a) => a.role)),
    ];

    if (currentUserLevel >= 3) {
      // Admin / plateforme → OK
    } else if (currentUserLevel === 2) {
      // Manager prestataire — ne peut pas attribuer responsable_site (réservé admin, §5)
      if (roles.includes("responsable_site")) {
        throw errors.forbidden(
          "Seul un administrateur peut attribuer le rôle responsable_site.",
        );
      }

      if (parsedInput.userId === currentUser.id) {
        throw errors.forbidden(
          "Vous ne pouvez pas vous attribuer des rôles sur des sites. Demandez à un administrateur.",
        );
      }

      const isDescendant = await isUserDescendant({
        entrepriseId: prestataireEntrepriseId,
        ancetreId: currentUser.id,
        descendantId: parsedInput.userId,
      });
      if (!isDescendant) {
        throw errors.forbidden(
          "Vous ne pouvez attribuer des sites qu'à vos subordonnés directs ou indirects.",
        );
      }

      for (const siteId of uniqueSiteIds) {
        const hasResponsabilite = await prestataireUserHasResponsabiliteOnSite(
          currentUser.id,
          siteId,
          parsedInput.clientEntrepriseId,
        );
        if (!hasResponsabilite) {
          throw errors.forbidden(
            "Vous ne pouvez attribuer que des sites où vous êtes responsable.",
          );
        }
      }
    } else if (currentUserLevel === 1) {
      // Collaborateur
      if (parsedInput.userId === currentUser.id) {
        throw errors.forbidden(
          "Vous ne pouvez pas vous attribuer des rôles sur des sites. Demandez à votre responsable.",
        );
      }

      const invalidRoles = roles.filter(
        (r) => !["demandeur_site", "observateur_site", "intervenant_site"].includes(r),
      );
      if (invalidRoles.length > 0) {
        throw errors.forbidden(
          "Vous ne pouvez déléguer que les rôles demandeur, observateur et intervenant.",
        );
      }

      for (const siteId of uniqueSiteIds) {
        const hasResponsabilite = await prestataireUserHasResponsabiliteOnSite(
          currentUser.id,
          siteId,
          parsedInput.clientEntrepriseId,
        );
        if (!hasResponsabilite) {
          throw errors.forbidden(
            "Vous devez être responsable de chaque site pour déléguer des accès.",
          );
        }
      }

      const isDescendant = await isUserDescendant({
        entrepriseId: prestataireEntrepriseId,
        ancetreId: currentUser.id,
        descendantId: parsedInput.userId,
      });
      if (!isDescendant) {
        throw errors.forbidden(
          "Vous ne pouvez déléguer des accès qu'à vos subordonnés directs ou indirects.",
        );
      }
    } else {
      throw errors.forbidden("Vous n'avez pas les permissions nécessaires.");
    }

    // Bulk insert en transaction
    const result = await db.transaction(async (tx) => {
      // 1. Supprimer les exclusions existantes si fourni (réactivation)
      if (
        parsedInput.exclusionsToDelete &&
        parsedInput.exclusionsToDelete.length > 0
      ) {
        for (const exclusionId of parsedInput.exclusionsToDelete) {
          await tx
            .delete(userPrestataireSiteAttributions)
            .where(
              and(
                eq(userPrestataireSiteAttributions.id, exclusionId),
                eq(userPrestataireSiteAttributions.userId, parsedInput.userId),
                eq(
                  userPrestataireSiteAttributions.entrepriseId,
                  parsedInput.clientEntrepriseId,
                ),
              ),
            );
        }
      }

      // 2. Vérifier les conflits avec les attributions existantes
      const existingAttributions =
        await tx.query.userPrestataireSiteAttributions.findMany({
          where: and(
            eq(userPrestataireSiteAttributions.userId, parsedInput.userId),
            eq(
              userPrestataireSiteAttributions.entrepriseId,
              parsedInput.clientEntrepriseId,
            ),
          ),
          columns: { siteId: true },
        });

      const existingSiteIds = new Set(
        existingAttributions.map((a) => a.siteId),
      );
      const inclureAttrs = parsedInput.attributions.filter(
        (a) => a.mode === "inclure",
      );
      const conflicts = inclureAttrs
        .map((a) => a.siteId)
        .filter((siteId) => existingSiteIds.has(siteId));

      if (conflicts.length > 0) {
        throw errors.conflict(
          `${conflicts.length} site(s) ont déjà une attribution. Un seul rôle par site est autorisé.`,
        );
      }

      // 3. Insérer les attributions
      const values = parsedInput.attributions.map((attr) => ({
        userId: parsedInput.userId,
        siteId: attr.siteId,
        mode: attr.mode,
        scope: attr.scope,
        role: attr.role,
        entrepriseId: parsedInput.clientEntrepriseId,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      }));

      const inserted = await tx
        .insert(userPrestataireSiteAttributions)
        .values(values)
        .onConflictDoNothing()
        .returning();

      return { inserted };
    });

    const validated = z
      .array(selectUserPrestataireSiteAttributionSchema)
      .parse(result.inserted);

    return {
      attributions: validated,
      count: validated.length,
      originalCount: parsedInput.attributions.length,
    };
  });
