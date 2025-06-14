"use server";

import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import {
  hygieneConsoTarifs,
  hygieneDistribTarifs,
  hygieneInstalDistribTarifs,
  hygieneMinFacturation,
} from "@/db/schema";
import { getSession } from "@/lib/auth-session";
import { invalidateCacheTagsWithData } from "@/lib/cache-invalidation";
import {
  getEffectifTag,
  getFournisseurTag,
  getGlobalTag,
} from "@/lib/data-cache";
import { actionClient } from "@/lib/safe-actions";
import { GammeType } from "@/zod-schemas/gamme";
import { SelectHygieneConsoTarifsFournisseurType } from "@/zod-schemas/hygieneConsoTarifs";
import { SelectHygieneDistribTarifsFournisseurType } from "@/zod-schemas/hygieneDistribTarifs";
import { SelectHygieneInstalDistribTarifsFournisseurType } from "@/zod-schemas/hygieneInstalDistribTarifs";
import { eq } from "drizzle-orm";
import { getLocale } from "next-intl/server";
import { flattenValidationErrors } from "next-safe-action";
import { z } from "zod";
import {
  updateHygieneMinFacturationServerSchema,
  UpdateHygieneMinFacturationType,
} from "./../zod-schemas/hygieneMinFacturation";

const tarifSchema = z.object({
  id: z.number().min(1, "L'ID du tarif est requis"),
  field: z.enum([
    "id",
    "type",
    "gamme",
    "oneShot",
    "pa12M",
    "pa24M",
    "pa36M",
    "imageUrl",
    "fournisseurId",
    "imageUrl",
    "infos",
    "createdAt",
    "updatedAt",
  ]),
  value: z.number().min(1, "La valeur est requise"),
  gamme: z.enum(["essentiel", "confort", "excellence"]),
  distributeurType: z.enum([
    "emp",
    "poubelleEmp",
    "ph",
    "savon",
    "desinfectant",
    "parfum",
    "balai",
    "poubelle",
  ]),
});
type Tarif = {
  id: number;
  field: keyof SelectHygieneDistribTarifsFournisseurType;
  value: number;
  gamme: GammeType;
  distributeurType:
    | "emp"
    | "poubelleEmp"
    | "ph"
    | "savon"
    | "desinfectant"
    | "parfum"
    | "balai"
    | "poubelle";
};

export const updateHygieneTarifDistribAction = actionClient
  .metadata({ actionName: "updateHygieneTarifDistribAction" })
  .schema(tarifSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({ parsedInput: hygieneTarifInput }: { parsedInput: Tarif }) => {
      const locale = await getLocale();
      const session = await getSession();
      const currentUser = session?.user;
      const fournisseurId = currentUser?.fournisseurId;
      if (!fournisseurId) {
        return {
          success: false,
          message:
            locale === "fr"
              ? "Vous devez être connecté pour mettre à jour vos tarifs d'hygiène."
              : "You must be logged in to update your hygiene rates.",
        };
      }
      // Check if the tarif belongs to the fournisseur
      const tarif = await db
        .select()
        .from(hygieneDistribTarifs)
        .where(
          eq(hygieneDistribTarifs.id, hygieneTarifInput.id) &&
            eq(hygieneDistribTarifs.fournisseurId, fournisseurId)
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

      let valueToStore = hygieneTarifInput.value;
      if (
        hygieneTarifInput.field === "oneShot" ||
        hygieneTarifInput.field === "pa12M" ||
        hygieneTarifInput.field === "pa24M" ||
        hygieneTarifInput.field === "pa36M"
      ) {
        valueToStore = hygieneTarifInput.value;
      }

      await db
        .update(hygieneDistribTarifs)
        .set({ [hygieneTarifInput.field]: valueToStore })
        .where(eq(hygieneDistribTarifs.id, hygieneTarifInput.id));

      await invalidateCacheTagsWithData(
        [
          getFournisseurTag("hygieneDistribTarifs", fournisseurId),
          getGlobalTag("hygieneDistribTarifs"),
        ],
        {
          serviceType: "hygiene",
          tarifType: "distributeurs",
          distributeurType: hygieneTarifInput.distributeurType,
          field: hygieneTarifInput.field,
          value: valueToStore / RATIO,
          fournisseurId,
          gamme: hygieneTarifInput.gamme,
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
  );

const tarifInstalSchema = z.object({
  id: z.number().min(1, "L'ID du tarif est requis"),
  field: z.enum([
    "id",
    "effectif",
    "prixInstallation",
    "fournisseurId",
    "createdAt",
    "updatedAt",
  ]),
  value: z.number().min(1, "La valeur est requise"),
  effectif: z.number().min(1, "L'effectif est requis"),
});
type TarifInstal = {
  id: number;
  field: keyof SelectHygieneInstalDistribTarifsFournisseurType;
  value: number;
  effectif: number;
};

export const updateHygieneTarifInstalAction = actionClient
  .metadata({ actionName: "updateHygieneTarifInstalAction" })
  .schema(tarifInstalSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({
      parsedInput: hygieneTarifInput,
    }: {
      parsedInput: TarifInstal;
    }) => {
      const locale = await getLocale();
      const session = await getSession();
      const currentUser = session?.user;
      const fournisseurId = currentUser?.fournisseurId;
      if (!fournisseurId) {
        return {
          success: false,
          message:
            locale === "fr"
              ? "Vous devez être connecté pour mettre à jour vos tarifs d'installation d'hygiène."
              : "You must be logged in to update your hygiene installation rates.",
        };
      }
      // Check if the tarif belongs to the fournisseur
      const tarif = await db
        .select()
        .from(hygieneInstalDistribTarifs)
        .where(
          eq(hygieneInstalDistribTarifs.id, hygieneTarifInput.id) &&
            eq(hygieneInstalDistribTarifs.fournisseurId, fournisseurId)
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

      let valueToStore = hygieneTarifInput.value;
      if (
        hygieneTarifInput.field === "effectif" ||
        hygieneTarifInput.field === "prixInstallation"
      ) {
        valueToStore = hygieneTarifInput.value;
      }

      await db
        .update(hygieneInstalDistribTarifs)
        .set({ [hygieneTarifInput.field]: valueToStore })
        .where(eq(hygieneInstalDistribTarifs.id, hygieneTarifInput.id));

      await invalidateCacheTagsWithData(
        [
          getEffectifTag(
            "hygieneInstalDistribTarifs",
            hygieneTarifInput.effectif.toString()
          ),
          getFournisseurTag("hygieneInstalDistribTarifs", fournisseurId),
        ],
        {
          serviceType: "hygiene",
          tarifType: "installation",
          field: hygieneTarifInput.field,
          value: valueToStore / RATIO,
          fournisseurId,
          effectif: hygieneTarifInput.effectif,
        }
      );

      return {
        success: true,
        message:
          locale === "fr"
            ? "Tarif d'installation mis à jour avec succès"
            : "Installation rate updated successfully",
      };
    }
  );

const tarifConsoSchema = z.object({
  id: z.number().min(1, "L'ID du tarif est requis"),
  field: z.enum([
    "id",
    "effectif",
    "paParPersonneEmp",
    "paParPersonneSavon",
    "paParPersonnePh",
    "paParPersonneDesinfectant",
    "fournisseurId",
    "imageUrl",
    "infos",
    "createdAt",
    "updatedAt",
  ]),
  value: z.number().min(1, "La valeur est requise"),
  effectif: z.number().min(1, "L'effectif est requis"),
});
type TarifConso = {
  id: number;
  field: keyof SelectHygieneConsoTarifsFournisseurType;
  value: number;
  effectif: number;
};

export const updateHygieneTarifConsoAction = actionClient
  .metadata({ actionName: "updateHygieneTarifConsoAction" })
  .schema(tarifConsoSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({ parsedInput: hygieneTarifInput }: { parsedInput: TarifConso }) => {
      const locale = await getLocale();
      const session = await getSession();
      const currentUser = session?.user;
      const fournisseurId = currentUser?.fournisseurId;
      if (!fournisseurId) {
        return {
          success: false,
          message:
            locale === "fr"
              ? "Vous devez être connecté pour mettre à jour vos tarifs de consommables d'hygiène."
              : "You must be logged in to update your hygiene consumables rates.",
        };
      }
      // Check if the tarif belongs to the fournisseur
      const tarif = await db
        .select()
        .from(hygieneConsoTarifs)
        .where(
          eq(hygieneConsoTarifs.id, hygieneTarifInput.id) &&
            eq(hygieneConsoTarifs.fournisseurId, fournisseurId)
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

      let valueToStore = hygieneTarifInput.value;
      if (
        hygieneTarifInput.field === "effectif" ||
        hygieneTarifInput.field === "paParPersonneEmp" ||
        hygieneTarifInput.field === "paParPersonneSavon" ||
        hygieneTarifInput.field === "paParPersonnePh" ||
        hygieneTarifInput.field === "paParPersonneDesinfectant"
      ) {
        valueToStore = hygieneTarifInput.value;
      }

      await db
        .update(hygieneConsoTarifs)
        .set({ [hygieneTarifInput.field]: valueToStore })
        .where(eq(hygieneConsoTarifs.id, hygieneTarifInput.id));

      await invalidateCacheTagsWithData(
        [
          getEffectifTag(
            "hygieneConsosTarifs",
            hygieneTarifInput.effectif.toString()
          ),
          getFournisseurTag("hygieneConsosTarifs", fournisseurId),
        ],
        {
          serviceType: "hygiene",
          tarifType: "consommables",
          field: hygieneTarifInput.field,
          value: valueToStore / RATIO,
          fournisseurId,
          effectif: hygieneTarifInput.effectif,
        }
      );

      return {
        success: true,
        message:
          locale === "fr"
            ? "Tarif de consommables mis à jour avec succès"
            : "Consumables rate updated successfully",
      };
    }
  );

export const updateHygieneMinFacturationAction = actionClient
  .metadata({ actionName: "updateHygieneMinFacturationAction" })
  .schema(updateHygieneMinFacturationServerSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({
      parsedInput: hygieneMinFacturationInput,
    }: {
      parsedInput: UpdateHygieneMinFacturationType;
    }) => {
      const locale = await getLocale();
      const session = await getSession();
      const currentUser = session?.user;
      const fournisseurId = currentUser?.fournisseurId;
      if (!hygieneMinFacturationInput.id) {
        return {
          success: false,
          message:
            locale === "fr"
              ? "L'ID du tarif est requis"
              : "The tarif ID is required",
        };
      }
      if (!fournisseurId) {
        return {
          success: false,
          message:
            locale === "fr"
              ? "Vous devez être connecté pour mettre à jour vos tarifs d'hygiene."
              : "You must be logged in to update your hygiene rates.",
        };
      }
      // Check if the tarif belongs to the fournisseur
      const tarif = await db
        .select()
        .from(hygieneMinFacturation)
        .where(
          eq(hygieneMinFacturation.id, hygieneMinFacturationInput.id) &&
            eq(hygieneMinFacturation.fournisseurId, fournisseurId)
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
      delete hygieneMinFacturationInput.updatedAt;
      await db
        .update(hygieneMinFacturation)
        .set({
          minFacturation: hygieneMinFacturationInput.minFacturation,
        })
        .where(eq(hygieneMinFacturation.id, hygieneMinFacturationInput.id));

      await invalidateCacheTagsWithData(
        [
          getFournisseurTag("hygieneMinFacturation", fournisseurId),
          getGlobalTag("hygieneMinFacturation"),
        ],
        {
          serviceType: "hygiene",
          tarifType: "minFacturation",
          field: "minFacturation",
          value: hygieneMinFacturationInput.minFacturation
            ? hygieneMinFacturationInput.minFacturation / RATIO
            : null,
          fournisseurId,
        }
      );

      return {
        success: true,
        message:
          locale === "fr"
            ? "Minimum annuel de facturation mis à jour avec succès"
            : "Annual minimum billing updated successfully",
      };
    }
  );
