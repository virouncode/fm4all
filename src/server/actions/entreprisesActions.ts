"use server";

import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import {
  getAllEntreprises,
  getEntreprisesClientes,
  getEntreprisesPrestataires,
} from "@/server/queries/entreprises.query";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";

/**
 * Récupère la liste de toutes les entreprises
 * Utilisé pour afficher les noms dans les colonnes relationnelles
 */
export const getEntreprisesAction = actionClient
  .metadata({ actionName: "getEntreprisesAction" })
  .action(async () => {
    const entreprises = await getAllEntreprises();
    return { entreprises };
  });

/**
 * Récupère la liste des entreprises clientes
 * Réservé à la plateforme uniquement
 */
export const getEntreprisesClientesAction = actionClient
  .metadata({ actionName: "getEntreprisesClientesAction" })
  .action(async () => {
    // Vérifier que l'utilisateur est plateforme
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    const plateformeRole = await getUserPlateformeAdhesion(currentUser.id);

    if (!plateformeRole) {
      throw errors.forbidden(
        "Seule la plateforme peut accéder à cette ressource.",
      );
    }

    const clients = await getEntreprisesClientes();

    return { clients };
  });

/**
 * Récupère la liste des entreprises prestataires
 * Utilisé pour le filtre prestataire dans les tickets
 */
export const getEntreprisesPrestatairesAction = actionClient
  .metadata({ actionName: "getEntreprisesPrestatairesAction" })
  .action(async () => {
    const prestataires = await getEntreprisesPrestataires();
    return { prestataires };
  });
