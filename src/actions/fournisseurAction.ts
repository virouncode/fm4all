"use server";
import { db } from "@/db";
import { fournisseurs, servicesFournisseurs, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getSession } from "@/lib/auth-session";
import { sendEmailFromServer } from "@/lib/email/sendEmail";
import { actionClient } from "@/lib/safe-actions";
import { capitalize } from "@/lib/utils/capitalize";
import { promoteTempLogoUrl } from "@/lib/utils/file-helper";
import { generatePassword } from "@/lib/utils/generatePassword";
import { formatSIRET } from "@/lib/utils/isValidSIRET";
import {
  insertFournisseurToDbSchema,
  onboardFournisseurSchema,
  updateFournisseurSchema,
  UpdateFournisseurType,
} from "@/zod-schemas/fournisseur";
import { insertUserSchema, UpdateUserType } from "@/zod-schemas/user";
import { eq, sql } from "drizzle-orm";
import { getLocale } from "next-intl/server";
import { flattenValidationErrors } from "next-safe-action";

export const onboardFournisseurAction = actionClient
  .metadata({ actionName: "onboardFournisseurAction" })
  .inputSchema(onboardFournisseurSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const locale = await getLocale();
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw new Error(
        locale === "fr"
          ? "Vous n'êtes pas authentifié."
          : "You are not authenticated.",
      );
    }

    if (currentUser.role !== "admin") {
      throw new Error(
        locale === "fr"
          ? "Vous n'avez pas les droits pour créer un fournisseur."
          : "You do not have permission to create a provider.",
      );
    }

    const {
      fournisseur,
      userAdmin: fournisseurUserAdmin,
      services,
    } = parsedInput;
    const createdById = currentUser.id;
    const updatedById = currentUser.id;

    // Promouvoir le logo temporaire vers un chemin définitif
    const promotedLogoUrl = await promoteTempLogoUrl(fournisseur.logoUrl);

    const result = await db.transaction(async (tx) => {
      // 1) Insert fournisseur
      const fournisseurPayload = insertFournisseurToDbSchema.parse({
        ...fournisseur,
        nomFournisseur: fournisseur.nomFournisseur?.toUpperCase(),
        siret: fournisseur.siret ? formatSIRET(fournisseur.siret) : null,
        prenomContact: capitalize(fournisseur.prenomContact),
        nomContact: capitalize(fournisseur.nomContact),
        emailContact: fournisseur.emailContact?.toLowerCase(),
        logoUrl: promotedLogoUrl ?? null,
        createdById,
        updatedById,
      });

      const [insertedFournisseur] = await tx
        .insert(fournisseurs)
        .values(fournisseurPayload)
        .returning();

      if (!insertedFournisseur) {
        throw new Error(
          locale === "fr"
            ? "Échec de la création du fournisseur."
            : "Failed to create provider.",
        );
      }

      // 2) Insert services-fournisseurs relations
      if (services.length > 0) {
        const serviceFournisseurRecords = services.map((serviceId: number) => ({
          fournisseurId: insertedFournisseur.id,
          serviceId,
        }));
        await tx.insert(servicesFournisseurs).values(serviceFournisseurRecords);
      }

      // 3) Insert user admin
      const [existingUserEmail] = await tx
        .select({ id: user.id })
        .from(user)
        .where(
          eq(
            sql`LOWER(${user.email})`,
            fournisseurUserAdmin.email.toLowerCase(),
          ),
        )
        .limit(1);

      if (existingUserEmail) {
        throw new Error(
          locale === "fr"
            ? "Cette adresse email est déjà utilisée par un autre compte utilisateur."
            : "This email address is already used by another user account.",
        );
      }

      const tempPassword = generatePassword();
      const fournisseurUserAdminPayload =
        insertUserSchema.parse(fournisseurUserAdmin);

      const insertedUser = await auth.api.signUpEmail({
        body: {
          ...fournisseurUserAdmin,
          password: tempPassword,
        },
      });

      if (!insertedUser) {
        throw new Error(
          locale === "fr"
            ? "Échec de la création du compte utilisateur."
            : "Failed to create user account.",
        );
      }

      // 4) Mettre à jour l'avatar si logo fourni
      if (promotedLogoUrl) {
        await tx
          .update(user)
          .set({ image: promotedLogoUrl })
          .where(eq(user.fournisseurId, insertedFournisseur.id));
      }

      // 5) Envoyer l'email
      await sendEmailFromServer({
        to: fournisseurUserAdminPayload.email,
        from: "noreply@mg.fm4all.com",
        subject: "Création de votre compte fournisseur fm4all",
        text: `<p>Votre compte fournisseur a été créé avec succès, bienvenue chez fm4all !</p><br/>
        <p>Voici votre mot de passe temporaire : <strong>${tempPassword}</strong></p><br/>
        <p>Nous vous conseillons de le changer dès votre première connexion dans votre espace.</p>
        <p>Pensez aussi à vérifier votre adresse email en cliquant sur le lien que nous vous avons envoyé.</p>
        `,
        nomDestinataire: fournisseurUserAdminPayload.name,
        useTemplate: true,
      });

      return {
        fournisseur: insertedFournisseur,
        userAdmin: insertedUser.user,
      };
    });

    return {
      success: true,
      message:
        locale === "fr"
          ? "Fournisseur et administrateur créés avec succès."
          : "Provider and admin user created successfully.",
      data: result,
    };
  });

export const updateFournisseurAction = actionClient
  .metadata({ actionName: "updateFournisseurAction" })
  .inputSchema(updateFournisseurSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({
      parsedInput: fournisseurInput,
    }: {
      parsedInput: UpdateFournisseurType;
    }) => {
      const locale = await getLocale();
      const currentUser = (await getSession())?.user;
      if (!currentUser) {
        return {
          success: false,
          message:
            locale === "fr"
              ? "Vous devez être connecté pour mettre à jour vote compte fournisseur."
              : "You must be logged in to update your provider account.",
        };
      }
      if (currentUser?.fournisseurId !== fournisseurInput.id) {
        return {
          success: false,
          message:
            locale === "fr"
              ? "Vous n'avez pas les droits pour mettre à jour le compte de ce fournisseur."
              : "You do not have permission to update this provider account.",
        };
      }

      // Promouvoir le logo temporaire vers un chemin définitif
      const promotedLogoUrl = await promoteTempLogoUrl(
        fournisseurInput.logoUrl,
      );

      const fournisseurToUpdate: UpdateFournisseurType = {
        ...fournisseurInput,
        nomFournisseur: fournisseurInput.nomFournisseur?.toUpperCase(),
        siret: fournisseurInput.siret
          ? formatSIRET(fournisseurInput.siret)
          : "",
        prenomContact: capitalize(fournisseurInput.prenomContact),
        nomContact: capitalize(fournisseurInput.nomContact),
        emailContact: fournisseurInput.emailContact?.toLowerCase(),
        logoUrl: promotedLogoUrl ?? undefined,
      };

      const resultFournisseur = await db
        .update(fournisseurs)
        .set(fournisseurToUpdate)
        .where(eq(fournisseurs.id, fournisseurToUpdate.id ?? 0))
        .returning();

      //mettre à jour l'avatar du fournisseur
      const correspondingUser = await db
        .select()
        .from(user)
        .where(eq(user.fournisseurId, fournisseurToUpdate.id ?? 0))
        .limit(1);

      if (correspondingUser.length > 0) {
        const userToUpdate: UpdateUserType = {
          ...correspondingUser[0],
          image: promotedLogoUrl ?? undefined,
        };
        await db
          .update(user)
          .set(userToUpdate)
          .where(eq(user.id, correspondingUser[0].id));
      }

      return {
        success: true,
        message:
          locale === "fr"
            ? "Votre profil a bien été mis à jour."
            : "Your profile has been successfully updated.",
        data: { fournisseur: resultFournisseur[0] },
      };
    },
  );

// ======================= ADMIN: updateFournisseurForAdminAction ==========================//

import {
  adminFournisseursQueryBackendSchema,
  updateFournisseurForAdminFormSchema,
  UpdateFournisseurForAdminFormType,
  updateFournissuerInDbSchema,
} from "@/zod-schemas/fournisseur";

export const updateFournisseurForAdminAction = actionClient
  .metadata({ actionName: "updateFournisseurForAdminAction" })
  .inputSchema(updateFournisseurForAdminFormSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({
      parsedInput,
    }: {
      parsedInput: UpdateFournisseurForAdminFormType;
    }) => {
      const locale = await getLocale();
      const session = await getSession();
      const currentUser = session?.user;

      if (!currentUser) {
        throw new Error(
          locale === "fr"
            ? "Vous n'êtes pas authentifié."
            : "You are not authenticated.",
        );
      }

      if (currentUser.role !== "admin") {
        throw new Error(
          locale === "fr"
            ? "Vous n'avez pas les droits pour modifier un fournisseur."
            : "You do not have permission to update a provider.",
        );
      }

      const { id, fournisseur, services } = parsedInput;

      // Promouvoir le logo temporaire vers un chemin définitif
      const promotedLogoUrl = await promoteTempLogoUrl(fournisseur.logoUrl);

      const result = await db.transaction(async (tx) => {
        // 1) Update fournisseur
        const fournisseurPayload = updateFournissuerInDbSchema.parse({
          nomFournisseur: fournisseur.nomFournisseur?.toUpperCase(),
          siret: fournisseur.siret ? formatSIRET(fournisseur.siret) : null,
          prenomContact: capitalize(fournisseur.prenomContact),
          nomContact: capitalize(fournisseur.nomContact),
          emailContact: fournisseur.emailContact?.toLowerCase(),
          phoneContact: fournisseur.phoneContact,
          logoUrl: promotedLogoUrl ?? null,
          updatedById: currentUser.id,
        });

        const [updatedFournisseur] = await tx
          .update(fournisseurs)
          .set(fournisseurPayload)
          .where(eq(fournisseurs.id, id))
          .returning();

        if (!updatedFournisseur) {
          throw new Error(
            locale === "fr"
              ? "Échec de la mise à jour du fournisseur."
              : "Failed to update provider.",
          );
        }

        // 2) Delete existing services-fournisseurs relations
        await tx
          .delete(servicesFournisseurs)
          .where(eq(servicesFournisseurs.fournisseurId, id));

        // 3) Insert new services-fournisseurs relations
        if (services.length > 0) {
          const serviceFournisseurRecords = services.map(
            (serviceId: number) => ({
              fournisseurId: id,
              serviceId,
            }),
          );
          await tx
            .insert(servicesFournisseurs)
            .values(serviceFournisseurRecords);
        }

        // 4) Mettre à jour l'avatar de l'utilisateur si logo fourni
        if (promotedLogoUrl) {
          await tx
            .update(user)
            .set({ image: promotedLogoUrl })
            .where(eq(user.fournisseurId, id));
        }

        return updatedFournisseur;
      });

      return {
        success: true,
        message:
          locale === "fr"
            ? "Fournisseur mis à jour avec succès."
            : "Provider updated successfully.",
        data: { fournisseur: result },
      };
    },
  );

// ======================= ADMIN: getAllFournisseursAction ==========================//

import { getAllFournisseursWithPagination } from "@/lib/queries/fournisseurs/getFournisseurs";

export const getAllFournisseursAction = actionClient
  .metadata({ actionName: "getAllFournisseursAction" })
  .inputSchema(adminFournisseursQueryBackendSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    const locale = await getLocale();

    if (!currentUser) {
      throw new Error(
        locale === "fr"
          ? "Vous n'êtes pas authentifié."
          : "You are not authenticated.",
      );
    }

    if (currentUser.role !== "admin") {
      throw new Error(
        locale === "fr"
          ? "Vous n'avez pas les droits pour effectuer cette action."
          : "You do not have permission to perform this action.",
      );
    }

    const fournisseurs = await getAllFournisseursWithPagination({
      query: parsedInput,
    });

    return fournisseurs;
  });
