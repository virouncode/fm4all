"use server";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { documents } from "@/db/schema/documents";
import { entreprises } from "@/db/schema/entreprises";
import { userClientAdhesions, userClientSiteAttributions, userPlateformeAdhesions, userPrestataireAdhesions, userPrestataireSiteAttributions } from "@/db/schema/users";
import { errors } from "@/lib/action/errors";
import { env } from "@/lib/env";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import {
  getUserById,
  getUsers,
  getUsersByEntrepriseId,
  userBelongsToEntreprise,
} from "@/server/queries/users.query";
import { getEffectivePlateformeRole } from "@/server/utils/permissions.utils";
import {
  deleteUserArborescence,
  insertUserArborescence,
  isUserDescendant,
  userHasChildren,
} from "@/server/utils/usersArborescence.utils";
import { getUsersEligibleForAdhesion } from "@/server/queries/users.query";
import {
  addAdhesionFormSchema,
  insertPlateformeUserFormSchema,
  insertUserFormSchema,
  selectUserSchema,
  updateUserFormSchema,
  updateUserToDbSchema,
  usersQueryBackendSchema,
} from "@/zod-schemas/user.schema";
import { RoleClientAdhesionType } from "@/zod-schemas/userAdhesion.schema";
import { and, count, eq } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/server/auth/auth";
import { getDocumentById } from "@/server/queries/documents.query";
import crypto from "crypto";
import { deleteS3Object, promoteS3Key } from "../s3/s3";
import { capitalizeWords, lower, normalizeForSubmit } from "@/zod-helpers/normalize";
import { sendEmailDirect } from "../email/mailgunDirect";

// ==================== HELPERS PARTAGÉS ====================

/**
 * Vérifie que currentUser a accès à une entreprise via :
 * - Rôle plateforme (super_admin_plateforme ou operateur_plateforme), OU
 * - Adhésion client active, OU
 * - Adhésion prestataire active
 */
async function assertActiveEntrepriseAccess(
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

  if (!clientAdhesion && !prestataireAdhesion) {
    throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
  }
}

/**
 * Vérifie que la cible N'EST PAS le dernier admin actif de l'entreprise.
 * Doit être appelé avant toute action qui retirerait le statut admin actif
 * (changement de rôle, suspension, suppression).
 *
 * ⚠️ Impact FM4ALL spécifique : l'absence d'admin client actif déclenche
 * automatiquement le proxy prestataire (canManageSiteAsProxy). Ce garde-fou
 * est donc une règle de sécurité majeure, pas seulement une bonne pratique.
 */
async function assertNotLastActiveAdmin({
  entrepriseId,
  posture = "client",
}: {
  entrepriseId: string;
  posture?: "client" | "prestataire";
}): Promise<void> {
  const table =
    posture === "prestataire" ? userPrestataireAdhesions : userClientAdhesions;

  const [result] = await db
    .select({ total: count() })
    .from(table)
    .where(
      and(
        eq(table.entrepriseId, entrepriseId),
        eq(table.role, "admin"),
        eq(table.statut, "actif"),
      ),
    );

  if ((result?.total ?? 0) <= 1) {
    throw errors.forbidden(
      "Impossible : cet utilisateur est le dernier administrateur actif de l'entreprise. Nommez un autre administrateur avant d'effectuer cette action.",
    );
  }
}

// ==================== GET USERS ====================

export const getUsersAction = actionClient
  .metadata({ actionName: "getUsersAction" })
  .inputSchema(usersQueryBackendSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    const { posture = "client", entrepriseId } = parsedInput;

    // Vérifier que currentUser a accès selon la posture
    if (posture === "plateforme") {
      const platformRole = await getEffectivePlateformeRole(currentUser.id);
      if (!platformRole?.role) {
        throw errors.forbidden("Accès réservé aux utilisateurs de la plateforme.");
      }
    } else if (posture === "prestataire") {
      const row = await db.query.userPrestataireAdhesions.findFirst({
        where: and(
          eq(userPrestataireAdhesions.userId, currentUser.id),
          eq(userPrestataireAdhesions.entrepriseId, entrepriseId),
          eq(userPrestataireAdhesions.statut, "actif"),
        ),
      });
      // Fallback: allow platform users too
      if (!row) {
        const platformRole = await getEffectivePlateformeRole(currentUser.id);
        if (!platformRole?.role) {
          throw errors.forbidden("Vous n'avez pas accès à cette entreprise en posture prestataire.");
        }
      }
    } else {
      // client (default)
      const adhesion = await db.query.userClientAdhesions.findFirst({
        where: and(
          eq(userClientAdhesions.userId, currentUser.id),
          eq(userClientAdhesions.entrepriseId, entrepriseId),
          eq(userClientAdhesions.statut, "actif"),
        ),
      });
      if (!adhesion) {
        // Fallback: allow platform users too
        const platformRole = await getEffectivePlateformeRole(currentUser.id);
        if (!platformRole?.role) {
          throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
        }
      }
    }

    const result = await getUsers(parsedInput);
    return result;
  });

// ==================== GET USER BY ID ====================

export const getUserByIdAction = actionClient
  .metadata({ actionName: "getUserByIdAction" })
  .inputSchema(
    z.object({
      userId: z.uuid("ID utilisateur invalide"),
      entrepriseId: z.uuid("ID entreprise invalide"),
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

    const { userId, entrepriseId } = parsedInput;

    // Vérifier que currentUser a accès à cette entreprise
    await assertActiveEntrepriseAccess(currentUser.id, entrepriseId);

    const belongs = await userBelongsToEntreprise({ userId, entrepriseId });
    if (!belongs) {
      throw errors.notFound("Utilisateur");
    }

    const userRecord = await getUserById(userId);
    if (!userRecord) {
      throw errors.notFound("Utilisateur");
    }

    return userRecord;
  });

// ==================== GET ALL USERS BY ENTREPRISE ====================

export const getUsersByEntrepriseAction = actionClient
  .metadata({ actionName: "getUsersByEntrepriseAction" })
  .inputSchema(
    z.object({
      entrepriseId: z.uuid("ID entreprise invalide"),
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

    const { entrepriseId } = parsedInput;

    // Vérifier que currentUser a accès à cette entreprise
    await assertActiveEntrepriseAccess(currentUser.id, entrepriseId);

    const users = await getUsersByEntrepriseId(entrepriseId);
    return users;
  });

// ==================== INSERT USER ====================

export const insertUserAction = actionClient
  .metadata({ actionName: "insertUserAction" })
  .inputSchema(
    insertUserFormSchema.extend({
      entrepriseId: z.uuid("ID entreprise invalide"),
      posture: z.enum(["client", "prestataire"]).default("client"),
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
      entrepriseId,
      parentId,
      avatar,
      roleAdhesion,
      posture = "client",
    } = parsedInput;

    // Si parentId, vérifier qu'il appartient à la même entreprise
    if (parentId) {
      const parentBelongs = await userBelongsToEntreprise({
        userId: parentId,
        entrepriseId,
      });
      if (!parentBelongs) {
        throw errors.validation(
          "L'utilisateur parent n'appartient pas à cette entreprise.",
          { parentId: ["Parent invalide"] },
        );
      }
    }

    // ===== VALIDATION DES PERMISSIONS =====

    const platformRole = await getEffectivePlateformeRole(currentUser.id);

    // 1. Récupérer le rôle de l'utilisateur actuel (selon posture)
    let currentUserRole: "admin" | "manager" | "collaborateur" | null = null;

    if (posture === "prestataire") {
      const adhesion = await db.query.userPrestataireAdhesions.findFirst({
        where: and(
          eq(userPrestataireAdhesions.userId, currentUser.id),
          eq(userPrestataireAdhesions.entrepriseId, entrepriseId),
          eq(userPrestataireAdhesions.statut, "actif"),
        ),
      });
      currentUserRole = adhesion?.role ?? null;
    } else {
      const adhesion = await db.query.userClientAdhesions.findFirst({
        where: and(
          eq(userClientAdhesions.userId, currentUser.id),
          eq(userClientAdhesions.entrepriseId, entrepriseId),
          eq(userClientAdhesions.statut, "actif"),
        ),
      });
      currentUserRole = adhesion?.role ?? null;
    }

    if (!currentUserRole && !platformRole?.role) {
      throw errors.forbidden(
        "Vous n'avez pas d'adhésion active dans cette entreprise.",
      );
    }

    // 2. Vérifier que l'utilisateur peut créer des utilisateurs
    if (
      !platformRole?.role &&
      currentUserRole !== "admin" &&
      currentUserRole !== "manager"
    ) {
      throw errors.forbidden(
        "Vous n'avez pas la permission de créer des utilisateurs.",
      );
    }

    // 3. Vérifier que le rôle attribué est autorisé
    // Manager ne peut créer que des collaborateurs
    if (
      currentUserRole === "manager" &&
      roleAdhesion !== "collaborateur"
    ) {
      throw errors.forbidden(
        "Vous ne pouvez créer que des utilisateurs avec le rôle collaborateur.",
      );
    }

    // Manager : vérifier que parentId est dans sa branche (lui-même ou descendant)
    if (currentUserRole === "manager" && parentId) {
      const canCreateHere =
        parentId === currentUser.id ||
        (await isUserDescendant({
          entrepriseId,
          ancetreId: currentUser.id,
          descendantId: parentId,
        }));

      if (!canCreateHere) {
        throw errors.forbidden(
          "Vous ne pouvez créer des utilisateurs que dans votre propre branche hiérarchique.",
        );
      }
    }

    // ===== NOUVELLE LOGIQUE D'ACTIVATION =====

    // 1. Gestion avatar (si fourni)
    let avatarDocumentId: string | null = null;

    if (avatar?.storageKey) {
      const promotedKey = await promoteS3Key({ tempKey: avatar.storageKey });

      const [doc] = await db
        .insert(documents)
        .values({
          proprietaireEntrepriseId: entrepriseId,
          categorie: "avatar",
          storageProvider: "s3",
          storageKey: promotedKey,
          filename: avatar.filename,
          mimeType: avatar.mimeType,
          sizeBytes: avatar.sizeBytes,
          createdById: currentUser.id,
        })
        .returning();

      if (doc) {
        avatarDocumentId = doc.id;
      }
    }

    // 2. Normaliser les données avant insertion (transforme "" → null)
    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: ["phone"] as const,
    });

    // 3. Créer l'utilisateur via better-auth avec un mot de passe temporaire
    const tempPassword = crypto.randomUUID(); // Mot de passe aléatoire fort

    let authResult;
    try {
      authResult = await auth.api.signUpEmail({
        body: {
          email: normalized.email, // Déjà nettoyé (lower) par schema
          password: tempPassword, // Jamais communiqué à l'utilisateur
          parentId: parentId ?? null,
          name: `${normalized.prenom} ${normalized.nom}`, // Déjà nettoyés (capitalizeWords) par schema
          prenom: normalized.prenom,
          nom: normalized.nom,
          phone: normalized.phone, // "" → null par normalizeForSubmit
          avatarId: avatarDocumentId ?? null,
          createdById: currentUser.id,
          updatedById: currentUser.id,
        },
      });
    } catch (error: unknown) {
      // Gérer les erreurs spécifiques de better-auth
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.toLowerCase().includes("already exists") ||
        errorMessage.toLowerCase().includes("user already exists")
      ) {
        throw errors.conflict(
          `Un utilisateur avec l'email "${normalized.email}" existe déjà.`,
        );
      }

      throw errors.internal(
        `Erreur lors de la création de l'utilisateur: ${errorMessage}`,
      );
    }

    if (!authResult?.user) {
      throw errors.internal("Échec de la création de l'utilisateur.");
    }

    const newUser = authResult.user;

    // 3. Transaction pour adhesion + arborescence
    await db.transaction(async (tx) => {
      // Insert adhesion dans la bonne table selon la posture
      if (posture === "prestataire") {
        await tx.insert(userPrestataireAdhesions).values({
          userId: newUser.id,
          entrepriseId,
          role: roleAdhesion,
          statut: "actif",
          createdById: currentUser.id,
          updatedById: currentUser.id,
        });
      } else {
        await tx.insert(userClientAdhesions).values({
          userId: newUser.id,
          entrepriseId,
          role: roleAdhesion,
          statut: "actif",
          createdById: currentUser.id,
          updatedById: currentUser.id,
        });
      }

      // Insert closure table entries
      await insertUserArborescence({
        entrepriseId,
        userId: newUser.id,
        parentId: parentId || null,
        createdById: currentUser.id,
        tx,
      });
    });

    // 4. Envoyer l'email d'activation (reset password) APRÈS la transaction
    // Better Auth détectera que emailVerified = false et enverra l'email d'activation
    const resetHeaders = await headers();
    await auth.api.requestPasswordReset({
      body: {
        email: normalized.email,
        redirectTo: `${env.APP_URL}/auth/reset-password`,
      },
      headers: resetHeaders, // Passer les headers pour la session
    });

    const parsedUser = selectUserSchema.parse(newUser);

    return {
      message:
        "Utilisateur créé avec succès. Un email d'activation a été envoyé.",
      user: parsedUser,
    };
  });

// ==================== INSERT PLATEFORME USER ====================

export const insertPlateformeUserAction = actionClient
  .metadata({ actionName: "insertPlateformeUserAction" })
  .inputSchema(
    insertPlateformeUserFormSchema.extend({
      entrepriseId: z.uuid("ID entreprise invalide"),
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

    // Seul super_admin_plateforme peut créer des utilisateurs plateforme
    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    if (!platformRole || platformRole.role !== "super_admin_plateforme") {
      throw errors.forbidden(
        "Seul un super administrateur de la plateforme peut créer des utilisateurs plateforme.",
      );
    }

    const { entrepriseId, avatar, rolePlateformeAdhesion } = parsedInput;

    // 1. Gestion avatar (si fourni)
    let avatarDocumentId: string | null = null;
    if (avatar?.storageKey) {
      const promotedKey = await promoteS3Key({ tempKey: avatar.storageKey });
      const [doc] = await db
        .insert(documents)
        .values({
          proprietaireEntrepriseId: entrepriseId,
          categorie: "avatar",
          storageProvider: "s3",
          storageKey: promotedKey,
          filename: avatar.filename,
          mimeType: avatar.mimeType,
          sizeBytes: avatar.sizeBytes,
          createdById: currentUser.id,
        })
        .returning();
      if (doc) avatarDocumentId = doc.id;
    }

    // 2. Normaliser
    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: ["phone"] as const,
    });

    // 3. Créer l'utilisateur via better-auth
    const tempPassword = crypto.randomUUID();
    let authResult;
    try {
      authResult = await auth.api.signUpEmail({
        body: {
          email: normalized.email,
          password: tempPassword,
          parentId: null,
          name: `${normalized.prenom} ${normalized.nom}`,
          prenom: normalized.prenom,
          nom: normalized.nom,
          phone: normalized.phone,
          avatarId: avatarDocumentId ?? null,
          createdById: currentUser.id,
          updatedById: currentUser.id,
        },
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.toLowerCase().includes("already exists") ||
        errorMessage.toLowerCase().includes("user already exists")
      ) {
        throw errors.conflict(
          `Un utilisateur avec l'email "${normalized.email}" existe déjà.`,
        );
      }
      throw errors.internal(
        `Erreur lors de la création de l'utilisateur: ${errorMessage}`,
      );
    }

    if (!authResult?.user) {
      throw errors.internal("Échec de la création de l'utilisateur.");
    }

    const newUser = authResult.user;

    // 4. Transaction : adhésion plateforme + arborescence (dans FM4ALL)
    await db.transaction(async (tx) => {
      await tx.insert(userPlateformeAdhesions).values({
        userId: newUser.id,
        role: rolePlateformeAdhesion,
        statut: "actif",
        createdById: currentUser.id,
        updatedById: currentUser.id,
      });

      await insertUserArborescence({
        entrepriseId,
        userId: newUser.id,
        parentId: null,
        createdById: currentUser.id,
        tx,
      });
    });

    // 5. Envoyer email d'activation
    const resetHeaders = await headers();
    await auth.api.requestPasswordReset({
      body: {
        email: normalized.email,
        redirectTo: `${env.APP_URL}/auth/reset-password`,
      },
      headers: resetHeaders,
    });

    const parsedUser = selectUserSchema.parse(newUser);

    return {
      message:
        "Utilisateur plateforme créé avec succès. Un email d'activation a été envoyé.",
      user: parsedUser,
    };
  });

// ==================== UPDATE USER ====================

export const updateUserAction = actionClient
  .metadata({ actionName: "updateUserAction" })
  .inputSchema(
    updateUserFormSchema.extend({
      entrepriseId: z.uuid("ID entreprise invalide"),
      posture: z.enum(["client", "prestataire"]).default("client"),
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
      id: userId,
      entrepriseId,
      email,
      avatar,
      roleAdhesion,
      statut,
      posture = "client",
    } = parsedInput;

    // Normalisation anticipée de l'email (nécessaire avant la section changeEmail)
    const emailNormalized = email ? lower(email) : email;

    const belongs = await userBelongsToEntreprise({ userId, entrepriseId });
    if (!belongs) {
      throw errors.notFound("Utilisateur");
    }

    // ===== VALIDATION DES PERMISSIONS =====

    // 1. Récupérer le rôle plateforme (niveau le plus élevé, indépendant de la posture)
    const platformRole = await getEffectivePlateformeRole(currentUser.id);

    // 2. Récupérer le rôle de l'utilisateur actuel (selon posture)
    let currentUserRole: "admin" | "manager" | "collaborateur" | null = null;

    if (posture === "prestataire") {
      const adhesion = await db.query.userPrestataireAdhesions.findFirst({
        where: and(
          eq(userPrestataireAdhesions.userId, currentUser.id),
          eq(userPrestataireAdhesions.entrepriseId, entrepriseId),
          eq(userPrestataireAdhesions.statut, "actif"),
        ),
      });
      currentUserRole = adhesion?.role ?? null;
    } else {
      const adhesion = await db.query.userClientAdhesions.findFirst({
        where: and(
          eq(userClientAdhesions.userId, currentUser.id),
          eq(userClientAdhesions.entrepriseId, entrepriseId),
          eq(userClientAdhesions.statut, "actif"),
        ),
      });
      currentUserRole = adhesion?.role ?? null;
    }

    if (!currentUserRole && !platformRole?.role) {
      throw errors.forbidden(
        "Vous n'avez pas d'adhésion active dans cette entreprise.",
      );
    }

    // 3. Récupérer le rôle et statut de l'utilisateur cible (selon posture)
    let targetUserRole: "admin" | "manager" | "collaborateur" | null = null;
    let targetUserStatut: string | null = null;

    if (posture === "prestataire") {
      const targetAdhesion = await db.query.userPrestataireAdhesions.findFirst({
        where: and(
          eq(userPrestataireAdhesions.userId, userId),
          eq(userPrestataireAdhesions.entrepriseId, entrepriseId),
        ),
      });
      targetUserRole = targetAdhesion?.role ?? null;
      targetUserStatut = targetAdhesion?.statut ?? null;
    } else {
      const targetAdhesion = await db.query.userClientAdhesions.findFirst({
        where: and(
          eq(userClientAdhesions.userId, userId),
          eq(userClientAdhesions.entrepriseId, entrepriseId),
        ),
      });
      targetUserRole = targetAdhesion?.role ?? null;
      targetUserStatut = targetAdhesion?.statut ?? null;
    }

    if (!targetUserRole) {
      throw errors.notFound("Adhésion de l'utilisateur cible");
    }

    // 4. Hiérarchie des rôles
    const roleHierarchy: Record<RoleClientAdhesionType, number> = {
      admin: 3,
      manager: 2,
      collaborateur: 1,
    };

    const currentLevel =
      platformRole?.role // Tout rôle plateforme = niveau 4
        ? 4
        : currentUserRole ? roleHierarchy[currentUserRole] : 0;
    const targetLevel = roleHierarchy[targetUserRole];

    const isEditingSelf = currentUser.id === userId;

    // 5. Vérifier la permission de base (éditer cet utilisateur)
    // Peut éditer: soi-même OU niveau supérieur (pas même niveau)
    const canEdit = isEditingSelf || currentLevel > targetLevel;

    if (!canEdit) {
      throw errors.forbidden(
        "Vous n'avez pas la permission de modifier cet utilisateur.",
      );
    }

    // Manager : vérifier que l'utilisateur cible est dans sa branche
    if (currentUserRole === "manager" && !isEditingSelf) {
      const isInBranch = await isUserDescendant({
        entrepriseId,
        ancetreId: currentUser.id,
        descendantId: userId,
      });

      if (!isInBranch) {
        throw errors.forbidden(
          "Vous ne pouvez modifier que les utilisateurs de votre branche hiérarchique.",
        );
      }
    }

    // 6. Vérifier les permissions pour modifier role/statut
    const isRoleChanging =
      roleAdhesion !== undefined && roleAdhesion !== targetUserRole;
    const isStatutChanging =
      statut !== undefined && statut !== targetUserStatut;

    if (isRoleChanging || isStatutChanging) {
      // Ne peut pas changer son propre rôle ou statut
      if (isEditingSelf) {
        throw errors.forbidden(
          "Vous ne pouvez pas modifier votre propre rôle ou statut.",
        );
      }

      // Vérifier que le niveau actuel permet de modifier le rôle/statut
      if (currentLevel <= targetLevel) {
        throw errors.forbidden(
          "Vous ne pouvez pas modifier le rôle ou statut d'un utilisateur de niveau égal ou supérieur.",
        );
      }

      // Vérifier que le nouveau rôle (si changé) est autorisé
      if (isRoleChanging) {
        // Manager ne peut pas modifier les rôles
        if (currentUserRole === "manager") {
          throw errors.forbidden(
            "Vous ne pouvez pas modifier les rôles. Contactez un administrateur.",
          );
        }

        const newRoleLevel = roleHierarchy[roleAdhesion!];

        // Personne ne peut attribuer un rôle supérieur ou égal au sien
        if (newRoleLevel >= currentLevel) {
          throw errors.forbidden(
            "Vous ne pouvez pas attribuer un rôle de niveau égal ou supérieur au vôtre.",
          );
        }
      }

      // Manager peut modifier le statut de ses descendants (déjà vérifié par la branche)
      // Pas de restriction supplémentaire pour le statut pour les managers
    }

    // 7. Garde-fou : dernier admin actif
    // Une action qui retirerait le statut "admin actif" à la cible est bloquée
    // si c'est le seul admin actif de l'entreprise.
    // ⚠️ Impact FM4ALL : l'absence d'admin client actif active le proxy prestataire.
    const wouldLoseAdminStatus =
      (isRoleChanging && targetUserRole === "admin" && roleAdhesion !== "admin") ||
      (isStatutChanging && targetUserRole === "admin" && statut !== "actif");

    if (wouldLoseAdminStatus) {
      await assertNotLastActiveAdmin({ entrepriseId, posture });
    }

    // 0. Récupérer l'ancien user pour comparer l'email
    const oldUser = await getUserById(userId);

    if (!oldUser) {
      throw errors.notFound("Utilisateur");
    }

    // ===== GESTION DU CHANGEMENT D'EMAIL =====
    let emailChanged = false;
    // Pour le path admin : email à mettre à jour dans la transaction
    let adminEmailChangeNewEmail: string | null = null;

    if (emailNormalized && emailNormalized !== oldUser.email) {
      if (isEditingSelf) {
        // Flow natif better-auth : envoie un email de confirmation au nouvel email
        // L'email n'est mis à jour qu'après que l'utilisateur clique sur le lien
        try {
          const changeEmailHeaders = await headers();
          await auth.api.changeEmail({
            body: {
              newEmail: emailNormalized,
              callbackURL: `${env.APP_URL}/auth/email-ok`,
            },
            headers: changeEmailHeaders,
          });
          emailChanged = true;
        } catch {
          throw errors.internal(
            "Erreur lors du changement d'email. Veuillez réessayer.",
          );
        }
      } else {
        // Admin modifiant l'email d'un autre utilisateur
        // Autorisé : super_admin_plateforme, operateur_plateforme, admin (entreprise propre)
        const canChangeOtherEmail =
          platformRole?.role === "super_admin_plateforme" ||
          platformRole?.role === "operateur_plateforme" ||
          currentUserRole === "admin";

        if (!canChangeOtherEmail) {
          throw errors.forbidden(
            "Vous n'avez pas la permission de modifier l'email de cet utilisateur.",
          );
        }

        // Notification à l'ancien email (garde-fou, non-bloquant)
        sendEmailDirect({
          to: oldUser.email,
          from: "noreply@mg.fm4all.com",
          subject: "Modification de votre adresse email - FM4ALL",
          text: `<p>L'adresse email associée à votre compte FM4ALL a été modifiée par un administrateur.</p>
                 <p>La nouvelle adresse de connexion est : <strong>${emailNormalized}</strong></p>
                 <p>Un email de vérification a été envoyé à cette nouvelle adresse pour activer la connexion.</p>
                 <p>Si vous n'êtes pas à l'origine de cette modification, contactez votre administrateur.</p>`,
          useTemplate: false,
        }).catch(() => {
          // Non-bloquant : la mise à jour continue même si la notification échoue
        });

        // TODO: Audit log (table à créer)

        // emailChanged = true → exclut email du payload principal de la transaction
        // adminEmailChangeNewEmail → sera mis à jour dans la transaction avec emailVerified: false
        emailChanged = true;
        adminEmailChangeNewEmail = emailNormalized;
      }
    }

    // Transaction: UPDATE user + avatar si nécessaire
    const updatedUser = await db.transaction(async (tx) => {
      let avatarDocumentId: string | null | undefined = undefined;

      // 1. Gestion avatar selon les 3 cas
      if (avatar === null) {
        // Cas 1: Suppression explicite de l'avatar (user clicked X without uploading new)
        if (oldUser?.avatarId) {
          const oldDoc = await getDocumentById(oldUser.avatarId);
          if (oldDoc?.storageKey) {
            // Supprimer le fichier S3
            await deleteS3Object({ key: oldDoc.storageKey });
            // Supprimer l'entrée document dans la transaction
            await tx
              .delete(documents)
              .where(eq(documents.id, oldUser.avatarId));
          }
        }
        avatarDocumentId = null; // Clear the avatarId in user table
      } else if (avatar?.storageKey) {
        // Cas 2: Nouvel avatar OU avatar inchangé
        const oldDoc = oldUser?.avatarId
          ? await getDocumentById(oldUser.avatarId)
          : null;

        // Vérifier si c'est vraiment un NOUVEAU fichier
        const isReplacingAvatar = oldDoc?.storageKey !== avatar.storageKey;

        if (isReplacingAvatar) {
          // 2a. Supprimer l'ancien SEULEMENT si on le remplace vraiment
          if (oldDoc?.storageKey) {
            await deleteS3Object({ key: oldDoc.storageKey });
            await tx
              .delete(documents)
              .where(eq(documents.id, oldUser.avatarId!));
          }

          // 2b. Créer le nouveau document avatar
          const promotedKey = await promoteS3Key({ tempKey: avatar.storageKey });

          const [doc] = await tx
            .insert(documents)
            .values({
              proprietaireEntrepriseId: entrepriseId,
              categorie: "avatar",
              storageProvider: "s3",
              storageKey: promotedKey,
              filename: avatar.filename,
              mimeType: avatar.mimeType,
              sizeBytes: avatar.sizeBytes,
              createdById: currentUser.id,
            })
            .returning();

          if (doc) {
            avatarDocumentId = doc.id;
          }
        } else {
          // Même storageKey → pas de changement, conserver l'avatarId existant
          avatarDocumentId = undefined; // Ne pas mettre à jour ce champ
        }
      }
      // Cas 3: avatar === undefined → champ non touché, avatarDocumentId reste undefined

      // 2. Compute name si prenom/nom changent
      // Normaliser les données avant update (transforme "" → null)
      const normalized = normalizeForSubmit(parsedInput, {
        optionalStrings: ["phone"] as const,
      });

      // Normalisation des champs texte (fait dans l'action car .transform() interdit sur optionnels)
      const prenomNormalized = normalized.prenom ? capitalizeWords(normalized.prenom) : normalized.prenom;
      const nomNormalized = normalized.nom ? capitalizeWords(normalized.nom) : normalized.nom;
      // emailNormalized est calculé en dehors de la transaction (utilisé aussi pour le changeEmail)

      let name: string | undefined = undefined;
      if (prenomNormalized || nomNormalized) {
        const newPrenom = prenomNormalized ?? oldUser?.prenom ?? "";
        const newNom = nomNormalized ?? oldUser?.nom ?? "";
        name = `${newPrenom} ${newNom}`;
      }

      // 3. Update user
      const payload = updateUserToDbSchema.parse({
        prenom: prenomNormalized,
        nom: nomNormalized,
        name,
        // ⚠️ NE PAS inclure email si changé (déjà géré par better-auth)
        email: emailChanged ? undefined : emailNormalized,
        phone: normalized.phone, // "" → null par normalizeForSubmit
        avatarId: avatarDocumentId,
        updatedById: currentUser.id,
      });

      const [updated] = await tx
        .update(user)
        .set(payload)
        .where(eq(user.id, userId))
        .returning();

      if (!updated) {
        throw errors.internal("Échec de la mise à jour de l'utilisateur.");
      }

      // 4. Update adhesion (role/statut) si fournis — dans la bonne table selon posture
      if (roleAdhesion !== undefined || statut !== undefined) {
        const adhesionPayload: {
          role?: typeof roleAdhesion;
          statut?: typeof statut;
          updatedById: string;
        } = {
          updatedById: currentUser.id,
        };

        if (roleAdhesion !== undefined) adhesionPayload.role = roleAdhesion;
        if (statut !== undefined) adhesionPayload.statut = statut;

        if (posture === "prestataire") {
          await tx
            .update(userPrestataireAdhesions)
            .set(adhesionPayload)
            .where(
              and(
                eq(userPrestataireAdhesions.userId, userId),
                eq(userPrestataireAdhesions.entrepriseId, entrepriseId),
              ),
            );
        } else {
          await tx
            .update(userClientAdhesions)
            .set(adhesionPayload)
            .where(
              and(
                eq(userClientAdhesions.userId, userId),
                eq(userClientAdhesions.entrepriseId, entrepriseId),
              ),
            );
        }
      }

      // Changement email admin : mettre à jour email + emailVerified:false dans la transaction
      if (adminEmailChangeNewEmail) {
        await tx
          .update(user)
          .set({
            email: adminEmailChangeNewEmail,
            emailVerified: false,
            updatedAt: new Date(),
            updatedById: currentUser.id,
          })
          .where(eq(user.id, userId));
      }

      return updated;
    });

    // Envoi du lien de vérification après commit de la transaction (path admin)
    if (adminEmailChangeNewEmail) {
      try {
        await auth.api.sendVerificationEmail({
          body: {
            email: adminEmailChangeNewEmail,
            callbackURL: `${env.APP_URL}/auth/email-ok`,
          },
        });
      } catch {
        // L'email est déjà mis à jour en DB avec emailVerified:false
        // L'utilisateur ne peut pas se connecter jusqu'à la vérification
        throw errors.internal(
          "Email mis à jour mais le lien de vérification n'a pas pu être envoyé. Contactez le support.",
        );
      }
    }

    const parsedUser = selectUserSchema.parse(updatedUser);

    return {
      message: emailChanged
        ? "Utilisateur mis à jour. Un email de vérification a été envoyé au nouvel email."
        : "Utilisateur mis à jour avec succès.",
      user: parsedUser,
      emailChanged,
    };
  });

// ==================== PERMANENTLY DELETE USER (FM4ALL PLATFORM ONLY) ====================

export const permanentlyDeleteUserAction = actionClient
  .metadata({ actionName: "permanentlyDeleteUserAction" })
  .inputSchema(
    z.object({
      userId: z.uuid("ID utilisateur invalide"),
      entrepriseId: z.uuid("ID entreprise invalide"),
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

    const { userId, entrepriseId } = parsedInput;

    // Ne peut pas se supprimer soi-même
    if (userId === currentUser.id) {
      throw errors.forbidden(
        "Vous ne pouvez pas supprimer votre propre compte.",
      );
    }

    const belongs = await userBelongsToEntreprise({ userId, entrepriseId });
    if (!belongs) {
      throw errors.notFound("Utilisateur");
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

    // 3. Vérifier que l'utilisateur n'a pas d'enfants (subordonnés)
    const hasChildren = await userHasChildren({ entrepriseId, userId });
    if (hasChildren) {
      throw errors.conflict(
        "Impossible de supprimer définitivement un utilisateur qui a des subordonnés. Supprimez d'abord les subordonnés.",
      );
    }

    // 4. Garde-fou : dernier admin actif
    const targetAdhesionForDelete = await db.query.userClientAdhesions.findFirst({
      where: and(
        eq(userClientAdhesions.userId, userId),
        eq(userClientAdhesions.entrepriseId, entrepriseId),
      ),
    });
    if (targetAdhesionForDelete?.role === "admin") {
      await assertNotLastActiveAdmin({ entrepriseId, posture: "client" });
    }

    // ===== HARD DELETE (IRREVERSIBLE) =====
    // Transaction: DELETE arborescence + toutes les adhésions + attributions de sites + user
    await db.transaction(async (tx) => {
      // 1. Delete arborescence (closure table)
      await deleteUserArborescence({ entrepriseId, userId, tx });

      // 2. Delete site attributions
      await tx
        .delete(userClientSiteAttributions)
        .where(eq(userClientSiteAttributions.userId, userId));
      await tx
        .delete(userPrestataireSiteAttributions)
        .where(eq(userPrestataireSiteAttributions.userId, userId));

      // 3. Delete all adhesions
      await tx
        .delete(userClientAdhesions)
        .where(eq(userClientAdhesions.userId, userId));
      await tx
        .delete(userPrestataireAdhesions)
        .where(eq(userPrestataireAdhesions.userId, userId));
      await tx
        .delete(userPlateformeAdhesions)
        .where(eq(userPlateformeAdhesions.userId, userId));

      // 4. Delete user
      await tx.delete(user).where(eq(user.id, userId));
    });

    return {
      message: "Utilisateur supprimé définitivement avec succès.",
    };
  });

// ==================== GET USERS ELIGIBLE FOR ADHESION ====================

export const getUsersEligibleForAdhesionAction = actionClient
  .metadata({ actionName: "getUsersEligibleForAdhesionAction" })
  .inputSchema(
    z.object({
      entrepriseId: z.uuid(),
      posture: z.enum(["client", "prestataire", "plateforme"]),
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

    // Vérifier accès (admin actif ou tout rôle plateforme)
    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    if (!platformRole?.role) {
      // Vérifier que l'utilisateur est admin actif dans cette entreprise (peu importe la posture)
      const isClientAdmin = await db.query.userClientAdhesions.findFirst({
        where: and(
          eq(userClientAdhesions.userId, currentUser.id),
          eq(userClientAdhesions.entrepriseId, parsedInput.entrepriseId),
          eq(userClientAdhesions.role, "admin"),
          eq(userClientAdhesions.statut, "actif"),
        ),
      });
      const isPrestataireAdmin = await db.query.userPrestataireAdhesions.findFirst({
        where: and(
          eq(userPrestataireAdhesions.userId, currentUser.id),
          eq(userPrestataireAdhesions.entrepriseId, parsedInput.entrepriseId),
          eq(userPrestataireAdhesions.role, "admin"),
          eq(userPrestataireAdhesions.statut, "actif"),
        ),
      });
      if (!isClientAdmin && !isPrestataireAdmin) {
        throw errors.forbidden("Accès administrateur requis.");
      }
    }

    const users = await getUsersEligibleForAdhesion(parsedInput);
    return { users };
  });

// ==================== ADD ADHESION TO EXISTING USER ====================

export const addAdhesionToExistingUserAction = actionClient
  .metadata({ actionName: "addAdhesionToExistingUserAction" })
  .inputSchema(addAdhesionFormSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    const { targetUserId, entrepriseId, posture, role } = parsedInput;

    // Vérifier que le currentUser est admin actif ou tout rôle plateforme
    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    if (!platformRole?.role) {
      const isClientAdmin = await db.query.userClientAdhesions.findFirst({
        where: and(
          eq(userClientAdhesions.userId, currentUser.id),
          eq(userClientAdhesions.entrepriseId, entrepriseId),
          eq(userClientAdhesions.role, "admin"),
          eq(userClientAdhesions.statut, "actif"),
        ),
      });
      const isPrestataireAdmin = await db.query.userPrestataireAdhesions.findFirst({
        where: and(
          eq(userPrestataireAdhesions.userId, currentUser.id),
          eq(userPrestataireAdhesions.entrepriseId, entrepriseId),
          eq(userPrestataireAdhesions.role, "admin"),
          eq(userPrestataireAdhesions.statut, "actif"),
        ),
      });
      if (!isClientAdmin && !isPrestataireAdmin) {
        throw errors.forbidden(
          "Seul un administrateur peut rattacher un utilisateur existant.",
        );
      }
    }

    // Vérifier que l'utilisateur cible existe
    const targetUser = await getUserById(targetUserId);
    if (!targetUser) {
      throw errors.notFound("Utilisateur cible");
    }

    // Vérifier qu'il n'a pas déjà cette adhésion
    if (posture === "client") {
      const existing = await db.query.userClientAdhesions.findFirst({
        where: and(
          eq(userClientAdhesions.userId, targetUserId),
          eq(userClientAdhesions.entrepriseId, entrepriseId),
        ),
      });
      if (existing) {
        throw errors.conflict("Cet utilisateur a déjà une adhésion client pour cette entreprise.");
      }

      await db.insert(userClientAdhesions).values({
        userId: targetUserId,
        entrepriseId,
        role: role as "admin" | "manager" | "collaborateur",
        statut: "actif",
        createdById: currentUser.id,
        updatedById: currentUser.id,
      });
    } else if (posture === "prestataire") {
      const existing = await db.query.userPrestataireAdhesions.findFirst({
        where: and(
          eq(userPrestataireAdhesions.userId, targetUserId),
          eq(userPrestataireAdhesions.entrepriseId, entrepriseId),
        ),
      });
      if (existing) {
        throw errors.conflict("Cet utilisateur a déjà une adhésion prestataire pour cette entreprise.");
      }

      await db.insert(userPrestataireAdhesions).values({
        userId: targetUserId,
        entrepriseId,
        role: role as "admin" | "manager" | "collaborateur",
        statut: "actif",
        createdById: currentUser.id,
        updatedById: currentUser.id,
      });
    } else {
      // plateforme
      const existing = await db.query.userPlateformeAdhesions.findFirst({
        where: eq(userPlateformeAdhesions.userId, targetUserId),
      });
      if (existing) {
        throw errors.conflict("Cet utilisateur a déjà une adhésion plateforme.");
      }

      await db.insert(userPlateformeAdhesions).values({
        userId: targetUserId,
        role: role as "super_admin_plateforme" | "operateur_plateforme",
        statut: "actif",
        createdById: currentUser.id,
        updatedById: currentUser.id,
      });
    }

    return {
      message: `Adhésion ${posture} ajoutée avec succès à ${targetUser.prenom} ${targetUser.nom}.`,
    };
  });

/**
 * Renvoie l'email de vérification / définition de mot de passe à un utilisateur.
 * Réservé à la posture plateforme.
 */
export const resendVerificationEmailAction = actionClient
  .metadata({ actionName: "resendVerificationEmailAction" })
  .inputSchema(z.object({ userId: z.string().uuid() }), {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (!plateformeRole)
      throw errors.forbidden(
        "Seule la plateforme peut renvoyer un email de vérification.",
      );

    const targetUser = await db.query.user.findFirst({
      where: eq(user.id, parsedInput.userId),
      columns: { email: true },
    });

    if (!targetUser) throw errors.notFound("Utilisateur introuvable.");

    await auth.api.requestPasswordReset({
      body: {
        email: targetUser.email,
        redirectTo: `${env.APP_URL}/auth/reset-password?type=activation`,
      },
      headers: await headers(),
    });

    return { success: true };
  });
