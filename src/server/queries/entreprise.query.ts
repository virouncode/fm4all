import "server-only";

import { db } from "@/db";
import { entreprises, entrepriseRoles } from "@/db/schema/entreprises";
import { eq } from "drizzle-orm";

export async function getEntrepriseById(entrepriseId: string) {
  const entreprise = await db.query.entreprises.findFirst({
    where: eq(entreprises.id, entrepriseId),
  });

  if (!entreprise) {
    return null;
  }

  // Récupérer les rôles de l'entreprise
  const roles = await db
    .select()
    .from(entrepriseRoles)
    .where(eq(entrepriseRoles.entrepriseId, entrepriseId));

  return {
    ...entreprise,
    roles: roles.map((r) => r.role),
  };
}
