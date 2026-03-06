import "server-only";
import { db } from "@/db";
import { userClientAdhesions, userPrestataireAdhesions } from "@/db/schema/users";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import { eq, and } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { cookies } from "next/headers";

const selectUserClientAdhesionSchema = createSelectSchema(userClientAdhesions);
const selectUserPrestataireAdhesionSchema = createSelectSchema(userPrestataireAdhesions);

/**
 * Vérifie que l'utilisateur a accès à l'entreprise, en fonction de la posture active.
 *
 * - posture "plateforme" → rôle plateforme en base
 * - posture "prestataire" → adhésion prestataire active pour cet entrepriseId
 * - posture "client" (défaut) → adhésion client active pour cet entrepriseId
 *
 * Le caller doit passer l'entrepriseId approprié à la posture :
 *   - posture client/plateforme : entrepriseId du client
 *   - posture prestataire : entrepriseId du prestataire
 */
export async function hasAccessToEntreprise(
  userId: string,
  entrepriseId: string,
): Promise<boolean> {
  const cookieStore = await cookies();
  const posture = cookieStore.get("fm4all:postureActive")?.value;

  if (posture === "plateforme") {
    const platformRole = await getUserPlateformeAdhesion(userId);
    return !!platformRole?.role;
  }

  if (posture === "prestataire") {
    const adhesion = await db.query.userPrestataireAdhesions.findFirst({
      where: and(
        eq(userPrestataireAdhesions.userId, userId),
        eq(userPrestataireAdhesions.entrepriseId, entrepriseId),
        eq(userPrestataireAdhesions.statut, "actif"),
      ),
    });
    return !!adhesion;
  }

  // client (défaut)
  const adhesion = await db.query.userClientAdhesions.findFirst({
    where: and(
      eq(userClientAdhesions.userId, userId),
      eq(userClientAdhesions.entrepriseId, entrepriseId),
      eq(userClientAdhesions.statut, "actif"),
    ),
  });
  return !!adhesion;
}

/**
 * Retourne l'adhésion prestataire active d'un utilisateur (sans filtrer sur entrepriseId).
 * Un utilisateur n'appartient qu'à une seule entreprise prestataire.
 */
export async function getUserPrestataireAdhesion({ userId }: { userId: string }) {
  const [row] = await db
    .select()
    .from(userPrestataireAdhesions)
    .where(
      and(
        eq(userPrestataireAdhesions.userId, userId),
        eq(userPrestataireAdhesions.statut, "actif"),
      ),
    )
    .limit(1);

  if (!row) return null;
  return selectUserPrestataireAdhesionSchema.parse(row);
}

export async function getUserClientAdhesion({
  userId,
  entrepriseId,
}: {
  userId: string;
  entrepriseId: string;
}) {
  const [row] = await db
    .select()
    .from(userClientAdhesions)
    .where(
      and(
        eq(userClientAdhesions.userId, userId),
        eq(userClientAdhesions.entrepriseId, entrepriseId),
        eq(userClientAdhesions.statut, "actif"),
      ),
    )
    .limit(1);

  if (!row) return null;
  return selectUserClientAdhesionSchema.parse(row);
}
