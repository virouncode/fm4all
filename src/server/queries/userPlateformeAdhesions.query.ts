import "server-only";
import { db } from "@/db";
import { userPlateformeAdhesions } from "@/db/schema/users";
import { and, eq } from "drizzle-orm";
import { RolePlateformeAdhesionType } from "@/zod-schemas/userPlateformeAdhesion.schema";
import { cache } from "react";

/**
 * Get platform adhesion for a user (returns null if none).
 * Memoized per request — DB hit au maximum une fois par action/render.
 */
export const getUserPlateformeAdhesion = cache(async (
  userId: string,
): Promise<{ role: RolePlateformeAdhesionType } | null> => {
  const adhesion = await db.query.userPlateformeAdhesions.findFirst({
    where: and(
      eq(userPlateformeAdhesions.userId, userId),
      eq(userPlateformeAdhesions.statut, "actif"),
    ),
  });

  if (!adhesion) return null;

  return {
    role: adhesion.role as RolePlateformeAdhesionType,
  };
});
