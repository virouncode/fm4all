"use server";

import { actionClient } from "@/lib/action/safe-actions";
import { getAllServices } from "@/server/queries/services.query";
import { getSession } from "@/server/auth/get-session";
import { errors } from "@/lib/action/errors";

/**
 * Récupère la liste de tous les services du catalogue
 * Utilisé pour alimenter les selects dans les formulaires
 */
export const getServicesAction = actionClient
  .metadata({ actionName: "getServicesAction" })
  .action(async () => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    const services = await getAllServices();
    return { services };
  });
