"use server";

import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import { getEntreprisesClientes } from "@/server/queries/entreprises.query";

/**
 * Récupère la liste des entreprises clientes
 * Réservé à la plateforme uniquement
 */
export const getEntreprisesClientesAction = actionClient.action(
  async ({ ctx }) => {
    const { currentUser } = ctx;

    // Vérifier que l'utilisateur est plateforme
    const plateformeRole = await getUserPlateformeAdhesion(currentUser.id);

    if (!plateformeRole) {
      throw errors.forbidden(
        "Seule la plateforme peut accéder à cette ressource.",
      );
    }

    const clients = await getEntreprisesClientes();

    return { clients };
  },
);
