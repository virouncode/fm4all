import "server-only";
import { db } from "@/db";
import { userClientAdhesions, userPrestataireAdhesions } from "@/db/schema/users";
import { eq, and } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { getEffectivePlateformeRole } from "@/server/utils/permissions.utils";

const selectUserClientAdhesionSchema = createSelectSchema(userClientAdhesions);

/**
 * Vérifie que l'utilisateur a accès à l'entreprise :
 * adhésion client active OU adhésion prestataire active OU rôle plateforme.
 */
export async function hasAccessToEntreprise(
  userId: string,
  entrepriseId: string,
): Promise<boolean> {
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) return true;

  const [clientAdhesion, prestataireAdhesion] = await Promise.all([
    db.query.userClientAdhesions.findFirst({
      where: and(
        eq(userClientAdhesions.userId, userId),
        eq(userClientAdhesions.entrepriseId, entrepriseId),
        eq(userClientAdhesions.statut, "actif"),
      ),
    }),
    db.query.userPrestataireAdhesions.findFirst({
      where: and(
        eq(userPrestataireAdhesions.userId, userId),
        eq(userPrestataireAdhesions.entrepriseId, entrepriseId),
        eq(userPrestataireAdhesions.statut, "actif"),
      ),
    }),
  ]);

  return !!(clientAdhesion || prestataireAdhesion);
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
