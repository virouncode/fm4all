"use server";

import { db } from "@/db";
import { nettoyageRepasseTarifs, nettoyageTarifs } from "@/db/schema";
import { getSession } from "@/lib/auth-session";
import { actionClient } from "@/lib/safe-actions";
import { NettoyageTarifsType } from "@/zod-schemas/nettoyageTarifs";
import { eq } from "drizzle-orm";
import { getLocale } from "next-intl/server";
import { flattenValidationErrors } from "next-safe-action";
import { z } from "zod";

const tarifSchema = z.object({
  id: z.number().min(1, "L'ID du tarif est requis"),
  field: z.enum([
    "id",
    "hParPassage",
    "tauxHoraire",
    "surface",
    "gamme",
    "fournisseurId",
    "createdAt",
  ]),
  value: z.number().min(1, "La valeur est requise"),
  table: z.enum(["nettoyageTarifs", "nettoyageRepasseTarifs"]),
});
type Tarif = {
  id: number;
  field: keyof NettoyageTarifsType;
  value: number;
  table: "nettoyageTarifs" | "nettoyageRepasseTarifs";
};

export const updateNettoyageTarifAction = actionClient
  .metadata({ actionName: "updateNettoyageTarifAction" })
  .schema(tarifSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({ parsedInput: nettoyageTarifInput }: { parsedInput: Tarif }) => {
      const locale = await getLocale();
      const session = await getSession();
      const currentUser = session?.user;
      const fournisseurId = currentUser?.fournisseurId;
      if (!fournisseurId) {
        return {
          success: false,
          message:
            locale === "fr"
              ? "Vous devez être connecté pour mettre à jour vos tarifs de nettoyage."
              : "You must be logged in to update your cleaning rates.",
        };
      }
      // Check if the tarif belongs to the fournisseur

      if (nettoyageTarifInput.table === "nettoyageTarifs") {
        const tarif = await db
          .select()
          .from(nettoyageTarifs)
          .where(
            eq(nettoyageTarifs.id, nettoyageTarifInput.id) &&
              eq(nettoyageTarifs.fournisseurId, fournisseurId)
          )
          .limit(1);

        if (!tarif || tarif.length === 0) {
          return {
            success: false,
            message:
              locale === "fr"
                ? "Ce tarif n'existe pas ou vous n'êtes pas autorisé à le modifier"
                : "This rate does not exist or you are not authorized to modify it",
          };
        }
        let valueToStore = nettoyageTarifInput.value;
        if (
          nettoyageTarifInput.field === "hParPassage" ||
          nettoyageTarifInput.field === "tauxHoraire"
        ) {
          valueToStore = nettoyageTarifInput.value;
        }
        await db
          .update(nettoyageTarifs)
          .set({ [nettoyageTarifInput.field]: valueToStore })
          .where(eq(nettoyageTarifs.id, nettoyageTarifInput.id));

        return {
          success: true,
          message:
            locale === "fr"
              ? "Tarif mis à jour avec succès"
              : "Rate updated successfully",
        };
      } else if (nettoyageTarifInput.table === "nettoyageRepasseTarifs") {
        const tarif = await db
          .select()
          .from(nettoyageRepasseTarifs)
          .where(
            eq(nettoyageRepasseTarifs.id, nettoyageTarifInput.id) &&
              eq(nettoyageRepasseTarifs.fournisseurId, fournisseurId)
          )
          .limit(1);

        if (!tarif || tarif.length === 0) {
          return {
            success: false,
            message:
              locale === "fr"
                ? "Ce tarif n'existe pas ou vous n'êtes pas autorisé à le modifier"
                : "This rate does not exist or you are not authorized to modify it",
          };
        }
        let valueToStore = nettoyageTarifInput.value;
        if (
          nettoyageTarifInput.field === "hParPassage" ||
          nettoyageTarifInput.field === "tauxHoraire"
        ) {
          valueToStore = nettoyageTarifInput.value;
        }
        await db
          .update(nettoyageRepasseTarifs)
          .set({ [nettoyageTarifInput.field]: valueToStore })
          .where(eq(nettoyageRepasseTarifs.id, nettoyageTarifInput.id));

        return {
          success: true,
          message:
            locale === "fr"
              ? "Tarif mis à jour avec succès"
              : "Rate updated successfully",
        };
      }
    }
  );
