import "server-only";

import { db } from "@/db";
import { entreprises } from "@/db/schema/entreprises";
import { eq } from "drizzle-orm";

export async function getEntrepriseById(entrepriseId: string) {
  const entreprise = await db.query.entreprises.findFirst({
    where: eq(entreprises.id, entrepriseId),
    with: {
      roles: true,
    },
  });

  if (!entreprise) {
    return null;
  }

  return {
    ...entreprise,
    roles: entreprise.roles.map((r) => r.role),
  };
}
