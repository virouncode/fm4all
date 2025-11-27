"use server";

import { db } from "@/db";
import { clients } from "@/db/schema";
import { actionClient } from "@/lib/safe-actions";
import { capitalize } from "@/lib/utils/capitalize";
import { formatSIRET } from "@/lib/utils/isValidSIRET";
import {
  insertClientSchema,
  InsertClientType,
  updateClientSchema,
  UpdateClientType,
} from "@/zod-schemas/client";
import { and, eq } from "drizzle-orm";
import { getLocale } from "next-intl/server";
import { flattenValidationErrors } from "next-safe-action";

function normalizeClientInput<T extends InsertClientType | UpdateClientType>(
  clientInput: T,
): T {
  return {
    ...clientInput,
    nomEntreprise: clientInput.nomEntreprise?.toUpperCase(),
    siret: clientInput.siret
      ? formatSIRET(clientInput.siret)
      : clientInput.siret,
    prenomContact: capitalize(clientInput.prenomContact),
    nomContact: capitalize(clientInput.nomContact),
    posteContact: capitalize(clientInput.posteContact),
    emailContact: clientInput.emailContact?.toLowerCase(),
    prenomSignataire: capitalize(clientInput.prenomSignataire),
    nomSignataire: capitalize(clientInput.nomSignataire),
    posteSignataire: capitalize(clientInput.posteSignataire),
    emailSignataire: clientInput.emailSignataire
      ? clientInput.emailSignataire.toLowerCase()
      : clientInput.emailSignataire,
    adresseLigne1: capitalize(clientInput.adresseLigne1),
    adresseLigne2: capitalize(clientInput.adresseLigne2),
    ville: capitalize(clientInput.ville),
  };
}

export const insertClientAction = actionClient
  .metadata({ actionName: "insertClientAction" })
  .inputSchema(insertClientSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }: { parsedInput: InsertClientType }) => {
    const locale = await getLocale();
    const clientToPost = normalizeClientInput(parsedInput);

    const result = await db.transaction(async (tx) => {
      const existingClient = await tx
        .select({ id: clients.id })
        .from(clients)
        .where(
          and(
            eq(clients.emailContact, clientToPost.emailContact),
            eq(clients.nomContact, clientToPost.nomContact),
          ),
        )
        .limit(1);

      // Si le client existe déjà, on met à jour ses coordonnées
      if (existingClient.length > 0) {
        const updatedClient = await tx
          .update(clients)
          .set(clientToPost)
          .where(eq(clients.id, existingClient[0].id))
          .returning();

        return {
          success: true as const,
          message: `${clientToPost.nomEntreprise}, ${
            locale === "fr"
              ? "vos coordonnées ont été mises à jour."
              : "your contact information has been updated."
          }`,
          data: { client: updatedClient[0] },
        };
      }

      // Si le client n'existe pas, on l'insère
      const insertedClient = await tx
        .insert(clients)
        .values(clientToPost)
        .returning();

      return {
        success: true as const,
        message: `${clientToPost.nomEntreprise}, ${
          locale === "fr"
            ? "vos coordonnées ont été enregistrées, nous prendrons contact avec vous dans les plus brefs délais. A bientôt !"
            : "your contact information has been saved. We will get in touch with you as soon as possible. See you soon!"
        }`,
        data: { client: insertedClient[0] },
      };
    });

    return result;
  });

export const updateClientAction = actionClient
  .metadata({ actionName: "updateClientAction" })
  .inputSchema(updateClientSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }: { parsedInput: UpdateClientType }) => {
    const locale = await getLocale();

    if (!parsedInput.id) {
      return {
        success: false as const,
        message:
          locale === "fr"
            ? "L'id du client est requis pour la mise à jour."
            : "Client ID is required for update.",
      };
    }

    const clientToUpdate = normalizeClientInput(parsedInput);

    const resultClient = await db
      .update(clients)
      .set(clientToUpdate)
      .where(eq(clients.id, parsedInput.id))
      .returning();

    return {
      success: true as const,
      message: `${clientToUpdate.nomEntreprise}, ${
        locale === "fr"
          ? "vos coordonnées ont été mises à jour."
          : "your contact information has been updated."
      }`,
      data: { client: resultClient[0] },
    };
  });
