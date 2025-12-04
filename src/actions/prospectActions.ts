"use server";

import { db } from "@/db";
import { getSession } from "@/lib/auth-session";
import { getProspects } from "@/lib/queries/prospects/getProspects";
import { actionClient } from "@/lib/safe-actions";
import {
  insertProspectSchema,
  prospectsQueryBackendSchema,
} from "@/zod-schemas/prospect";
import { and, eq } from "drizzle-orm";
import { getLocale } from "next-intl/server";
import { flattenValidationErrors } from "next-safe-action";
import { prospects } from "../db/schema";

export const insertProspectAction = actionClient
  .metadata({
    actionName: "insertProspectAction",
  })
  .inputSchema(insertProspectSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const locale = await getLocale();
    //Existing prospect
    const [existingProspect] = await db
      .select({ id: prospects.id })
      .from(prospects)
      .where(
        and(
          eq(prospects.emailContact, parsedInput.emailContact),
          eq(prospects.nomContact, parsedInput.nomContact),
        ),
      );
    if (existingProspect) {
      const [updatedProspect] = await db
        .update(prospects)
        .set(parsedInput)
        .where(eq(prospects.id, existingProspect.id))
        .returning();
      if (!updatedProspect) {
        throw new Error("Erreur lors de la mise à jour du prospect");
      }
      return {
        success: true,
        message: "Prospect mis à jour avec succès",
        data: updatedProspect,
      };
    }
    const [insertedProspect] = await db
      .insert(prospects)
      .values(parsedInput)
      .returning();
    if (!insertedProspect) {
      throw new Error("Erreur lors de la création du prospect");
    }
    return {
      success: true,
      message: "Prospect créé avec succès",
      data: insertedProspect,
    };
  });

export const getProspectsAction = actionClient
  .metadata({ actionName: "getProspectsAction" })
  .inputSchema(prospectsQueryBackendSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    const locale = await getLocale();

    if (!currentUser) {
      throw new Error(
        locale === "fr"
          ? "Vous n'êtes pas authentifié."
          : "You are not authenticated.",
      );
    }

    // parsedInput EST déjà un TicketsQueryBackendType
    const prospects = await getProspects({
      query: parsedInput,
    });

    return prospects;
  });
