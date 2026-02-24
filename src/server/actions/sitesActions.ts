"use server";

import { db } from "@/db";
import { entreprises } from "@/db/schema/entreprises";
import { sites } from "@/db/schema/sites";
import { userAdhesions } from "@/db/schema/users";
import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import {
  getAccessibleSitesByUser,
  getSiteById,
  getSitesByEntrepriseId,
  siteBelongsToEntreprise,
} from "@/server/queries/sites.query";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import {
  deleteSiteArborescence,
  getDescendantsOfSite,
  insertSiteArborescence,
  siteHasChildren,
} from "@/server/utils/sitesArborescence.utils";
import { resolveUserRightsOnSite } from "@/server/utils/userSiteAttributions.utils";
import {
  getSitesQuerySchema,
  insertSiteSchema,
  insertSiteToDbSchema,
  selectSiteSchema,
  updateSiteSchema,
  updateSiteToDbSchema,
} from "@/zod-schemas/sites.schema";
import { and, eq, inArray } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { z } from "zod";

// ==================== HELPERS ====================

/**
 * Vérifie si l'utilisateur est admin de l'entreprise
 */
async function isAdmin(userId: string, entrepriseId: string): Promise<boolean> {
  const adhesion = await db.query.userAdhesions.findFirst({
    where: and(
      eq(userAdhesions.userId, userId),
      eq(userAdhesions.entrepriseId, entrepriseId),
    ),
  });

  // Check enterprise admin OR platform super admin
  const platformRole = await getUserPlateformeAdhesion(userId);

  return (
    adhesion?.role === "admin" ||
    platformRole?.role === "super_admin_plateforme"
  );
}

/**
 * Vérifie si l'utilisateur est responsable_site d'un site donné (avec scope=subtree)
 */
async function isResponsableSite(
  userId: string,
  siteId: string,
  entrepriseId: string,
): Promise<boolean> {
  const resolved = await resolveUserRightsOnSite({
    userId,
    siteId,
    entrepriseId,
  });

  return resolved?.role === "responsable_site";
}

// ==================== GET SITES ====================

export const getSitesAction = actionClient
  .metadata({ actionName: "getSitesAction" })
  .inputSchema(getSitesQuerySchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    console.log("getSitesAction START", parsedInput);
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    const { entrepriseId } = parsedInput;

    // Récupérer TOUS les sites (actifs ET inactifs)
    const sites = await getSitesByEntrepriseId(entrepriseId, true);
    return sites;
  });

// ==================== GET SITE BY ID ====================

export const getSiteByIdAction = actionClient
  .metadata({ actionName: "getSiteByIdAction" })
  .inputSchema(
    z.object({
      siteId: z.uuid("ID du site invalide"),
      entrepriseId: z.uuid("ID de l'entreprise invalide"),
    }),
    {
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

    const { siteId, entrepriseId } = parsedInput;

    // Vérifier que le site appartient à l'entreprise
    const belongs = await siteBelongsToEntreprise({ siteId, entrepriseId });
    if (!belongs) {
      throw errors.notFound("Site");
    }

    const site = await getSiteById(siteId);
    if (!site) {
      throw errors.notFound("Site");
    }

    return site;
  });

// ==================== GET ACCESSIBLE SITES ====================

export const getAccessibleSitesAction = actionClient
  .metadata({ actionName: "getAccessibleSitesAction" })
  .inputSchema(
    z.object({
      entrepriseId: z.uuid("ID de l'entreprise invalide"),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    console.log("getAccessibleSitesAction - parsedInput:", parsedInput); // --- DEBUG ---
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // Vérifier si l'utilisateur est plateforme
    const platformRole = await getUserPlateformeAdhesion(currentUser.id);

    if (!platformRole) {
      // Si pas plateforme, vérifier accès entreprise via adhésion
      const adhesion = await db.query.userAdhesions.findFirst({
        where: and(
          eq(userAdhesions.userId, currentUser.id),
          eq(userAdhesions.entrepriseId, parsedInput.entrepriseId),
        ),
      });

      if (!adhesion) {
        throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
      }
    }

    // Récupérer sites accessibles (filtré par attributions)
    const sites = await getAccessibleSitesByUser({
      userId: currentUser.id,
      entrepriseId: parsedInput.entrepriseId,
    });

    return sites;
  });

// ==================== INSERT SITE ====================

export const insertSiteAction = actionClient
  .metadata({ actionName: "insertSiteAction" })
  .inputSchema(
    insertSiteSchema.extend({
      entrepriseId: z.uuid("ID de l'entreprise invalide"),
    }),
    {
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

    const { entrepriseId, parentId, ...siteData } = parsedInput;

    // Vérifier les permissions
    const userIsAdmin = await isAdmin(currentUser.id, entrepriseId);

    // Si site racine (parentId = null), seul un admin peut créer
    if (!parentId && !userIsAdmin) {
      throw errors.forbidden(
        "Seuls les administrateurs peuvent créer des sites racines.",
      );
    }

    // Si sous-site, vérifier les permissions
    if (parentId) {
      // Vérifier qu'il appartient à la même entreprise
      const parentBelongs = await siteBelongsToEntreprise({
        siteId: parentId,
        entrepriseId,
      });
      if (!parentBelongs) {
        throw errors.validation(
          "Le site parent n'appartient pas à cette entreprise.",
          { parentId: ["Parent invalide"] },
        );
      }

      // Si non-admin, vérifier qu'il est responsable_site du parent
      if (!userIsAdmin) {
        const canCreate = await isResponsableSite(
          currentUser.id,
          parentId,
          entrepriseId,
        );

        if (!canCreate) {
          throw errors.forbidden(
            "Vous devez être responsable du site parent pour créer un sous-site.",
          );
        }
      }
    }

    // Préparer le payload
    const payload = insertSiteToDbSchema.parse({
      ...siteData,
      entrepriseId,
      parentId: parentId || null,
      createdById: currentUser.id,
      updatedById: currentUser.id,
    });

    // Transaction: INSERT site + closure table
    const insertedSite = await db.transaction(async (tx) => {
      // 1. Insert site
      const [site] = await tx.insert(sites).values(payload).returning();

      if (!site) {
        throw errors.internal("Échec de la création du site.");
      }

      // 2. Insert closure table entries
      await insertSiteArborescence({
        entrepriseId,
        siteId: site.id,
        parentId: parentId || null,
        userId: currentUser.id,
        tx,
      });

      return site;
    });

    // Parse la réponse avec Zod pour garantir la cohérence
    const parsedSite = selectSiteSchema.parse(insertedSite);

    return {
      message: "Site créé avec succès.",
      site: parsedSite,
    };
  });

// ==================== UPDATE SITE ====================

export const updateSiteAction = actionClient
  .metadata({ actionName: "updateSiteAction" })
  .inputSchema(
    updateSiteSchema.extend({
      entrepriseId: z.uuid("ID de l'entreprise invalide"),
    }),
    {
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

    const {
      id: siteId,
      entrepriseId,
      actif: newActif,
      ...updateData
    } = parsedInput;

    // Vérifier que le site existe et appartient à l'entreprise
    const belongs = await siteBelongsToEntreprise({ siteId, entrepriseId });
    if (!belongs) {
      throw errors.notFound("Site");
    }

    // Vérifier les permissions
    const userIsAdmin = await isAdmin(currentUser.id, entrepriseId);

    if (!userIsAdmin) {
      // Non-admin: doit être responsable_site du site
      const canEdit = await isResponsableSite(
        currentUser.id,
        siteId,
        entrepriseId,
      );

      if (!canEdit) {
        throw errors.forbidden(
          "Vous devez être responsable de ce site pour le modifier.",
        );
      }

      // Non-admin ne peut PAS changer le parentId (déplacer le site)
      if ("parentId" in updateData) {
        throw errors.forbidden(
          "Seuls les administrateurs peuvent déplacer un site dans l'arborescence.",
        );
      }
    }

    // LOGIQUE DE CASCADE POUR LE STATUT ACTIF
    if (newActif !== undefined) {
      // Récupérer le site actuel pour détecter un changement de statut
      const currentSite = await getSiteById(siteId, true);

      if (currentSite && currentSite.actif !== newActif) {
        // Changement de statut détecté

        if (newActif === false) {
          // ═══════════════════════════════════════════════════════
          // DÉSACTIVATION → CASCADE VERS LES DESCENDANTS
          // ═══════════════════════════════════════════════════════
          await db.transaction(async (tx) => {
            // 1. Récupérer tous les descendants
            const descendantIds = await getDescendantsOfSite({
              entrepriseId,
              siteId,
              tx,
            });

            // 2. Préparer le payload (sans le champ actif)
            const payload = updateSiteToDbSchema.parse({
              ...updateData,
              updatedById: currentUser.id,
            });

            // 3. Mettre à jour le site parent (incluant actif: false)
            await tx
              .update(sites)
              .set({ ...payload, actif: false })
              .where(eq(sites.id, siteId));

            // 4. Désactiver tous les descendants en cascade
            if (descendantIds.length > 0) {
              await tx
                .update(sites)
                .set({ actif: false, updatedById: currentUser.id })
                .where(inArray(sites.id, descendantIds));
            }
          });
        } else if (newActif === true) {
          // ═══════════════════════════════════════════════════════
          // RÉACTIVATION → VÉRIFIER PARENT ACTIF
          // ═══════════════════════════════════════════════════════
          if (currentSite.parentId) {
            const parent = await getSiteById(currentSite.parentId, true);
            if (parent && !parent.actif) {
              throw errors.conflict(
                "Impossible de réactiver ce site car son parent est inactif. Réactivez d'abord le parent.",
              );
            }
          }

          // Parent actif (ou pas de parent) → réactivation autorisée
          // Note: Les descendants restent inactifs (pas de cascade)
          const payload = updateSiteToDbSchema.parse({
            ...updateData,
            actif: true,
            updatedById: currentUser.id,
          });

          await db.update(sites).set(payload).where(eq(sites.id, siteId));
        }
      } else {
        // Pas de changement de statut (même valeur) → mise à jour normale
        const payload = updateSiteToDbSchema.parse({
          ...updateData,
          actif: newActif,
          updatedById: currentUser.id,
        });

        await db.update(sites).set(payload).where(eq(sites.id, siteId));
      }
    } else {
      // Pas de changement de statut → mise à jour normale
      const payload = updateSiteToDbSchema.parse({
        ...updateData,
        updatedById: currentUser.id,
      });

      await db.update(sites).set(payload).where(eq(sites.id, siteId));
    }

    // Récupérer le site mis à jour
    const updatedSite = await getSiteById(siteId, true);
    if (!updatedSite) {
      throw errors.internal("Échec de la récupération du site mis à jour.");
    }

    return {
      message: "Site mis à jour avec succès.",
      site: selectSiteSchema.parse(updatedSite),
    };
  });

// ==================== ARCHIVE SITE ====================

export const archiveSiteAction = actionClient
  .metadata({ actionName: "archiveSiteAction" })
  .inputSchema(
    z.object({
      siteId: z.uuid("ID du site invalide"),
      entrepriseId: z.uuid("ID de l'entreprise invalide"),
    }),
    {
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

    const { siteId, entrepriseId } = parsedInput;

    // Vérifier que le site existe et appartient à l'entreprise
    const belongs = await siteBelongsToEntreprise({ siteId, entrepriseId });
    if (!belongs) {
      throw errors.notFound("Site");
    }

    // Récupérer le site
    const site = await getSiteById(siteId);
    if (!site) {
      throw errors.notFound("Site");
    }

    // Vérifier que le site n'a pas d'enfants ACTIFS
    const childSites = await db.query.sites.findMany({
      where: and(eq(sites.parentId, siteId), eq(sites.actif, true)),
    });

    if (childSites.length > 0) {
      throw errors.conflict(
        "Impossible d'archiver un site qui a des sous-sites actifs. Archivez d'abord les sous-sites.",
      );
    }

    // Vérifier les permissions (ADMIN uniquement)
    const userIsAdmin = await isAdmin(currentUser.id, entrepriseId);

    if (!userIsAdmin) {
      throw errors.forbidden(
        "Seuls les administrateurs peuvent archiver des sites.",
      );
    }

    // SOFT DELETE : Marquer comme inactif
    const [updatedSite] = await db
      .update(sites)
      .set({
        actif: false,
        updatedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(sites.id, siteId))
      .returning();

    if (!updatedSite) {
      throw errors.internal("Échec de l'archivage du site.");
    }

    return {
      message: "Site archivé avec succès.",
      site: selectSiteSchema.parse(updatedSite),
    };
  });

// ==================== RESTORE SITE ====================

export const restoreSiteAction = actionClient
  .metadata({ actionName: "restoreSiteAction" })
  .inputSchema(
    z.object({
      siteId: z.uuid("ID du site invalide"),
      entrepriseId: z.uuid("ID de l'entreprise invalide"),
    }),
    {
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

    const { siteId, entrepriseId } = parsedInput;

    // Vérifier que le site existe et appartient à l'entreprise
    const belongs = await siteBelongsToEntreprise({ siteId, entrepriseId });
    if (!belongs) {
      throw errors.notFound("Site");
    }

    // Récupérer le site (incluant les archivés pour la restauration)
    const site = await db.query.sites.findFirst({
      where: eq(sites.id, siteId),
    });

    if (!site || site.actif) {
      throw errors.notFound("Site archivé");
    }

    // Vérifier les permissions (ADMIN uniquement)
    const userIsAdmin = await isAdmin(currentUser.id, entrepriseId);

    if (!userIsAdmin) {
      throw errors.forbidden(
        "Seuls les administrateurs peuvent restaurer des sites.",
      );
    }

    // Restaurer le site
    const [updatedSite] = await db
      .update(sites)
      .set({
        actif: true,
        updatedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(sites.id, siteId))
      .returning();

    if (!updatedSite) {
      throw errors.internal("Échec de la restauration du site.");
    }

    return {
      message: "Site restauré avec succès.",
      site: selectSiteSchema.parse(updatedSite),
    };
  });

// ==================== PERMANENTLY DELETE SITE (FM4ALL PLATFORM ONLY) ====================

export const permanentlyDeleteSiteAction = actionClient
  .metadata({ actionName: "permanentlyDeleteSiteAction" })
  .inputSchema(
    z.object({
      siteId: z.uuid("ID du site invalide"),
      entrepriseId: z.uuid("ID de l'entreprise invalide"),
    }),
    {
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

    const { siteId, entrepriseId } = parsedInput;

    // Vérifier que le site existe et appartient à l'entreprise
    const belongs = await siteBelongsToEntreprise({ siteId, entrepriseId });
    if (!belongs) {
      throw errors.notFound("Site");
    }

    // ===== PERMISSIONS ULTRA-RESTREINTES =====
    // UNIQUEMENT pour super_admin_plateforme de l'entreprise FM4ALL en posture plateforme

    // 1. Vérifier que l'utilisateur actuel a le rôle plateforme super_admin_plateforme
    const platformRole = await getUserPlateformeAdhesion(currentUser.id);

    if (!platformRole || platformRole.role !== "super_admin_plateforme") {
      throw errors.forbidden(
        "Cette action est réservée aux super administrateurs de la plateforme FM4ALL.",
      );
    }

    // 2. Vérifier que l'entreprise est FM4ALL (plateforme)
    const entreprise = await db.query.entreprises.findFirst({
      where: eq(entreprises.id, entrepriseId),
    });

    if (!entreprise || entreprise.nom !== "FM4ALL") {
      throw errors.forbidden(
        "La suppression définitive est réservée à la plateforme FM4ALL.",
      );
    }

    // 3. Vérifier que le site n'a pas d'enfants (même archivés)
    const hasChildren = await siteHasChildren({ entrepriseId, siteId });
    if (hasChildren) {
      throw errors.conflict(
        "Impossible de supprimer définitivement un site qui a des sous-sites. Supprimez d'abord les sous-sites.",
      );
    }

    // ===== HARD DELETE (IRREVERSIBLE) =====
    // Transaction: DELETE closure table + site
    await db.transaction(async (tx) => {
      // 1. Delete closure table entries
      await deleteSiteArborescence({ entrepriseId, siteId, tx });

      // 2. Delete site (onDelete: "restrict" empêchera si enfants)
      await tx.delete(sites).where(eq(sites.id, siteId));
    });

    return {
      message: "Site supprimé définitivement avec succès.",
    };
  });
