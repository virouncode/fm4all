"use server";

import { db } from "@/db";
import { devis, devisTemporaires } from "@/db/schema";
import { actionClient } from "@/lib/safe-actions";
import {
  insertDevisSchema,
  insertDevisTemporaireSchema,
  InsertDevisTemporaireType,
  InsertDevisType,
} from "@/zod-schemas/devis";
import { getLocale } from "next-intl/server";
import { flattenValidationErrors } from "next-safe-action";

export const insertDevisTemporaireAction = actionClient
  .metadata({ actionName: "insertDevisTemporaireAction" })
  .inputSchema(insertDevisTemporaireSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({
      parsedInput: devisTemporaireInput,
    }: {
      parsedInput: InsertDevisTemporaireType;
    }) => {
      const locale = await getLocale();
      let insertedDevisId: number | null = null;

      const resultDevisTemporaire = await db
        .insert(devisTemporaires)
        .values(devisTemporaireInput)
        .returning({ id: devisTemporaires.id });
      insertedDevisId = resultDevisTemporaire[0].id;

      return {
        success: true,
        message:
          locale === "fr"
            ? "Votre progression a bien été enregistrée, merci !"
            : "Your progress has been saved, thank you!",
        data: { id: insertedDevisId },
      };
    },
  );

export const insertDevisAction = actionClient
  .metadata({ actionName: "insertDevisAction" })
  .schema(insertDevisSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({ parsedInput: devisInput }: { parsedInput: InsertDevisType }) => {
      const locale = await getLocale();
      let insertedDevisId: number | null = null;

      const resultDevis = await db
        .insert(devis)
        .values(devisInput)
        .returning({ id: devis.id });

      insertedDevisId = resultDevis[0].id;

      return {
        success: true,
        message:
          locale === "fr"
            ? "Votre devis a bien été enregistrée, nous vous contacterons dans les plus brefs délais, merci !"
            : "Your quote has been saved, we will contact you as soon as possible, thank you!",
        data: { id: insertedDevisId },
      };
    },
  );
