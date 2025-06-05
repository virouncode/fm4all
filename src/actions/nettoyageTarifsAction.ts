"use server";

import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import { nettoyageRepasseTarifs, nettoyageTarifs } from "@/db/schema";
import { getSession } from "@/lib/auth-session";
import { invalidateCacheTagsWithData } from "@/lib/cache-invalidation";
import { getFournisseurTag, getSurfaceTag } from "@/lib/data-cache";
import { actionClient } from "@/lib/safe-actions";
import { GammeType } from "@/zod-schemas/gamme";
import { SelectNettoyageTarifFournisseurType } from "@/zod-schemas/nettoyageTarifs";
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
    "imageUrl",
    "infos",
    "createdAt",
    "updatedAt",
  ]),
  value: z.number().min(1, "La valeur est requise"),
  surface: z.number().min(1, "La surface est requise"),
  table: z.enum(["nettoyageTarifs", "nettoyageRepasseTarifs"]),
  gamme: z.enum(["essentiel", "confort", "excellence"]),
});
type Tarif = {
  id: number;
  field: keyof SelectNettoyageTarifFournisseurType;
  value: number;
  surface: number;
  table: "nettoyageTarifs" | "nettoyageRepasseTarifs";
  gamme: GammeType;
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

        // Invalider le cache pour tous les utilisateurs avec les données mises à jour
        await invalidateCacheTagsWithData(
          [
            getSurfaceTag(
              "nettoyageTarifs",
              nettoyageTarifInput.surface.toString()
            ),
            getFournisseurTag("nettoyageTarifs", fournisseurId),
          ],
          {
            serviceType: "nettoyage",
            tarifType: "standard",
            tarifId: nettoyageTarifInput.id,
            field: nettoyageTarifInput.field,
            value: valueToStore / RATIO,
            fournisseurId,
            surface: nettoyageTarifInput.surface,
            gamme: nettoyageTarifInput.gamme,
          }
        );

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

        await invalidateCacheTagsWithData(
          [
            getSurfaceTag(
              "repasseTarifs",
              nettoyageTarifInput.surface.toString()
            ),
            getFournisseurTag("repasseTarifs", fournisseurId),
          ],
          {
            serviceType: "nettoyage",
            tarifType: "repasse",
            tarifId: nettoyageTarifInput.id,
            field: nettoyageTarifInput.field,
            value: valueToStore / RATIO,
            fournisseurId,
            surface: nettoyageTarifInput.surface,
            gamme: tarif[0].gamme,
          }
        );

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
