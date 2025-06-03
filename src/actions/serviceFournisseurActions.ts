"use server";
import { db } from "@/db";
import { servicesFournisseurs } from "@/db/schema";
import { getSession } from "@/lib/auth-session";
import { invalidateCacheTag } from "@/lib/cache-invalidation";
import { getFournisseurTag } from "@/lib/data-cache";
import { actionClient } from "@/lib/safe-actions";
import {
  insertServiceFournisseurSchema,
  InsertServiceFournisseurType,
} from "@/zod-schemas/serviceFournisseur";
import { getLocale } from "next-intl/server";
import { flattenValidationErrors } from "next-safe-action";

export const insertServiceFournisseurAction = actionClient
  .metadata({ actionName: "insertServiceFournisseurAction" })
  .schema(insertServiceFournisseurSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({
      parsedInput: serviceFournisseurInput,
    }: {
      parsedInput: InsertServiceFournisseurType;
    }) => {
      const locale = await getLocale();
      const session = await getSession();
      const currentUser = session?.user;
      const fournisseurId = currentUser?.fournisseurId;
      if (!fournisseurId) {
        throw new Error(
          locale === "fr"
            ? "Vous devez être connecté pour mettre à jour vos services."
            : "You must be logged in to update your services."
        );
      }
      if (fournisseurId !== serviceFournisseurInput.fournisseurId) {
        throw new Error(
          locale === "fr"
            ? "Vous n'avez pas les droits pour mettre à jour ce compte fournisseur."
            : "You do not have permission to update this provider account."
        );
      }
      const result = await db
        .insert(servicesFournisseurs)
        .values(serviceFournisseurInput)
        .returning();
      if (!result[0]?.id) {
        throw new Error(
          locale === "fr"
            ? "Impossible d'enregistrer le nouveau service."
            : "Unable to save your new service"
        );
      }
      invalidateCacheTag(getFournisseurTag("services", fournisseurId));
      return {
        success: true,
        message: locale === "fr" ? "Service ajouté" : "Service added",
        data: { client: result[0] },
      };
    }
  );
