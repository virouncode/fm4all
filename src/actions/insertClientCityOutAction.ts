"use server";

import { db } from "@/db";
import { clients } from "@/db/schema";
import { capitalize } from "@/lib/capitalize";
import { actionClient } from "@/lib/safe-actions";
import { insertClientSchema, InsertClientType } from "@/zod-schemas/client";
import { and, eq } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";

export const insertClientCityOutAction = actionClient
  .metadata({ actionName: "insertClientCityOutAction" })
  .schema(insertClientSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({ parsedInput: clientInput }: { parsedInput: InsertClientType }) => {
      try {
        const clientToPost: InsertClientType = {
          ...clientInput,
          nomEntreprise: clientInput.nomEntreprise.toUpperCase(),
          prenomContact: capitalize(clientInput.prenomContact),
          nomContact: capitalize(clientInput.nomContact),
          posteContact: capitalize(clientInput.posteContact),
          adresseLigne1: capitalize(clientInput.adresseLigne1),
          adresseLigne2: capitalize(clientInput.adresseLigne2),
          ville: capitalize(clientInput.ville),
          emailContact: clientInput.emailContact.toLowerCase(),
        };
        const existingClient = await db
          .select({ id: clients.id })
          .from(clients)
          .where(
            and(
              eq(clients.emailContact, clientToPost.emailContact),
              eq(clients.nomContact, clientToPost.nomContact)
            )
          )
          .limit(1);
        if (existingClient.length > 0) {
          const resultClient = await db
            .update(clients)
            .set(clientToPost)
            .where(eq(clients.id, existingClient[0].id))
            .returning({ id: clients.id });
          if (!resultClient[0]?.id) {
            throw new Error("Impossible de mettre à jour vos coordonnées.");
          }
          return {
            success: true,
            message: `${clientToPost.nomEntreprise}, vos coordonnées ont été mises à jour`,
          };
        }
        const resultClient = await db
          .insert(clients)
          .values(clientToPost)
          .returning({ id: clients.id });

        if (!resultClient[0]?.id) {
          throw new Error("Impossible d'enregistrer vos coordonnées.");
        }
        return {
          success: true,
          message: `${clientToPost.nomEntreprise}, vos coordonnées ont été enregistrées, nous prendrons contact avec vous dans les plus brefs délais. A bientôt !`,
        };
      } catch (err) {
        if (err instanceof Error) {
          console.log(err.message);
        }
        throw err;
      }
    }
  );
