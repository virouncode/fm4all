"use server";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { documents } from "@/db/schema/documents";
import { entreprises } from "@/db/schema/entreprises";
import { userAdhesions } from "@/db/schema/users";
import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import {
  getUserById,
  getUsers,
  getUsersByEntrepriseId,
  userBelongsToEntreprise,
} from "@/server/queries/users.query";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import {
  deleteUserArborescence,
  insertUserArborescence,
  isUserDescendant,
  userHasChildren,
} from "@/server/utils/usersArborescence.utils";
import {
  insertUserFormSchema,
  selectUserSchema,
  updateUserFormSchema,
  updateUserToDbSchema,
  usersQueryBackendSchema,
} from "@/zod-schemas/user.schema";
import { RoleAdhesionType } from "@/zod-schemas/userAdhesion.schema";
import { and, eq } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/server/auth/auth";
import { getDocumentById } from "@/server/queries/documents.query";
import crypto from "crypto";
import { deleteS3Object, promoteS3Key } from "../s3/s3";

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

    // Vérifier que currentUser a accès à cette entreprise
    const { getUserAdhesion } = await import("@/server/queries/userAdhesions.query");
    const adhesion = await getUserAdhesion({
      userId: currentUser.id,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!adhesion) {
      throw errors.forbidden(
        "Vous n'avez pas accès à cette entreprise.",
      );
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
    const { getUserAdhesion } = await import("@/server/queries/userAdhesions.query");
    const currentUserAdhesion = await getUserAdhesion({
      userId: currentUser.id,
      entrepriseId,
    });

    if (!currentUserAdhesion) {
      throw errors.forbidden(
        "Vous n'avez pas accès à cette entreprise.",
      );
    }

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
    const { getUserAdhesion } = await import("@/server/queries/userAdhesions.query");
    const adhesion = await getUserAdhesion({
      userId: currentUser.id,
      entrepriseId,
    });

    if (!adhesion) {
      throw errors.forbidden(
        "Vous n'avez pas accès à cette entreprise.",
      );
    }

    const users = await getUsersByEntrepriseId(entrepriseId);
    return users;
  });

// ==================== INSERT USER ====================

export const insertUserAction = actionClient
  .metadata({ actionName: "insertUserAction" })
  .inputSchema(
    insertUserFormSchema.extend({
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

    const {
      entrepriseId,
      parentId,
      prenom,
      nom,
      email,
      phone,
      avatar,
      roleAdhesion,
    } = parsedInput;

    // TODO: Vérifier que currentUser a accès à cette entreprise

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

    // 1. Récupérer le rôle de l'utilisateur actuel
    const currentUserAdhesion = await db.query.userAdhesions.findFirst({
      where: and(
        eq(userAdhesions.userId, currentUser.id),
        eq(userAdhesions.entrepriseId, entrepriseId),
      ),
    });

    if (!currentUserAdhesion) {
      throw errors.forbidden(
        "Vous n'avez pas d'adhésion dans cette entreprise.",
      );
    }

    const currentUserRole = currentUserAdhesion.role;
    const platformRole = await getUserPlateformeAdhesion(currentUser.id);

    // 2. Vérifier que l'utilisateur peut créer des utilisateurs
    if (
      platformRole?.role !== "super_admin_plateforme" &&
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

    // 2. Créer l'utilisateur via better-auth avec un mot de passe temporaire
    const tempPassword = crypto.randomUUID(); // Mot de passe aléatoire fort

    let authResult;
    try {
      authResult = await auth.api.signUpEmail({
        body: {
          email,
          password: tempPassword, // Jamais communiqué à l'utilisateur
          parentId: parentId ?? null,
          name: `${prenom} ${nom}`,
          prenom,
          nom,
          phone: phone ?? null,
          avatarId: avatarDocumentId ?? null,
          createdById: currentUser.id,
          updatedById: currentUser.id,
        },
      });
    } catch (error: unknown) {
      // Gérer les erreurs spécifiques de better-auth
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("[insertUserAction] Error from auth.api.signUpEmail:", {
        errorMessage,
        error,
      });

      if (
        errorMessage.toLowerCase().includes("already exists") ||
        errorMessage.toLowerCase().includes("user already exists")
      ) {
        throw errors.conflict(
          `Un utilisateur avec l'email "${email}" existe déjà.`,
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
      // Insert adhesion (membership avec role global)
      await tx.insert(userAdhesions).values({
        userId: newUser.id,
        entrepriseId,
        role: roleAdhesion,
        statut: "actif",
        createdById: currentUser.id,
        updatedById: currentUser.id,
      });

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
      body: { email, redirectTo: `${process.env.APP_URL}/auth/reset-password` },
      headers: resetHeaders, // Passer les headers pour la session
    });

    const parsedUser = selectUserSchema.parse(newUser);

    return {
      message:
        "Utilisateur créé avec succès. Un email d'activation a été envoyé.",
      user: parsedUser,
    };
  });

// ==================== UPDATE USER ====================

export const updateUserAction = actionClient
  .metadata({ actionName: "updateUserAction" })
  .inputSchema(
    updateUserFormSchema.extend({
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

    const {
      id: userId,
      entrepriseId,
      prenom,
      nom,
      email,
      phone,
      avatar,
      roleAdhesion,
      statut,
    } = parsedInput;

    const belongs = await userBelongsToEntreprise({ userId, entrepriseId });
    if (!belongs) {
      throw errors.notFound("Utilisateur");
    }

    // ===== VALIDATION DES PERMISSIONS =====

    // 1. Récupérer le rôle de l'utilisateur actuel
    const currentUserAdhesion = await db.query.userAdhesions.findFirst({
      where: and(
        eq(userAdhesions.userId, currentUser.id),
        eq(userAdhesions.entrepriseId, entrepriseId),
      ),
    });

    if (!currentUserAdhesion) {
      throw errors.forbidden(
        "Vous n'avez pas d'adhésion dans cette entreprise.",
      );
    }

    const currentUserRole = currentUserAdhesion.role;

    // 2. Récupérer le rôle de l'utilisateur cible
    const targetUserAdhesion = await db.query.userAdhesions.findFirst({
      where: and(
        eq(userAdhesions.userId, userId),
        eq(userAdhesions.entrepriseId, entrepriseId),
      ),
    });

    if (!targetUserAdhesion) {
      throw errors.notFound("Adhésion de l'utilisateur cible");
    }

    const targetUserRole = targetUserAdhesion.role;

    // 3. Hiérarchie des rôles
    const roleHierarchy: Record<RoleAdhesionType, number> = {
      admin: 3,
      manager: 2,
      collaborateur: 1,
    };

    // Platform role is highest (level 4) - check separately
    const platformRole = await getUserPlateformeAdhesion(currentUser.id);
    const currentLevel =
      platformRole?.role === "super_admin_plateforme"
        ? 4
        : roleHierarchy[currentUserRole];
    const targetLevel = roleHierarchy[targetUserRole];

    const isEditingSelf = currentUser.id === userId;

    // 4. Vérifier la permission de base (éditer cet utilisateur)
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

    // 5. Vérifier les permissions pour modifier role/statut
    // Vérifier si le rôle ou le statut ont réellement changé
    const isRoleChanging =
      roleAdhesion !== undefined && roleAdhesion !== targetUserAdhesion.role;
    const isStatutChanging =
      statut !== undefined && statut !== targetUserAdhesion.statut;

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

        const newRoleLevel = roleHierarchy[roleAdhesion];

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

    // 0. Récupérer l'ancien user pour comparer l'email
    const oldUser = await getUserById(userId);

    if (!oldUser) {
      throw errors.notFound("Utilisateur");
    }

    // ===== GESTION DU CHANGEMENT D'EMAIL =====
    let emailChanged = false;

    if (email && email !== oldUser.email) {
      // ✅ Utiliser better-auth au lieu d'UPDATE manuel
      try {
        const changeEmailHeaders = await headers();
        await auth.api.changeEmail({
          body: {
            newEmail: email,
            callbackURL: `${process.env.APP_URL}/auth/email-ok`,
          },
          headers: changeEmailHeaders, // ✅ Passer les headers pour la session
        });
        emailChanged = true;
      } catch (error) {
        console.error("Error changing email:", error);
        throw errors.internal(
          "Erreur lors du changement d'email. Veuillez réessayer.",
        );
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
      let name: string | undefined = undefined;
      if (prenom || nom) {
        // Réutiliser oldUser déjà récupéré (optimisation)
        const newPrenom = prenom ?? oldUser?.prenom ?? "";
        const newNom = nom ?? oldUser?.nom ?? "";
        name = `${newPrenom} ${newNom}`;
      }

      // 3. Update user
      const payload = updateUserToDbSchema.parse({
        prenom,
        nom,
        name,
        // ⚠️ NE PAS inclure email si changé (déjà géré par better-auth)
        email: emailChanged ? undefined : email,
        phone: phone === undefined ? undefined : phone || null,
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

      // 4. Update adhesion (role/statut) si fournis
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

        await tx
          .update(userAdhesions)
          .set(adhesionPayload)
          .where(
            and(
              eq(userAdhesions.userId, userId),
              eq(userAdhesions.entrepriseId, entrepriseId),
            ),
          );
      }

      return updated;
    });

    const parsedUser = selectUserSchema.parse(updatedUser);

    return {
      message: emailChanged
        ? "Utilisateur mis à jour. Un email de vérification a été envoyé au nouvel email."
        : "Utilisateur mis à jour avec succès.",
      user: parsedUser,
      emailChanged, // ✅ Retourner cette info pour le toast côté client
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

    // 3. Vérifier que l'utilisateur n'a pas d'enfants (subordonnés)
    const hasChildren = await userHasChildren({ entrepriseId, userId });
    if (hasChildren) {
      throw errors.conflict(
        "Impossible de supprimer définitivement un utilisateur qui a des subordonnés. Supprimez d'abord les subordonnés.",
      );
    }

    // ===== HARD DELETE (IRREVERSIBLE) =====
    // Transaction: DELETE arborescence + adhesion + user
    await db.transaction(async (tx) => {
      // 1. Delete arborescence (closure table)
      await deleteUserArborescence({ entrepriseId, userId, tx });

      // 2. Delete adhesion
      await tx
        .delete(userAdhesions)
        .where(
          and(
            eq(userAdhesions.userId, userId),
            eq(userAdhesions.entrepriseId, entrepriseId),
          ),
        );

      // 3. Delete user
      await tx.delete(user).where(eq(user.id, userId));
    });

    return {
      message: "Utilisateur supprimé définitivement avec succès.",
    };
  });
