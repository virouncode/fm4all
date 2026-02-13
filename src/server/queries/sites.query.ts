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

/**
 * Récupère les sites accessibles par un utilisateur (selon ses attributions)
 * @returns Sites pour lesquels l'utilisateur a un rôle effectif (mode=inclure)
 *
 * Règles:
 * - Admin de l'entreprise → tous les sites
 * - Plateforme → tous les sites
 * - Utilisateur avec attributions → sites du périmètre effectif
 */
export async function getAccessibleSitesByUser({
  userId,
  entrepriseId,
}: {
  userId: string;
  entrepriseId: string;
}): Promise<SelectSiteType[]> {
  // Vérifier si plateforme
  const { getUserPlateformeAdhesion } = await import(
    "@/server/queries/userPlateformeAdhesions.query"
  );
  const plateformeRole = await getUserPlateformeAdhesion(userId);

  // Vérifier si admin de l'entreprise
  const { getUserAdhesion } = await import(
    "@/server/queries/userAdhesions.query"
  );
  const adhesion = await getUserAdhesion({ userId, entrepriseId });

  // Si plateforme OU admin → retourner tous les sites
  if (plateformeRole || adhesion?.role === "admin") {
    const allSites = await db.query.sites.findMany({
      where: eq(sites.entrepriseId, entrepriseId),
      orderBy: (sites, { asc }) => [asc(sites.nom)],
    });
    return selectSiteSchema.array().parse(allSites);
  }

  // Sinon, calculer le périmètre via attributions
  const { getUserSiteAttributions } = await import(
    "@/server/queries/userSiteAttributions.query"
  );

  const { attributions } = await getUserSiteAttributions({
    userId,
    entrepriseId,
  });

  // Filtrer les attributions avec rôle effectif (exclut mode=exclure)
  const accessibleSiteIds = attributions
    .filter((attr) => attr.role !== null) // role null = exclu
    .map((attr) => attr.siteId);

  // Dédupliquer
  const uniqueSiteIds = Array.from(new Set(accessibleSiteIds));

  // Si aucune attribution → retourner tableau vide
  if (uniqueSiteIds.length === 0) {
    return [];
  }

  // Récupérer les sites complets
  const accessibleSites = await db.query.sites.findMany({
    where: (sites, { and, eq, inArray }) =>
      and(
        eq(sites.entrepriseId, entrepriseId),
        inArray(sites.id, uniqueSiteIds),
      ),
    orderBy: (sites, { asc }) => [asc(sites.nom)],
  });

  return selectSiteSchema.array().parse(accessibleSites);
}
