import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { sites, sitesArborescence } from "@/db/schema/sites";
import { userClientSiteAttributions } from "@/db/schema/users";
import {
  selectSiteSchema,
  type SelectSiteType,
} from "@/zod-schemas/sites.schema";
import type { SelectUserSiteAttributionWithInheritanceType } from "@/zod-schemas/userSiteAttribution.schema";
import { and, eq, or } from "drizzle-orm";
import "server-only";

export type SiteResponsable = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  phone: string | null;
};

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
 * GET RESPONSABLES OF A SITE (role = "responsable_site", mode = "inclure")
 * Inclut les attributions directes ET les attributions avec scope "subtree" sur les sites ancêtres.
 */
export async function getSiteResponsables(
  siteId: string,
): Promise<SiteResponsable[]> {
  const rows = await db
    .selectDistinct({
      id: user.id,
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      phone: user.phone,
    })
    .from(userClientSiteAttributions)
    .innerJoin(user, eq(userClientSiteAttributions.userId, user.id))
    .innerJoin(
      sitesArborescence,
      and(
        eq(sitesArborescence.ancetreId, userClientSiteAttributions.siteId),
        eq(sitesArborescence.descendantId, siteId),
      ),
    )
    .where(
      and(
        eq(userClientSiteAttributions.role, "responsable_site"),
        eq(userClientSiteAttributions.mode, "inclure"),
        or(
          // Attribution directe sur ce site exact (profondeur 0 = self-reference)
          eq(sitesArborescence.profondeur, 0),
          // Attribution sur un site ancêtre avec scope "subtree"
          eq(userClientSiteAttributions.scope, "subtree"),
        ),
      ),
    );

  return rows;
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
 * Récupère TOUS les sites (toutes entreprises) - pour la plateforme uniquement
 */
export async function getAllSites(): Promise<SelectSiteType[]> {
  const allSites = await db.query.sites.findMany({
    where: eq(sites.actif, true),
    orderBy: (sites, { asc }) => [asc(sites.nom)],
  });
  return selectSiteSchema.array().parse(allSites);
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
  filterRole,
}: {
  userId: string;
  entrepriseId: string;
  /** Si défini, ne retourne que les sites où l'utilisateur a ce rôle exact (ignore le raccourci admin) */
  filterRole?: string;
}): Promise<SelectSiteType[]> {

  // Vérifier si plateforme
  const { getUserPlateformeAdhesion } = await import(
    "@/server/queries/userPlateformeAdhesions.query"
  );
  const plateformeRole = await getUserPlateformeAdhesion(userId);

  // Si plateforme → retourner TOUS les sites
  if (plateformeRole) {
    return getAllSites();
  }

  // Si pas de filtre de rôle : raccourci admin → tous les sites de l'entreprise
  if (!filterRole) {
    const { getUserClientAdhesion } = await import(
      "@/server/queries/userAdhesions.query"
    );
    const adhesion = await getUserClientAdhesion({ userId, entrepriseId });
    if (adhesion?.role === "admin") {
      const allSites = await db.query.sites.findMany({
        where: eq(sites.entrepriseId, entrepriseId),
        orderBy: (sites, { asc }) => [asc(sites.nom)],
      });
      return selectSiteSchema.array().parse(allSites);
    }
  }

  // Sinon, calculer le périmètre via attributions (filtré par rôle si demandé)
  const { getUserClientSiteAttributions } = await import(
    "@/server/queries/userSiteAttributions.query"
  );

  const result = await getUserClientSiteAttributions({
    userId,
    entrepriseId,
  });
  const attributions: SelectUserSiteAttributionWithInheritanceType[] = result.attributions;

  // Filtrer les attributions avec rôle effectif (exclut mode=exclure) + filtre de rôle
  const accessibleSiteIds = attributions
    .filter(
      (attr) =>
        attr.role !== null &&
        (!filterRole || attr.role === filterRole),
    )
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
