"use server";

import { db } from "@/db";
import { clients } from "@/db/schema";
import { capitalize } from "@/lib/capitalize";
import { formatSIRET } from "@/lib/isValideSIRET";
import { actionClient } from "@/lib/safe-actions";
import {
  insertClientSchema,
  InsertClientType,
  updateClientSchema,
  UpdateClientType,
} from "@/zod-schemas/client";
import { and, eq } from "drizzle-orm";
import { getLocale } from "next-intl/server";
import { flattenValidationErrors } from "next-safe-action";

export const insertClientAction = actionClient
  .metadata({ actionName: "insertClientAction" })
  .schema(insertClientSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({ parsedInput: clientInput }: { parsedInput: InsertClientType }) => {
      const locale = await getLocale();
      const clientToPost: InsertClientType = {
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
      //Si le client existe déjà, on met à jour ses coordonnées
      if (existingClient.length > 0) {
        const updatedClient = await updateClientAction({
          id: existingClient[0].id,
          ...clientToPost,
        });
        return {
          success: true,
          message: `${clientToPost.nomEntreprise}, ${locale === "fr" ? "vos coordonnées ont été mises à jour." : "your contact information has been updated."}`,
          data: { client: updatedClient?.data?.data.client },
        };
      }
      //Si le client n'existe pas, on l'insère
      const resultClient = await db
        .insert(clients)
        .values(clientToPost)
        .returning();

      if (!resultClient[0]?.id) {
        throw new Error(
          locale === "fr"
            ? "Impossible d'enregistrer vos coordonnées."
            : "Unable to save your contact information"
        );
      }
      return {
        success: true,
        message: `${clientToPost.nomEntreprise}, ${locale === "fr" ? "vos coordonnées ont été enregistrées, nous prendrons contact avec vous dans les plus brefs délais. A bientôt !" : "your contact information has been saved. We will get in touch with you as soon as possible. See you soon!"}`,
        data: { client: resultClient[0] },
      };
    }
  );

export const updateClientAction = actionClient
  .metadata({ actionName: "updateClientAction" })
  .schema(updateClientSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({ parsedInput: clientInput }: { parsedInput: UpdateClientType }) => {
      const locale = await getLocale();
      if (!clientInput.id) {
        throw new Error(
          locale === "fr"
            ? "Impossible de mettre à jour vos informations."
            : "Unable to update your information."
        );
      }
      const clientToUpdate: UpdateClientType = {
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
      const resultClient = await db
        .update(clients)
        .set(clientToUpdate)
        .where(eq(clients.id, clientInput.id))
        .returning();
      if (!resultClient[0]?.id) {
        throw new Error(
          locale === "fr"
            ? "Impossible de mettre à jour vos informations."
            : "Unable to update your information."
        );
      }
      return {
        success: true,
        message: `${clientToUpdate.nomEntreprise}, ${locale === "fr" ? "vos coordonnées ont été mises à jour." : "your contact information has been updated."}`,
        data: { client: resultClient[0] },
      };
    }
  );
