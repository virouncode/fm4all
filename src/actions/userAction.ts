"use server";

import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getSession } from "@/lib/auth-session";
import { sendEmailFromServer } from "@/lib/email/sendEmail";
import { actionClient } from "@/lib/safe-actions";
import { generatePassword } from "@/lib/utils/generatePassword";
import { eq, sql } from "drizzle-orm";
import { getLocale } from "next-intl/server";
import { flattenValidationErrors } from "next-safe-action";
import {
  insertUserSchema,
  InsertUserType,
  updateUserSchema,
  UpdateUserType,
} from "./../zod-schemas/user";

export const insertUserAction = actionClient
  .metadata({
    actionName: "insertUserAction",
  })
  .schema(insertUserSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({ parsedInput: userInput }: { parsedInput: InsertUserType }) => {
      const locale = await getLocale();
      const currentUser = (await getSession())?.user;
      if (currentUser?.role !== "admin") {
        throw new Error(
          locale === "fr"
            ? "Vous n'avez pas les droits pour créer un compte fournisseur."
            : "You do not have permission to create a provider account."
        );
      }
      const existingEmail = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(sql`LOWER(${user.email})`, userInput.email.toLowerCase()))
        .limit(1);
      if (existingEmail.length > 0) {
        throw new Error(
          locale === "fr"
            ? "Cette adresse email est déjà utilisée par un autre compte utilisateur."
            : "This email address is already used by another user account."
        );
      }
      const tempPassword = generatePassword();

      await auth.api.signUpEmail({
        body: { ...userInput, password: tempPassword },
      });
      await sendEmailFromServer({
        to: userInput.email,
        from: "noreply@fm4all.com",
        subject: "Création de votre compte utilisateur",
        text: `<p>Votre compte utilisateur a été crée avec succès, bienvenue chez fm4all !</p><br/>
              <p>Voici mot de passe temporaire : ${tempPassword}</p><br/>
              <p>Nous vous conseillons de le changer dès votre première connexion dans votre espace.</p>
              <p>Pensez aussi à vérifier votre adresse email en cliquant sur le lien que nous vous avons envoyé.</p>
              `,
        nomDestinataire: userInput.name,
      });
      return {
        success: true,
        message:
          locale === "fr"
            ? `Le compte utilisateur de ${userInput.name} a été crée avec succès. Un email avec un lien de vérification a été envoyé à ${userInput.email}.`
            : `${userInput.name}'s user account has been successfully created.
              An email with a verification link has been sent to ${userInput.email}.`,
      };
    }
  );

export const updateUserAction = actionClient
  .metadata({
    actionName: "updateUserAction",
  })
  .schema(updateUserSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({ parsedInput: userInput }: { parsedInput: UpdateUserType }) => {
      const locale = await getLocale();
      const currentUser = (await getSession())?.user;
      if (!currentUser) {
        throw new Error(
          locale === "fr"
            ? "Vous devez être connecté pour mettre à jour vote compte utilisateur."
            : "You must be logged in to update your user account."
        );
      }
      if (currentUser?.id !== userInput.id) {
        throw new Error(
          locale === "fr"
            ? "Vous n'avez pas les droits pour mettre à jour ce compte utilisateur."
            : "You do not have permission to update this user account."
        );
      }
      const resultUser = await db
        .update(user)
        .set(userInput)
        .where(eq(user.id, userInput.id))
        .returning();
      if (!resultUser[0]?.id) {
        throw new Error(
          locale === "fr"
            ? "Impossible de mettre à jour le compte utilisateur."
            : "Unable to update the user account."
        );
      }
      return {
        success: true,
        message:
          locale === "fr"
            ? `Votre compte utilisateur a été mis à jour avec succès.`
            : `Your user account has been successfully updated.`,
      };
    }
  );
