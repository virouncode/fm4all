"use server";

import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getSession } from "@/lib/auth-session";
import { capitalize } from "@/lib/capitalize";
import { generatePassword } from "@/lib/generatePassword";
import { actionClient } from "@/lib/safe-actions";
import { sendEmailFromServer } from "@/lib/sendEmail";
import {
  insertAdminSchema,
  InsertAdminType,
  updateAdminSchema,
  UpdateAdminType,
} from "@/zod-schemas/admin";
import { InsertUserType } from "@/zod-schemas/user";
import { and, eq } from "drizzle-orm";
import { getLocale } from "next-intl/server";
import { flattenValidationErrors } from "next-safe-action";

export const insertAdminAction = actionClient
  .metadata({ actionName: "insertAdminAction" })
  .schema(insertAdminSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({ parsedInput: adminInput }: { parsedInput: InsertAdminType }) => {
      const locale = await getLocale();
      const currentUser = (await getSession())?.user;
      if (currentUser?.role !== "admin") {
        throw new Error(
          locale === "fr"
            ? "Vous n'avez pas les droits pour créer un compte administrateur."
            : "You do not have permission to create an admin account."
        );
      }
      const tempPassword = generatePassword();
      const userToPost: InsertUserType = {
        name: capitalize(adminInput.prenom) + " " + capitalize(adminInput.nom),
        email: adminInput.email.toLowerCase(),
        password: tempPassword,
        role: "admin",
        fournisseurId: null,
        clientId: null,
        image: adminInput.image,
      };
      const existingUser = await db
        .select({ id: user.id })
        .from(user)
        .where(and(eq(user.email, userToPost.email)))
        .limit(1);

      if (existingUser.length > 0) {
        throw new Error(
          locale === "fr"
            ? "Cet email est déjà utilisé par un autre administrateur."
            : "This email is already used by an admin account."
        );
      }
      await auth.api.signUpEmail({
        returnHeaders: true,
        body: userToPost,
        asResponse: true,
      });
      await sendEmailFromServer({
        to: userToPost.email,
        from: "noreply@fm4all.com",
        subject: "Création de votre compte administrateur",
        text: `<p>Votre compte administrateur a été crée avec succès, bienvenue chez fm4all !</p><br/>
          <p>Voici mot de passe temporaire : ${tempPassword}</p><br/>
          <p>Nous vous conseillons de le changer dès votre première connexion dans votre espace.</p>
          <p>Pensez aussi à vérifier votre adresse email en cliquant sur le lien que nous vous avons envoyé.</p>
          `,
        nomDestinataire: userToPost.name,
      });
      return {
        success: true,
        message: `${
          locale === "fr"
            ? `Le compte administrateur de ${userToPost.name} a été crée avec succès, un email avec un lien de vérification a été envoyé à ${userToPost.email}`
            : `${userToPost.name}'s admin account has been created, a verification email has been sent to ${userToPost.email}`
        }`,
      };
    }
  );

export const updateAdminAction = actionClient
  .metadata({ actionName: "updateAdminAction" })
  .schema(updateAdminSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({ parsedInput: adminInput }: { parsedInput: UpdateAdminType }) => {
      const locale = await getLocale();
      const currentUser = (await getSession())?.user;
      if (currentUser?.role !== "admin") {
        throw new Error(
          locale === "fr"
            ? "Vous n'avez pas les droits pour mettre à jour un compte administrateur."
            : "You do not have permission to update an admin account."
        );
      }
      if (adminInput.id !== currentUser.id) {
        throw new Error(
          locale === "fr"
            ? "Vous n'avez pas les droits pour mettre à jour le compte de cet administrateur."
            : "You do not have permission to update this admin account."
        );
      }

      const existingUser = await db
        .select()
        .from(user)
        .where(and(eq(user.id, adminInput.id)))
        .limit(1);

      if (!existingUser || existingUser.length === 0) {
        throw new Error(
          locale === "fr"
            ? "L'ID ne correspond à aucun administrateur."
            : "This ID does not match any admin."
        );
      }
      await db.update(user).set(adminInput).where(eq(user.id, adminInput.id));

      return {
        success: true,
        message: `${
          locale === "fr"
            ? "Les informations de votre compte administrateur ont été mises à jour"
            : "Your admin account information has been updated successfully"
        }`,
      };
    }
  );
