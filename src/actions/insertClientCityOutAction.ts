"use server";

import { db } from "@/db";
import { clients } from "@/db/schema";
import { capitalize } from "@/lib/capitalize";
import { actionClient } from "@/lib/safe-actions";
import { insertClientSchema, InsertClientType } from "@/zod-schemas/client";
import { and, eq } from "drizzle-orm";
import { getLocale } from "next-intl/server";
import { flattenValidationErrors } from "next-safe-action";

export const insertClientCityOutAction = actionClient
  .metadata({ actionName: "insertClientCityOutAction" })
  .schema(insertClientSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({ parsedInput: clientInput }: { parsedInput: InsertClientType }) => {
      const locale = await getLocale();
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
            throw new Error(
              locale === "fr"
                ? "Impossible de mettre à jour vos coordonnées."
                : "Unable to update your contact information."
            );
          }
          return {
            success: true,
            message: `${clientToPost.nomEntreprise}, ${locale === "fr" ? "vos coordonnées ont été mises à jour." : "your contact information has been updated."}`,
          };
        }
        const resultClient = await db
          .insert(clients)
          .values(clientToPost)
          .returning({ id: clients.id });

        if (!resultClient[0]?.id) {
          throw new Error(
            locale === "fr"
              ? "Impossible d'enregistrer vos coordonnées."
              : "Unable to update your contact information"
          );
        }
        return {
          success: true,
          message: `${clientToPost.nomEntreprise}, ${locale === "fr" ? "vos coordonnées ont été enregistrées, nous prendrons contact avec vous dans les plus brefs délais. A bientôt !" : "your contact information has been saved. We will get in touch with you as soon as possible. See you soon!"}`,
        };
      } catch (err) {
        if (err instanceof Error) {
          console.log(err.message);
        }
        throw err;
      }
    }
  );
