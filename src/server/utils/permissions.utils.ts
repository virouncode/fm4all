import "server-only";

import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import { cookies } from "next/headers";

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
export async function getEffectivePlateformeRole(userId: string) {
  const cookieStore = await cookies();
  const posture = cookieStore.get("fm4all:postureActive")?.value;

  // Cookie absent, cassé, ou posture ≠ "plateforme" → pas de bypass plateforme
  if (posture !== "plateforme") return null;

  return getUserPlateformeAdhesion(userId);
}
