import "server-only";

import { getEffectivePlateformeRole } from "@/server/utils/permissions.utils";
import { TicketMessageVisibiliteType } from "@/zod-schemas/enums";
import { cookies } from "next/headers";

/**
 * Vérifie si un utilisateur peut écrire avec une visibilité donnée
 *
 * Règles métier:
 * - Plateforme (posture-aware): ✅ Peut tout écrire
 * - Client: ❌ Ne peut PAS écrire prestataire_only
 * - Prestataire: ❌ Ne peut PAS écrire client_only
 * - public et fm4all_only: Tous peuvent écrire (filtrage lecture géré ailleurs)
 *
 * La posture est lue exclusivement depuis le cookie `fm4all:postureActive`.
 * Ne pas inférer la posture depuis les rôles DB de l'entreprise — une entreprise
 * peut être à la fois cliente et prestataire.
 *
 * @param userId - ID de l'utilisateur
 * @param visibilite - Visibilité souhaitée pour le message
 * @returns true si l'utilisateur peut écrire avec cette visibilité
 */
export async function canUserWriteVisibility({
  userId,
  visibilite,
}: {
  userId: string;
  entrepriseId?: string; // conservé pour compatibilité, non utilisé
  visibilite: TicketMessageVisibiliteType;
}): Promise<boolean> {
  // Plateforme (posture cookie = "plateforme") → bypass total
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) {
    return true;
  }

  // Déterminer posture depuis cookie uniquement
  const cookieStore = await cookies();
  const posture = cookieStore.get("fm4all:postureActive")?.value;

  const isPrestataire = posture === "prestataire";

  // Client ne peut pas écrire prestataire_only
  if (!isPrestataire && visibilite === "prestataire_only") {
    return false;
  }

  // Prestataire ne peut pas écrire client_only
  if (isPrestataire && visibilite === "client_only") {
    return false;
  }

  // public et fm4all_only: OK pour tous
  return true;
}
