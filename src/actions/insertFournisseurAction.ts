"use server";
import { db } from "@/db";
import { fournisseurs } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getSession } from "@/lib/auth-session";
import { capitalize } from "@/lib/capitalize";
import { generatePassword } from "@/lib/generatePassword";
import { actionClient } from "@/lib/safe-actions";
import {
  insertFournisseurSchema,
  InsertFournisseurType,
} from "@/zod-schemas/fournisseur";
import { and, eq } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";

export const insertFournisseurAction = actionClient
  .metadata({ actionName: "insertFournisseurAction" })
  .schema(insertFournisseurSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({
      parsedInput: fournisseurInput,
    }: {
      parsedInput: InsertFournisseurType;
    }) => {
      const user = (await getSession())?.user;
      if (user?.role !== "admin") {
        throw new Error(
          "Vous n'avez pas les droits pour créer un utilisateur."
        );
      }
      const fournisseurToPost: InsertFournisseurType = {
        ...fournisseurInput,
        nomFournisseur: fournisseurInput.nomFournisseur.toUpperCase(),
        prenomContact: capitalize(fournisseurInput.prenomContact),
        nomContact: capitalize(fournisseurInput.nomContact),
        emailContact: fournisseurInput.emailContact.toLowerCase(),
      };
      const existingFournisseur = await db
        .select({ id: fournisseurs.id })
        .from(fournisseurs)
        .where(
          and(eq(fournisseurs.emailContact, fournisseurToPost.emailContact))
        )
        .limit(1);

      if (existingFournisseur.length > 0) {
        throw new Error("Cet email est déjà utilisé par un fournisseur.");
      }
      const resultFournisseur = await db
        .insert(fournisseurs)
        .values(fournisseurToPost)
        .returning({ id: fournisseurs.id });

      if (!resultFournisseur[0]?.id) {
        throw new Error("Impossible de créer le compte fournisseur.");
      }
      await auth.api.signUpEmail({
        body: {
          name: fournisseurToPost.nomFournisseur,
          email: fournisseurToPost.emailContact,
          password: generatePassword(),
          role: "fournisseur",
          fournisseurId: resultFournisseur[0].id,
          clientId: null,
          image: "",
        },
        // fetchOptions: {
        //   onResponse: () => {
        //     setLoading(false);
        //   },
        //   onRequest: () => {
        //     setLoading(true);
        //   },
        //   onError: (ctx) => {
        //     toast({
        //       variant: "destructive",
        //       title: "Error",
        //       description: ctx.error.message,
        //     });
        //   },
        //   onSuccess: async () => {
        //     toast({
        //       title: "Success",
        //       description: "Account created successfully",
        //     });
        //   },
        // },
      });

      return {
        success: true,
        message: `Le compte du fournisseur ${fournisseurToPost.nomFournisseur} a été crée avec succès`,
        data: { fournisseurId: resultFournisseur[0]?.id },
      };
    }
  );
