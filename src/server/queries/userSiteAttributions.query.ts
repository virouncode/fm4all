import "server-only";

import { db } from "@/db";
import { sites, sitesArborescence } from "@/db/schema/sites";
import { userClientSiteAttributions } from "@/db/schema/users";
import { RoleClientAttributionType } from "@/zod-schemas/userSiteAttribution.schema";
import { and, eq, inArray } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

const selectUserSiteAttributionSchema =
  createSelectSchema(userClientSiteAttributions);

export async function getUserClientSiteAttributions({
  userId,
  entrepriseId,
}: {
  userId: string;
  entrepriseId: string;
}) {
  // Fetch attributions avec site info (TOUS les sites, actifs ET inactifs)
  const rows = await db
    .select({
      attribution: userClientSiteAttributions,
      site: {
        id: sites.id,
        nom: sites.nom,
        parentId: sites.parentId,
      },
    })
    .from(userClientSiteAttributions)
    .innerJoin(sites, eq(userClientSiteAttributions.siteId, sites.id))
    .where(
      and(
        eq(userClientSiteAttributions.userId, userId),
        eq(userClientSiteAttributions.entrepriseId, entrepriseId),
      ),
    );

  // Fetch TOUS les sites de l'entreprise (actifs ET inactifs pour construire l'arbre complet)
  const allSites = await db.query.sites.findMany({
    where: eq(sites.entrepriseId, entrepriseId),
  });

  const attributions = z
    .array(
      selectUserSiteAttributionSchema.extend({
        site: z.object({
          id: z.uuid(),
          nom: z.string(),
          parentId: z.uuid().nullable(),
        }),
      }),
    )
    .parse(rows.map((r) => ({ ...r.attribution, site: r.site })));

  // Calculer les sites hérités via scope=subtree (version batch optimisée)
  const { resolveUserEffectiveRolesOnSites } = await import(
    "@/server/utils/userClientSiteAttributions.utils"
  );

  // Créer un Set des siteIds déjà directement attribués pour éviter les doublons
  const directSiteIds = new Set(attributions.map((a) => a.siteId));

  // Étape 1 : Fetch TOUS les descendants de TOUS les subtree attrs en 1 query
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
          eq(sitesArborescence.entrepriseId, entrepriseId),
        ),
      );
  }

  // Étape 2 : Filtrer (exclure self, exclure déjà-directs, exclure nulls)
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

  // Étape 3 : Batch resolve des rôles effectifs (2 queries au lieu de N*(1+K))
  const rolesMap =
    descendantSiteIds.length > 0
      ? await resolveUserEffectiveRolesOnSites({
          userId,
          siteIds: descendantSiteIds,
          entrepriseId,
        })
      : new Map<string, RoleClientAttributionType | null>();

  // Étape 4 : Construire un index ancetreId → descendantIds pour retrouver l'attribution source
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

  // Étape 5 : Assembler les inheritedAttributions en mémoire (0 queries)
  const inheritedAttributions: Array<{
    id: string;
    userId: string;
    siteId: string;
    mode: "inclure" | "exclure";
    scope: "self" | "subtree";
    role: RoleClientAttributionType;
    entrepriseId: string;
    createdAt: Date;
    updatedAt: Date;
    createdById: string | null;
    updatedById: string | null;
    site: {
      id: string;
      nom: string;
      parentId: string | null;
    };
    isInherited: true;
    inheritedFromSiteId: string;
  }> = [];

  // Set pour éviter les doublons (un descendant peut apparaître via plusieurs subtree attrs)
  const addedDescendantIds = new Set<string>();

  for (const attr of attributions) {
    if (attr.scope !== "subtree") continue;

    const descIds = ancestorToDescendants.get(attr.siteId) || [];
    for (const descId of descIds) {
      if (addedDescendantIds.has(descId)) continue;

      const effectiveRole = rolesMap.get(descId);
      if (!effectiveRole) continue; // Exclusion ou pas de rôle

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

  // Combiner attributions directes + héritées
  // Les attributions mode=exclure sont incluses (nécessaires pour que le dialog
  // d'attribution détecte les exclusions via getSiteState)
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

export async function getAvailableSitesForAttribution(
  userId: string,
  entrepriseId: string,
  role: RoleClientAttributionType,
) {
  // Récupérer TOUS les sites (actifs ET inactifs)
  const allSites = await db.query.sites.findMany({
    where: eq(sites.entrepriseId, entrepriseId),
    orderBy: (sites, { asc }) => [asc(sites.nom)],
  });

  // Récupérer les sites déjà attribués en mode=inclure (les exclusions ne bloquent pas la ré-attribution)
  const existingAttributions = await db.query.userClientSiteAttributions.findMany({
    where: and(
      eq(userClientSiteAttributions.userId, userId),
      eq(userClientSiteAttributions.entrepriseId, entrepriseId),
    ),
    columns: { siteId: true, mode: true },
  });

  const attributedSiteIds = new Set(
    existingAttributions.filter((a) => a.mode === "inclure").map((a) => a.siteId),
  );
  const availableSites = allSites.filter(
    (site) => !attributedSiteIds.has(site.id),
  );

  return availableSites;
}

/**
 * Retourne tous les siteIds effectivement attribués à un utilisateur client.
 * Utilisé pour le filtrage de la liste des prestations (posture client non-admin).
 * Prend en compte le scope "subtree" via getUserClientSiteAttributions.
 */
export async function getAllClientSiteIds({
  userId,
  entrepriseId,
}: {
  userId: string;
  entrepriseId: string;
}): Promise<string[]> {
  const { attributions } = await getUserClientSiteAttributions({ userId, entrepriseId });
  return attributions
    .filter((a) => a.mode === "inclure")
    .map((a) => a.siteId);
}

/**
 * Récupère les ancêtres d'un site via la closure table sitesArborescence
 * @returns Array d'objets { ancetreId, profondeur } triés par profondeur ASC (plus proche en premier)
 */
export async function getSiteAncestorsFromClosureTable({
  siteId,
  entrepriseId,
}: {
  siteId: string;
  entrepriseId: string;
}): Promise<Array<{ ancetreId: string; profondeur: number }>> {
  const ancestors = await db
    .select({
      ancetreId: sitesArborescence.ancetreId,
      profondeur: sitesArborescence.profondeur,
    })
    .from(sitesArborescence)
    .where(
      and(
        eq(sitesArborescence.descendantId, siteId),
        eq(sitesArborescence.entrepriseId, entrepriseId),
      ),
    )
    .orderBy(sitesArborescence.profondeur); // ASC : profondeur 0 (self) en premier

  return ancestors.filter(
    (a): a is { ancetreId: string; profondeur: number } =>
      a.ancetreId !== null && a.profondeur !== null,
  );
}
