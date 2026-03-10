import "server-only";

import { getUserPrestataireSiteRole } from "@/server/queries/userPrestataireSiteAttributions.query";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import { resolveUserEffectiveRoleOnSite } from "@/server/utils/userClientSiteAttributions.utils";
import { cookies } from "next/headers";
import { cache } from "react";

/**
 * Retourne la posture active depuis le cookie (client | prestataire | plateforme | undefined).
 */
export async function getActivePosture(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("fm4all:postureActive")?.value;
}

/**
 * Retourne le rôle plateforme uniquement si la posture active est "plateforme".
 *
 * À utiliser dans les server actions pour les bypasses de permissions.
 * Contrairement à getUserPlateformeAdhesion() qui vérifie uniquement le rôle en base,
 * cette fonction borne les privilèges à la posture active :
 *
 * - posture cookie absente ou ≠ "plateforme" → null (pas de bypass)
 * - posture cookie = "plateforme"             → vérifie le rôle réel en base
 *
 * Règle : si l'utilisateur a choisi la posture prestataire ou client,
 * son rôle plateforme ne doit pas override ses permissions dans cette posture.
 */
/**
 * Memoized per request — cookie + DB hit au maximum une fois par action/render.
 */
export const getEffectivePlateformeRole = cache(async (userId: string) => {
  const cookieStore = await cookies();
  const posture = cookieStore.get("fm4all:postureActive")?.value;

  // Cookie absent, cassé, ou posture ≠ "plateforme" → pas de bypass plateforme
  if (posture !== "plateforme") return null;

  return getUserPlateformeAdhesion(userId);
});

/**
 * Résout le rôle effectif d'un utilisateur sur un site, en fonction de la posture active.
 *
 * - posture "prestataire" → vérifie userPrestataireSiteAttributions
 *   (entrepriseId = entreprise CLIENTE propriétaire du site)
 * - posture "client" ou défaut → vérifie userClientSiteAttributions
 *
 * Note : pour la posture prestataire, tous les rôles sont retournés
 * (responsable_site, intervenant_site, demandeur_site, observateur_site).
 */
export async function resolvePostureAwareSiteRole({
  userId,
  siteId,
  entrepriseId,
}: {
  userId: string;
  siteId: string;
  entrepriseId: string;
}): Promise<string | null> {
  const cookieStore = await cookies();
  const posture = cookieStore.get("fm4all:postureActive")?.value;

  if (posture === "prestataire") {
    return getUserPrestataireSiteRole({
      userId,
      siteId,
      clientEntrepriseId: entrepriseId,
    });
  }

  // client ou défaut
  return resolveUserEffectiveRoleOnSite({ userId, siteId, entrepriseId });
}
