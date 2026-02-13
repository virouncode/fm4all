import { db } from "@/db";
import { sites } from "@/db/schema/sites";
import {
  selectSiteSchema,
  type SelectSiteType,
} from "@/zod-schemas/sites.schema";
import { and, eq } from "drizzle-orm";
import "server-only";

/**
 * GET ALL SITES FOR AN ENTREPRISE
 * Returns flat list, tree building done client-side
 * @param includeInactive - If true, includes archived sites. Default: false
 */
export async function getSitesByEntrepriseId(
  entrepriseId: string,
  includeInactive: boolean = false,
): Promise<SelectSiteType[]> {
  const conditions = [eq(sites.entrepriseId, entrepriseId)];

  // Exclure les sites archivés par défaut
  if (!includeInactive) {
    conditions.push(eq(sites.actif, true));
  }

  const rows = await db
    .select()
    .from(sites)
    .where(and(...conditions))
    .orderBy(sites.nom);

  // Parse avec Zod pour garantir la cohérence des types
  return rows.map((row) => selectSiteSchema.parse(row));
}

/**
 * GET SINGLE SITE BY ID
 * @param includeInactive - If true, includes archived sites. Default: false
 */
export async function getSiteById(
  siteId: string,
  includeInactive: boolean = false,
): Promise<SelectSiteType | null> {
  const conditions = [eq(sites.id, siteId)];

  // Exclure les sites archivés par défaut
  if (!includeInactive) {
    conditions.push(eq(sites.actif, true));
  }

  const [site] = await db
    .select()
    .from(sites)
    .where(and(...conditions))
    .limit(1);

  if (!site) return null;

  // Parse avec Zod
  return selectSiteSchema.parse(site);
}

/**
 * CHECK IF SITE BELONGS TO ENTREPRISE
 */
export async function siteBelongsToEntreprise({
  siteId,
  entrepriseId,
}: {
  siteId: string;
  entrepriseId: string;
}): Promise<boolean> {
  const [site] = await db
    .select({ id: sites.id })
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.entrepriseId, entrepriseId)))
    .limit(1);

  return !!site;
}
