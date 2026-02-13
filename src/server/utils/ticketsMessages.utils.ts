import "server-only";

import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import { TicketMessageVisibiliteType } from "@/zod-schemas/enums";

/**
 * Vérifie si un utilisateur peut écrire avec une visibilité donnée
 *
 * Règles métier:
 * - Plateforme: ✅ Peut tout écrire
 * - Client: ❌ Ne peut PAS écrire fournisseur_only
 * - Fournisseur: ❌ Ne peut PAS écrire client_only
 * - public et fm4all_only: Tous peuvent écrire (filtrage lecture géré ailleurs)
 *
 * @param userId - ID de l'utilisateur
 * @param entrepriseId - ID de l'entreprise active
 * @param visibilite - Visibilité souhaitée pour le message
 * @returns true si l'utilisateur peut écrire avec cette visibilité
 */
export async function canUserWriteVisibility({
  userId,
  entrepriseId,
  visibilite,
}: {
  userId: string;
  entrepriseId: string;
  visibilite: TicketMessageVisibiliteType;
}): Promise<boolean> {
  // Plateforme peut tout écrire
  const platformRole = await getUserPlateformeAdhesion(userId);
  if (platformRole?.role) {
    return true;
  }

  // Déterminer posture (client/fournisseur)
  const { getEntrepriseById } = await import(
    "@/server/queries/entreprise.query"
  );
  const entreprise = await getEntrepriseById(entrepriseId);

  const isClient = entreprise?.roles.includes("client");
  const isFournisseur = entreprise?.roles.includes("prestataire");

  // Client ne peut pas écrire fournisseur_only
  if (isClient && visibilite === "fournisseur_only") {
    return false;
  }

  // Fournisseur ne peut pas écrire client_only
  if (isFournisseur && visibilite === "client_only") {
    return false;
  }

  // public et fm4all_only: OK pour tous
  return true;
}
