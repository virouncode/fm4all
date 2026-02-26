"use server";

import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import { getClientPrestataires } from "@/server/queries/clientServiceExecutions.query";
import { getUserAdhesion } from "@/server/queries/userAdhesions.query";
import { flattenValidationErrors } from "next-safe-action";
import { z } from "zod";

/**
 * Récupère la liste des prestataires avec lesquels un client a une relation
 * (via clientServiceExecutions actifs)
 */
export const getClientPrestatairesAction = actionClient
  .metadata({ actionName: "getClientPrestatairesAction" })
  .inputSchema(
    z.object({
      clientEntrepriseId: z.uuid(),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // Vérifier que l'utilisateur a accès à cette entreprise
    const adhesion = await getUserAdhesion({
      userId: currentUser.id,
      entrepriseId: parsedInput.clientEntrepriseId,
    });

    if (!adhesion) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    const prestataires = await getClientPrestataires(
      parsedInput.clientEntrepriseId,
    );

    return { prestataires };
  });
