import "server-only";

import { db } from "@/db";
import { services } from "@/db/schema/services";
import { asc } from "drizzle-orm";

/**
 * GET ALL SERVICES (catalogue)
 * Returns minimal list for form selects
 */
export async function getAllServices(): Promise<Array<{ id: string; nom: string }>> {
  return await db
    .select({ id: services.id, nom: services.nom })
    .from(services)
    .orderBy(asc(services.nom));
}
