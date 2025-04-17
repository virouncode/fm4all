"use server";

import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getSession } from "@/lib/auth-session";

import { capitalize } from "@/lib/capitalize";
import { actionClient } from "@/lib/safe-actions";
import { insertAdminSchema, InsertAdminType } from "@/zod-schemas/admin";
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
      if (adminInput.password !== adminInput.passwordConfirmation) {
        throw new Error(
          locale === "fr"
            ? "Les mots de passe ne correspondent pas."
            : "Passwords do not match"
        );
      }
      const userToPost = {
        name: capitalize(adminInput.prenom) + " " + capitalize(adminInput.nom),
        email: adminInput.email.toLowerCase(),
        password: adminInput.password,
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
            ? "Cet email est déjà utilisé par un administrateur."
            : "This email is already used by an admin account."
        );
      }
      await auth.api.signUpEmail({
        returnHeaders: true,
        body: userToPost,
        asResponse: true,
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
