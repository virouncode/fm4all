"use server";

import { db } from "@/db";
import { clientPrestataireRelations, entreprises } from "@/db/schema/entreprises";
import { sites } from "@/db/schema/sites";
import { userClientAdhesions, userPrestataireAdhesions } from "@/db/schema/users";
import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import {
  getAccessibleSitesByUser,
  getSiteById,
  getSiteResponsables,
  getSitesByEntrepriseId,
  siteBelongsToEntreprise,
} from "@/server/queries/sites.query";
import { getUserPrestataireSiteAttributions } from "@/server/queries/userPrestataireSiteAttributions.query";
import { getEffectivePlateformeRole } from "@/server/utils/permissions.utils";
import {
  deleteSiteArborescence,
  getDescendantsOfSite,
  insertSiteArborescence,
  siteHasChildren,
} from "@/server/utils/sitesArborescence.utils";
import { resolveUserRightsOnSite } from "@/server/utils/userClientSiteAttributions.utils";
import {
  getAccessibleSitesSchema,
  getAllSitesForPlatformSchema,
  getSitesQuerySchema,
  insertSiteActionSchema,
  insertSiteToDbSchema,
  selectSiteSchema,
  siteByIdSchema,
  updateSiteActionSchema,
  updateSiteToDbSchema,
} from "@/zod-schemas/sites.schema";
import { normalizeForSubmit } from "@/zod-helpers/normalize";
import { and, eq, inArray } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { z } from "zod";

// ==================== HELPERS ====================

/**
 * Vérifie que l'utilisateur a accès à l'entreprise (platform OU adhésion active).
 * Lève une erreur forbidden si non.
 */
async function assertCanAccessEntreprise(
  userId: string,
  entrepriseId: string,
): Promise<void> {
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) return;

  const [clientAdhesion, prestataireAdhesion] = await Promise.all([
    db.query.userClientAdhesions.findFirst({
      where: and(
        eq(userClientAdhesions.userId, userId),
        eq(userClientAdhesions.entrepriseId, entrepriseId),
        eq(userClientAdhesions.statut, "actif"),
      ),
    }),
    db.query.userPrestataireAdhesions.findFirst({
      where: and(
        eq(userPrestataireAdhesions.userId, userId),
        eq(userPrestataireAdhesions.entrepriseId, entrepriseId),
        eq(userPrestataireAdhesions.statut, "actif"),
      ),
    }),
  ]);

  if (clientAdhesion || prestataireAdhesion) return;

  // 3. Accès proxy : prestataire lié à ce client via clientPrestataireRelations
  const userPrestataireAdhesionsList =
    await db.query.userPrestataireAdhesions.findMany({
      where: and(
        eq(userPrestataireAdhesions.userId, userId),
        eq(userPrestataireAdhesions.statut, "actif"),
      ),
    });
  for (const pAdh of userPrestataireAdhesionsList) {
    const relation = await db.query.clientPrestataireRelations.findFirst({
      where: and(
        eq(clientPrestataireRelations.clientEntrepriseId, entrepriseId),
        eq(clientPrestataireRelations.prestataireEntrepriseId, pAdh.entrepriseId),
      ),
    });
    if (relation) return;
  }

  throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
}

/**
 * Vérifie si l'utilisateur est admin de l'entreprise (statut actif requis).
 * Plateforme (tout rôle) = admin implicite.
 */
async function isAdmin(userId: string, entrepriseId: string): Promise<boolean> {
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) return true;

  const adhesion = await db.query.userClientAdhesions.findFirst({
    where: and(
      eq(userClientAdhesions.userId, userId),
      eq(userClientAdhesions.entrepriseId, entrepriseId),
      eq(userClientAdhesions.statut, "actif"),
    ),
  });

  return adhesion?.role === "admin";
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

/**
 * Vérifie si un prestataire peut gérer les sites d'un client en proxy
 * (le client n'a pas d'admin actif ET l'utilisateur est admin/manager prestataire lié à ce client)
 */
async function canManageSiteAsProxy(
  userId: string,
  clientEntrepriseId: string,
): Promise<boolean> {
  // 1. Le client a-t-il un admin actif ?
  const clientActiveAdmin = await db.query.userClientAdhesions.findFirst({
    where: and(
      eq(userClientAdhesions.entrepriseId, clientEntrepriseId),
      eq(userClientAdhesions.role, "admin"),
      eq(userClientAdhesions.statut, "actif"),
    ),
  });
  if (clientActiveAdmin) return false;

  // 2. L'utilisateur est-il admin/manager prestataire lié à ce client ?
  const prestataireAdhesions = await db.query.userPrestataireAdhesions.findMany(
    {
      where: and(
        eq(userPrestataireAdhesions.userId, userId),
        inArray(userPrestataireAdhesions.role, ["admin", "manager"]),
        eq(userPrestataireAdhesions.statut, "actif"),
      ),
    },
  );
  for (const adhesion of prestataireAdhesions) {
    const relation = await db.query.clientPrestataireRelations.findFirst({
      where: and(
        eq(
          clientPrestataireRelations.clientEntrepriseId,
          clientEntrepriseId,
        ),
        eq(
          clientPrestataireRelations.prestataireEntrepriseId,
          adhesion.entrepriseId,
        ),
      ),
    });
    if (relation) return true;
  }
  return false;
}

// ==================== GET SITES ====================

export const getSitesAction = actionClient
  .metadata({ actionName: "getSitesAction" })
  .inputSchema(getSitesQuerySchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    const { entrepriseId } = parsedInput;

    await assertCanAccessEntreprise(currentUser.id, entrepriseId);

    // Récupérer TOUS les sites (actifs ET inactifs)
    const sites = await getSitesByEntrepriseId(entrepriseId, true);
    return sites;
  });

// ==================== GET SITE BY ID ====================

export const getSiteByIdAction = actionClient
  .metadata({ actionName: "getSiteByIdAction" })
  .inputSchema(siteByIdSchema, {
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

    await assertCanAccessEntreprise(currentUser.id, entrepriseId);

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

// ==================== GET ALL SITES (PLATFORM ONLY) ====================

export const getAllSitesForPlatformAction = actionClient
  .metadata({ actionName: "getAllSitesForPlatformAction" })
  .inputSchema(getAllSitesForPlatformSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async () => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // Vérifier que l'utilisateur est plateforme
    const platformRole = await getEffectivePlateformeRole(currentUser.id);

    if (!platformRole?.role) {
      throw errors.forbidden("Accès réservé à la plateforme.");
    }

    // Récupérer TOUS les sites de TOUS les clients (y compris inactifs)
    const allSites = await db.query.sites.findMany({
      // Pas de filtre actif = true pour inclure TOUS les sites
      orderBy: (sites, { asc }) => [asc(sites.nom)],
    });

    return selectSiteSchema.array().parse(allSites);
  });

// ==================== GET ACCESSIBLE SITES ====================

export const getAccessibleSitesAction = actionClient
  .metadata({ actionName: "getAccessibleSitesAction" })
  .inputSchema(getAccessibleSitesSchema, {
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

    // Vérifier si l'utilisateur est plateforme
    const platformRole = await getEffectivePlateformeRole(currentUser.id);

    // Si plateforme : retourner TOUS les sites sans filtrage (inclure inactifs)
    if (platformRole?.role) {
      const sites = await getSitesByEntrepriseId(parsedInput.entrepriseId, true);
      return sites;
    }

    // Si pas plateforme, vérifier accès entreprise via adhésion
    const adhesion = await db.query.userClientAdhesions.findFirst({
      where: and(
        eq(userClientAdhesions.userId, currentUser.id),
        eq(userClientAdhesions.entrepriseId, parsedInput.entrepriseId),
      ),
    });

    if (!adhesion) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Récupérer sites accessibles (filtré par attributions + rôle si demandé)
    const sites = await getAccessibleSitesByUser({
      userId: currentUser.id,
      entrepriseId: parsedInput.entrepriseId,
      filterRole: parsedInput.filterByRole,
    });

    return sites;
  });

// ==================== GET SITES FOR PRESTATION ====================

/**
 * Retourne tous les sites d'un client + les IDs des sites où l'utilisateur est responsable_site.
 * Utilisé par PrestationFormDialog pour afficher l'arborescence complète avec checkboxes sélectives.
 *
 * responsableSiteIds = null → tous les sites sont activés (plateforme, client admin/manager)
 * responsableSiteIds = string[] → seuls ces sites ont la checkbox activée
 */
export const getSitesForPrestationAction = actionClient
  .metadata({ actionName: "getSitesForPrestationAction" })
  .inputSchema(
    getSitesQuerySchema.extend({
      posture: z.enum(["plateforme", "client", "prestataire"]).optional(),
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

    const { entrepriseId, posture } = parsedInput;

    // Charger tous les sites du client
    const allSites = await getSitesByEntrepriseId(entrepriseId, false);

    // Branche plateforme → tous les sites activés
    // (ignoré si l'utilisateur est en posture prestataire ou client)
    if (posture !== "prestataire" && posture !== "client") {
      const platformRole = await getEffectivePlateformeRole(currentUser.id);
      if (platformRole?.role) {
        return { allSites, responsableSiteIds: null as string[] | null };
      }
    }

    // Branche client → vérifier adhésion
    const clientAdhesion = await db.query.userClientAdhesions.findFirst({
      where: and(
        eq(userClientAdhesions.userId, currentUser.id),
        eq(userClientAdhesions.entrepriseId, entrepriseId),
      ),
    });

    if (clientAdhesion) {
      // Admin/manager → tous les sites activés
      if (
        clientAdhesion.role === "admin" ||
        clientAdhesion.role === "manager"
      ) {
        return { allSites, responsableSiteIds: null as string[] | null };
      }

      // Collaborateur → calculer les sites responsable_site via attributions
      const { getUserClientSiteAttributions } = await import(
        "@/server/queries/userSiteAttributions.query"
      );
      const { attributions } = await getUserClientSiteAttributions({
        userId: currentUser.id,
        entrepriseId,
      });

      const responsableSiteIds = attributions
        .filter(
          (a) =>
            a.role === "responsable_site" &&
            (a.isInherited || a.mode === "inclure"),
        )
        .map((a) => a.siteId);

      return {
        allSites,
        responsableSiteIds: [...new Set(responsableSiteIds)],
      };
    }

    // Branche prestataire → vérifier adhésion prestataire + relation client
    const prestataireAdhesion = await db.query.userPrestataireAdhesions.findFirst(
      {
        where: eq(userPrestataireAdhesions.userId, currentUser.id),
      },
    );

    if (prestataireAdhesion) {
      // Vérifier que le client est bien lié à ce prestataire
      const relation = await db.query.clientPrestataireRelations.findFirst({
        where: and(
          eq(clientPrestataireRelations.clientEntrepriseId, entrepriseId),
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

      // Calculer les sites responsable_site via userPrestataireSiteAttributions
      const { getResponsableSiteIdsByPrestataire } = await import(
        "@/server/queries/userPrestataireSiteAttributions.query"
      );
      const responsableSiteIds = await getResponsableSiteIdsByPrestataire({
        userId: currentUser.id,
        clientEntrepriseId: entrepriseId,
      });

      return {
        allSites,
        responsableSiteIds: [...new Set(responsableSiteIds)],
      };
    }

    throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
  });

// ==================== INSERT SITE ====================

export const insertSiteAction = actionClient
  .metadata({ actionName: "insertSiteAction" })
  .inputSchema(insertSiteActionSchema, {
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

    const { entrepriseId, parentId } = parsedInput;

    // Normaliser les données (string → string déjà fait dans schema, "" → null + string → number)
    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: ["adresseLigne2", "commentaires"] as const,
      optionalNumbers: ["surface", "effectif"] as const,
    });

    // Vérifier les permissions
    const userIsAdmin = await isAdmin(currentUser.id, entrepriseId);
    const userIsProxy = userIsAdmin
      ? false
      : await canManageSiteAsProxy(currentUser.id, entrepriseId);
    const canManage = userIsAdmin || userIsProxy;

    // Si site racine (parentId = null), seul un admin (ou proxy) peut créer
    if (!parentId && !canManage) {
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

      // Si non-admin, vérifier qu'il est responsable_site du parent ou proxy
      if (!canManage) {
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
      nom: normalized.nom, // Déjà nettoyé (capitalizeWords)
      adresseLigne1: normalized.adresseLigne1, // Déjà nettoyé (capitalizeWords)
      adresseLigne2: normalized.adresseLigne2, // "" → null
      codePostal: normalized.codePostal,
      ville: normalized.ville, // Déjà nettoyé (capitalizeWords)
      surface: normalized.surface, // string → number
      effectif: normalized.effectif, // string → number
      typeBatiment: normalized.typeBatiment,
      typeOccupation: normalized.typeOccupation,
      commentaires: normalized.commentaires, // "" → null
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
  .inputSchema(updateSiteActionSchema, {
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
      parentId,
    } = parsedInput;

    // Normaliser les données (string → string déjà fait dans schema, "" → null + string → number)
    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: ["adresseLigne2", "commentaires"] as const,
      optionalNumbers: ["surface", "effectif"] as const,
    });

    // Vérifier que le site existe et appartient à l'entreprise
    const belongs = await siteBelongsToEntreprise({ siteId, entrepriseId });
    if (!belongs) {
      throw errors.notFound("Site");
    }

    // Vérifier les permissions
    const userIsAdmin = await isAdmin(currentUser.id, entrepriseId);
    const userIsProxy = userIsAdmin
      ? false
      : await canManageSiteAsProxy(currentUser.id, entrepriseId);
    const canManage = userIsAdmin || userIsProxy;

    if (!canManage) {
      // Non-admin/non-proxy: doit être responsable_site du site
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

      // Responsable ne peut PAS changer le parentId (déplacer le site)
      if (parentId !== undefined) {
        throw errors.forbidden(
          "Seuls les administrateurs peuvent déplacer un site dans l'arborescence.",
        );
      }
    }

    // Construire l'objet de mise à jour avec les champs normalisés
    const updateFields = {
      ...(normalized.nom !== undefined && { nom: normalized.nom }),
      ...(normalized.adresseLigne1 !== undefined && {
        adresseLigne1: normalized.adresseLigne1,
      }),
      ...(normalized.adresseLigne2 !== undefined && {
        adresseLigne2: normalized.adresseLigne2,
      }),
      ...(normalized.codePostal !== undefined && {
        codePostal: normalized.codePostal,
      }),
      ...(normalized.ville !== undefined && { ville: normalized.ville }),
      ...(normalized.surface !== undefined && { surface: normalized.surface }),
      ...(normalized.effectif !== undefined && {
        effectif: normalized.effectif,
      }),
      ...(normalized.typeBatiment !== undefined && {
        typeBatiment: normalized.typeBatiment,
      }),
      ...(normalized.typeOccupation !== undefined && {
        typeOccupation: normalized.typeOccupation,
      }),
      ...(normalized.commentaires !== undefined && {
        commentaires: normalized.commentaires,
      }),
      ...(parentId !== undefined && { parentId }),
    };

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
              ...updateFields,
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
            ...updateFields,
            actif: true,
            updatedById: currentUser.id,
          });

          await db.update(sites).set(payload).where(eq(sites.id, siteId));
        }
      } else {
        // Pas de changement de statut (même valeur) → mise à jour normale
        const payload = updateSiteToDbSchema.parse({
          ...updateFields,
          actif: newActif,
          updatedById: currentUser.id,
        });

        await db.update(sites).set(payload).where(eq(sites.id, siteId));
      }
    } else {
      // Pas de changement de statut → mise à jour normale
      const payload = updateSiteToDbSchema.parse({
        ...updateFields,
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
  .inputSchema(siteByIdSchema, {
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

    // Vérifier les permissions (ADMIN ou proxy prestataire)
    const userIsAdmin = await isAdmin(currentUser.id, entrepriseId);
    const userIsProxy = userIsAdmin
      ? false
      : await canManageSiteAsProxy(currentUser.id, entrepriseId);
    const canManage = userIsAdmin || userIsProxy;

    if (!canManage) {
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

// ==================== PERMANENTLY DELETE SITE (FM4ALL PLATFORM ONLY) ====================

export const permanentlyDeleteSiteAction = actionClient
  .metadata({ actionName: "permanentlyDeleteSiteAction" })
  .inputSchema(siteByIdSchema, {
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
    const platformRole = await getEffectivePlateformeRole(currentUser.id);

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

// ==================== GET SITE RESPONSABLES ====================

export const getSiteResponsablesAction = actionClient
  .metadata({ actionName: "getSiteResponsablesAction" })
  .inputSchema(siteByIdSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    const { siteId, entrepriseId } = parsedInput;

    await assertCanAccessEntreprise(currentUser.id, entrepriseId);

    const belongs = await siteBelongsToEntreprise({ siteId, entrepriseId });
    if (!belongs) {
      throw errors.forbidden("Ce site n'appartient pas à cette entreprise.");
    }

    const responsables = await getSiteResponsables(siteId);
    return { responsables };
  });

// ==================== GET PRESTATAIRE SITES FOR CLIENT (création ticket) ====================

export const getPrestataireSitesForClientAction = actionClient
  .metadata({ actionName: "getPrestataireSitesForClientAction" })
  .inputSchema(z.object({ clientEntrepriseId: z.uuid("Client obligatoire") }), {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // Vérifier adhésion prestataire active
    const prestataireAdhesion = await db.query.userPrestataireAdhesions.findFirst({
      where: and(
        eq(userPrestataireAdhesions.userId, currentUser.id),
        eq(userPrestataireAdhesions.statut, "actif"),
      ),
    });

    if (!prestataireAdhesion) {
      throw errors.forbidden("Vous n'avez pas d'accès prestataire.");
    }

    // Vérifier relation client-prestataire
    const relation = await db.query.clientPrestataireRelations.findFirst({
      where: and(
        eq(clientPrestataireRelations.clientEntrepriseId, parsedInput.clientEntrepriseId),
        eq(
          clientPrestataireRelations.prestataireEntrepriseId,
          prestataireAdhesion.entrepriseId,
        ),
      ),
    });

    if (!relation) {
      throw errors.forbidden("Vous n'avez pas de relation avec ce client.");
    }

    // Récupérer les sites accessibles via attributions prestataire
    const { attributions } = await getUserPrestataireSiteAttributions({
      userId: currentUser.id,
      clientEntrepriseId: parsedInput.clientEntrepriseId,
    });

    const sitesAccessibles = attributions
      .filter((a) => a.mode === "inclure")
      .map((a) => ({ id: a.siteId, nom: a.site.nom }));

    // Dédupliquer
    const unique = [
      ...new Map(sitesAccessibles.map((s) => [s.id, s])).values(),
    ];

    return { sites: unique };
  });
