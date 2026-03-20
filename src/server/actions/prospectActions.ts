"use server";

import { db } from "@/db";
import { prospects } from "@/db/schema";
import { actionClient } from "@/lib/action/safe-actions";
import { insertProspectSchema } from "@/zod-schemas/prospect.schema";
import { and, eq } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";

//upsert
export const insertProspectAction = actionClient
  .metadata({
    actionName: "insertProspectAction",
  })
  .inputSchema(insertProspectSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
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

