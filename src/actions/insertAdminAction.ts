"use server";

import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import { getUser } from "@/lib/auth-session";
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
      const currentUser = await getUser();
      const locale = await getLocale();
      // if (currentUser?.role !== "admin") {
      //   throw new Error(
      //     "Vous n'avez pas les droits pour créer un utilisateur."
      //   );
      // }
      if (adminInput.password !== adminInput.passwordConfirmation) {
        throw new Error("Les mots de passe ne correspondent pas.");
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
        throw new Error("Cet email est déjà utilisé par un administrateur.");
      }
      const response = await auth.api.signUpEmail({
        returnHeaders: true,
        body: userToPost,
        asResponse: true,
      });
      console.log("response", response);
      await authClient.sendVerificationEmail({
        email: userToPost.email,
        callbackURL: `${process.env.APP_URL}/${locale}/auth/email-ok`,
      });
      return {
        success: true,
        message: `Le compte administrateur de ${userToPost.name} a été crée avec succès, un email avec un lien de vérification a été envoyé à ${userToPost.email}`,
      };
    }
  );
