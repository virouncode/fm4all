import "server-only";

import { db } from "@/db";
import { sites, sitesArborescence } from "@/db/schema/sites";
import { userPrestataireSiteAttributions } from "@/db/schema/users";
import {
  type RolePrestataireAttributionSiteType,
  selectUserPrestataireSiteAttributionSchema,
} from "@/zod-schemas/userSiteAttribution.schema";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

/**
 * Récupère les attributions de sites prestataire d'un utilisateur pour une entreprise cliente.
 * Analogue à getUserClientSiteAttributions mais pour userPrestataireSiteAttributions.
 *
 * @param userId - ID de l'utilisateur prestataire
 * @param clientEntrepriseId - ID de l'entreprise CLIENTE (propriétaire des sites)
 */
export async function getUserPrestataireSiteAttributions({
  userId,
  clientEntrepriseId,
}: {
  userId: string;
  clientEntrepriseId: string;
}) {
  // 1. Fetch attributions directes
  const rows = await db
    .select({
      attribution: userPrestataireSiteAttributions,
      site: {
        id: sites.id,
        nom: sites.nom,
        parentId: sites.parentId,
      },
    })
    .from(userPrestataireSiteAttributions)
    .innerJoin(sites, eq(userPrestataireSiteAttributions.siteId, sites.id))
    .where(
      and(
        eq(userPrestataireSiteAttributions.userId, userId),
        eq(userPrestataireSiteAttributions.entrepriseId, clientEntrepriseId),
      ),
    );

  // 2. Fetch TOUS les sites de l'entreprise cliente (pour construire l'arbre complet)
  const allSites = await db.query.sites.findMany({
    where: eq(sites.entrepriseId, clientEntrepriseId),
  });

  const attributions = z
    .array(
      selectUserPrestataireSiteAttributionSchema.extend({
        site: z.object({
          id: z.uuid(),
          nom: z.string(),
          parentId: z.uuid().nullable(),
        }),
      }),
    )
    .parse(rows.map((r) => ({ ...r.attribution, site: r.site })));

  // 3. Résoudre l'héritage subtree (même algorithme que getUserClientSiteAttributions)
  const directSiteIds = new Set(attributions.map((a) => a.siteId));

  const subtreeAttrSiteIds = attributions
    .filter((a) => a.scope === "subtree")
    .map((a) => a.siteId);

  let allDescendants: Array<{
    ancetreId: string | null;
    descendantId: string | null;
    profondeur: number | null;
  }> = [];

  if (subtreeAttrSiteIds.length > 0) {
    allDescendants = await db
      .select({
        ancetreId: sitesArborescence.ancetreId,
        descendantId: sitesArborescence.descendantId,
        profondeur: sitesArborescence.profondeur,
      })
      .from(sitesArborescence)
      .where(
        and(
          inArray(sitesArborescence.ancetreId, subtreeAttrSiteIds),
          eq(sitesArborescence.entrepriseId, clientEntrepriseId),
        ),
      );
  }

  const descendantSiteIds = [
    ...new Set(
      allDescendants
        .filter(
          (d) =>
            d.descendantId !== null &&
            d.profondeur !== null &&
            d.profondeur > 0 &&
            !directSiteIds.has(d.descendantId!),
        )
        .map((d) => d.descendantId!),
    ),
  ];

  // 4. Résoudre les rôles effectifs pour les descendants
  // On utilise resolveUserEffectiveRolesOnSites qui opère sur userClientSiteAttributions.
  // Pour les prestataires, on doit faire la résolution manuellement car la table est différente.
  // Algorithme simplifié : pour chaque descendant, chercher l'ancêtre avec scope=subtree
  // le plus proche, tenir compte des exclusions directes.
  const descendantRolesMap = new Map<
    string,
    RolePrestataireAttributionSiteType | null
  >();

  if (descendantSiteIds.length > 0) {
    // Fetch toutes les attributions directes prestataire pour ces descendants (exclusions possibles)
    const exclusionsRows = await db
      .select({ siteId: userPrestataireSiteAttributions.siteId })
      .from(userPrestataireSiteAttributions)
      .where(
        and(
          eq(userPrestataireSiteAttributions.userId, userId),
          eq(userPrestataireSiteAttributions.entrepriseId, clientEntrepriseId),
          eq(userPrestataireSiteAttributions.mode, "exclure"),
          inArray(userPrestataireSiteAttributions.siteId, descendantSiteIds),
        ),
      );
    const excludedSiteIds = new Set(exclusionsRows.map((r) => r.siteId));

    // Construire index ancetreId → descendants
    const ancestorToDescendants = new Map<string, string[]>();
    for (const d of allDescendants) {
      if (
        d.ancetreId === null ||
        d.descendantId === null ||
        d.profondeur === null ||
        d.profondeur === 0
      )
        continue;
      if (directSiteIds.has(d.descendantId)) continue;
      if (!ancestorToDescendants.has(d.ancetreId))
        ancestorToDescendants.set(d.ancetreId, []);
      ancestorToDescendants.get(d.ancetreId)!.push(d.descendantId);
    }

    // Pour chaque descendant, déterminer le rôle effectif
    for (const descId of descendantSiteIds) {
      if (excludedSiteIds.has(descId)) {
        descendantRolesMap.set(descId, null);
        continue;
      }
      // Trouver l'attribution ancêtre la plus proche avec scope=subtree
      let effectiveRole: RolePrestataireAttributionSiteType | null = null;
      for (const attr of attributions) {
        if (attr.scope !== "subtree" || attr.mode !== "inclure") continue;
        const descendants = ancestorToDescendants.get(attr.siteId) || [];
        if (descendants.includes(descId)) {
          effectiveRole = attr.role as RolePrestataireAttributionSiteType;
          break;
        }
      }
      descendantRolesMap.set(descId, effectiveRole);
    }
  }

  // 5. Construire les attributions héritées
  const inheritedAttributions: Array<{
    id: string;
    userId: string;
    siteId: string;
    mode: "inclure" | "exclure";
    scope: "self" | "subtree";
    role: RolePrestataireAttributionSiteType;
    entrepriseId: string;
    createdAt: Date;
    updatedAt: Date;
    createdById: string | null;
    updatedById: string | null;
    site: { id: string; nom: string; parentId: string | null };
    isInherited: true;
    inheritedFromSiteId: string;
  }> = [];

  const addedDescendantIds = new Set<string>();

  for (const attr of attributions) {
    if (attr.scope !== "subtree") continue;

    const descIds = descendantSiteIds.filter((id) => {
      const effectiveRole = descendantRolesMap.get(id);
      return effectiveRole !== null && effectiveRole !== undefined;
    });

    for (const descId of descIds) {
      if (addedDescendantIds.has(descId)) continue;
      const effectiveRole = descendantRolesMap.get(descId);
      if (!effectiveRole) continue;

      const descendantSite = allSites.find((s) => s.id === descId);
      if (!descendantSite) continue;

      addedDescendantIds.add(descId);

      inheritedAttributions.push({
        id: `inherited-${attr.id}-${descId}`,
        userId: attr.userId,
        siteId: descId,
        mode: "inclure",
        scope: "self",
        role: effectiveRole,
        entrepriseId: attr.entrepriseId,
        createdAt: attr.createdAt,
        updatedAt: attr.updatedAt,
        createdById: attr.createdById,
        updatedById: attr.updatedById,
        site: {
          id: descendantSite.id,
          nom: descendantSite.nom,
          parentId: descendantSite.parentId,
        },
        isInherited: true,
        inheritedFromSiteId: attr.siteId,
      });
    }
  }

  // 6. Combiner attributions directes + héritées
  const allAttributions = [
    ...attributions.map((a) => ({
      ...a,
      isInherited: false as const,
      inheritedFromSiteId: null as string | null,
    })),
    ...inheritedAttributions,
  ];

  return { attributions: allAttributions, allSites };
}

/**
 * Retourne le rôle effectif d'un utilisateur prestataire sur un site précis.
 * Tient compte de l'héritage subtree et des exclusions.
 *
 * @returns Le rôle effectif ("responsable_site", "intervenant_site", etc.) ou null si aucun accès.
 */
export async function getUserPrestataireSiteRole({
  userId,
  siteId,
  clientEntrepriseId,
}: {
  userId: string;
  siteId: string;
  clientEntrepriseId: string;
}): Promise<RolePrestataireAttributionSiteType | null> {
  const { attributions } = await getUserPrestataireSiteAttributions({
    userId,
    clientEntrepriseId,
  });

  const effective = attributions.find(
    (a) => a.siteId === siteId && a.mode === "inclure",
  );
  return (effective?.role as RolePrestataireAttributionSiteType) ?? null;
}

/**
 * Retourne les IDs de sites où l'utilisateur prestataire est effectivement responsable_site.
 */
export async function getResponsableSiteIdsByPrestataire({
  userId,
  clientEntrepriseId,
}: {
  userId: string;
  clientEntrepriseId: string;
}): Promise<string[]> {
  const { attributions } = await getUserPrestataireSiteAttributions({
    userId,
    clientEntrepriseId,
  });

  return attributions
    .filter(
      (a) =>
        a.role === "responsable_site" &&
        (a.mode === "inclure" || a.isInherited),
    )
    .map((a) => a.siteId);
}
