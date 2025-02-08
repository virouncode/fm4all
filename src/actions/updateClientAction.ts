"use server";

import { db } from "@/db";
import { clients } from "@/db/schema";
import { capitalize } from "@/lib/capitalize";
import { actionClient } from "@/lib/safe-actions";
import { updateClientSchema, UpdateClientType } from "@/zod-schemas/client";
import { eq } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";

export const updateClientAction = actionClient
  .metadata({ actionName: "updateClientAction" })
  .schema(updateClientSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({ parsedInput: clientInput }: { parsedInput: UpdateClientType }) => {
      if (!clientInput.id) {
        throw new Error("Patient ID is required");
      }
      const clientToUpdate: UpdateClientType = {
        ...clientInput,
        nomEntreprise: clientInput.nomEntreprise
          ? clientInput.nomEntreprise.toUpperCase()
          : clientInput.nomEntreprise,
        prenomContact: capitalize(clientInput.prenomContact),
        nomContact: capitalize(clientInput.nomContact),
        posteContact: capitalize(clientInput.posteContact),
        adresseLigne1: capitalize(clientInput.adresseLigne1),
        adresseLigne2: capitalize(clientInput.adresseLigne2),
        ville: capitalize(clientInput.ville),
      };
      const resultClient = await db
        .update(clients)
        .set(clientToUpdate)
        .where(eq(clients.id, clientInput.id))
        .returning({ id: clients.id });

      if (!resultClient[0]?.id) {
        throw new Error("Impossible de mettre le client à jour");
      }
    }
  );
