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
  .inputSchema(insertUserSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({ parsedInput: userInput }: { parsedInput: InsertUserType }) => {
      const locale = await getLocale();
      const currentUser = (await getSession())?.user;
      if (!currentUser) {
        throw new Error(
          locale === "fr"
            ? "Vous devez être connecté pour créer un compte utilisateur."
            : "You must be logged in to create a user account.",
        );
      }
      if (
        currentUser?.role !== "admin" &&
        currentUser?.clientId !== userInput.clientId
      ) {
        throw new Error(
          locale === "fr"
            ? "Vous n'avez pas les droits pour créer un compte utilisateur."
            : "You do not have permission to create a user account.",
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
            : "This email address is already used by another user account.",
        );
      }
      const tempPassword = generatePassword();

      const promotedImageUrl = await promoteTempAvatarUrl(
        userInput.image,
        userInput.role,
      );
      userInput.image = promotedImageUrl ?? null;

      await auth.api.signUpEmail({
        body: {
          ...userInput,
          password: tempPassword,
          name: userInput.firstName + " " + userInput.lastName,
        },
      });
      await sendEmailFromServer({
        to: userInput.email,
        from: "noreply@mg.fm4all.com",
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
    },
  );

import { promoteTempAvatarUrl } from "@/lib/utils/file-helper";
import { headers } from "next/headers";

export const updateUserAction = actionClient
  .metadata({
    actionName: "updateUserAction",
  })
  .inputSchema(updateUserSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({ parsedInput: userInput }: { parsedInput: UpdateUserType }) => {
      const locale = await getLocale();
      const currentSession = await getSession();
      const currentUser = currentSession?.user;

      if (!currentUser) {
        throw new Error(
          locale === "fr"
            ? "Vous devez être connecté pour mettre à jour vote compte utilisateur."
            : "You must be logged in to update your user account.",
        );
      }

      // Autorisation : admin peut tout, sinon seulement lui-même
      if (currentUser.role !== "admin" && currentUser.id !== userInput.id) {
        throw new Error(
          locale === "fr"
            ? "Vous n'avez pas les droits pour mettre à jour ce compte utilisateur."
            : "You do not have permission to update this user account.",
        );
      }

      const [existingUser] = await db
        .select()
        .from(user)
        .where(eq(user.id, userInput.id))
        .limit(1);

      if (!existingUser) {
        throw new Error(
          locale === "fr"
            ? "Le compte utilisateur que vous essayez de mettre à jour n'existe pas."
            : "The user account you are trying to update does not exist.",
        );
      }

      const promotedImageUrl = await promoteTempAvatarUrl(
        userInput.image,
        existingUser.role,
      );
      // Cas 1 : l'utilisateur met à jour SON propre compte → on passe par Better Auth
      if (currentUser.id === userInput.id) {
        const h = await headers();

        const res = await auth.api.updateUser({
          headers: h,
          body: {
            name: userInput.firstName + " " + userInput.lastName,
            firstName: userInput.firstName,
            lastName: userInput.lastName,
            image: promotedImageUrl ?? undefined,
            phone: userInput.phone,
          },
        });

        if ("error" in res && res.error) {
          const err = res.error as { message?: string };
          throw new Error(
            err.message ??
              (locale === "fr"
                ? "Impossible de mettre à jour le compte utilisateur."
                : "Unable to update the user account."),
          );
        }
      } else {
        // Cas 2 : un admin met à jour un autre utilisateur → update direct BDD
        const resultUser = await db
          .update(user)
          .set({ ...userInput, image: promotedImageUrl ?? undefined })
          .where(eq(user.id, userInput.id))
          .returning();

        if (!resultUser[0]?.id) {
          throw new Error(
            locale === "fr"
              ? "Impossible de mettre à jour le compte utilisateur."
              : "Unable to update the user account.",
          );
        }
      }

      return {
        success: true,
        message:
          locale === "fr"
            ? `Le compte utilisateur a été mis à jour avec succès.`
            : `The user account has been successfully updated.`,
      };
    },
  );
