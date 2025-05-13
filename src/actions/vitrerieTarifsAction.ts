"use server";

import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import { nettoyageVitrerieTarifs } from "@/db/schema";
import { getSession } from "@/lib/auth-session";
import { invalidateCacheTagsWithData } from "@/lib/cache-invalidation";
import { getFournisseurTag, getGlobalTag } from "@/lib/data-cache";
import { actionClient } from "@/lib/safe-actions";
import {
  updateVitrerieTarifsServerSchema,
  UpdateVitrerieTarifsServerType,
} from "@/zod-schemas/nettoyageVitrerie";
import { eq } from "drizzle-orm";
import { getLocale } from "next-intl/server";
import { flattenValidationErrors } from "next-safe-action";

export const updateVitrerieTarifAction = actionClient
  .metadata({ actionName: "updateVitrerieTarifAction" })
  .schema(updateVitrerieTarifsServerSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({
      parsedInput: vitrerieTarifInput,
    }: {
      parsedInput: UpdateVitrerieTarifsServerType;
    }) => {
      const locale = await getLocale();
      const session = await getSession();
      const currentUser = session?.user;
      const fournisseurId = currentUser?.fournisseurId;
      delete vitrerieTarifInput.updatedAt;

      if (!fournisseurId) {
        return {
          success: false,
          message:
            locale === "fr"
              ? "Vous devez être connecté pour mettre à jour vos tarifs de nettoyage vitrerie."
              : "You must be logged in to update your window cleaning rates.",
        };
      }
      if (!vitrerieTarifInput.id) {
        return {
          success: false,
          message:
            locale === "fr"
              ? "L'ID du tarif est requis"
              : "The tarif ID is required",
        };
      }
      if (!vitrerieTarifInput.tauxHoraire) {
        return {
          success: false,
          message:
            locale === "fr"
              ? "Le taux horaire est requis"
              : "The hourly rate is required",
        };
      }
      // Check if the tarif belongs to the fournisseur
      const tarif = await db
        .select()
        .from(nettoyageVitrerieTarifs)
        .where(
          eq(nettoyageVitrerieTarifs.id, vitrerieTarifInput.id) &&
            eq(nettoyageVitrerieTarifs.fournisseurId, fournisseurId)
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
      await db
        .update(nettoyageVitrerieTarifs)
        .set(vitrerieTarifInput)
        .where(eq(nettoyageVitrerieTarifs.id, vitrerieTarifInput.id));

      // Invalider le cache pour tous les utilisateurs avec les données mises à jour
      await invalidateCacheTagsWithData(
        [
          getFournisseurTag("vitrerieTarifs", fournisseurId),
          getGlobalTag("vitrerieTarifs"),
        ],
        {
          serviceType: "nettoyage",
          tarifType: "vitrerie",
          tarifId: vitrerieTarifInput.id,
          fournisseurId,
          cadenceVitres: vitrerieTarifInput.cadenceVitres as number,
          cadenceCloisons: vitrerieTarifInput.cadenceCloisons as number,
          tauxHoraireVitrerie: vitrerieTarifInput.tauxHoraire
            ? vitrerieTarifInput.tauxHoraire / RATIO
            : null,
          minFacturationVitrerie: vitrerieTarifInput.minFacturation
            ? vitrerieTarifInput.minFacturation / RATIO
            : null,
          fraisDeplacementVitrerie: vitrerieTarifInput.fraisDeplacement
            ? vitrerieTarifInput.fraisDeplacement / RATIO
            : null,
        }
      );

      return {
        success: true,
        message:
          locale === "fr"
            ? "Tarif de vitrerie mis à jour avec succès"
            : "Window rate updated successfully",
      };
    }
  );
