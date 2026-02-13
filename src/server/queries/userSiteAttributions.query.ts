import "server-only";

import { db } from "@/db";
import { sites, sitesArborescence } from "@/db/schema/sites";
import { userSiteAttributions } from "@/db/schema/users";
import { RoleAttributionType } from "@/zod-schemas/userSiteAttribution.schema";
import { and, eq } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

const selectUserSiteAttributionSchema =
  createSelectSchema(userSiteAttributions);

export async function getUserSiteAttributions({
  userId,
  entrepriseId,
}: {
  userId: string;
  entrepriseId: string;
}) {
  // Fetch attributions avec site info (TOUS les sites, actifs ET inactifs)
  const rows = await db
    .select({
      attribution: userSiteAttributions,
      site: {
        id: sites.id,
        nom: sites.nom,
        parentId: sites.parentId,
      },
    })
    .from(userSiteAttributions)
    .innerJoin(sites, eq(userSiteAttributions.siteId, sites.id))
    .where(
      and(
        eq(userSiteAttributions.userId, userId),
        eq(userSiteAttributions.entrepriseId, entrepriseId),
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

  // NOUVEAU : Calculer les sites hérités via scope=subtree
  const { resolveUserEffectiveRoleOnSite } = await import(
    "@/server/utils/userSiteAttributions.utils"
  );

  // Créer un Set des siteIds déjà directement attribués pour éviter les doublons
  const directSiteIds = new Set(attributions.map((a) => a.siteId));

  // Pour chaque attribution avec scope=subtree, récupérer tous les descendants
  const inheritedAttributions: Array<{
    id: string;
    userId: string;
    siteId: string;
    mode: "inclure" | "exclure";
    scope: "self" | "subtree";
    role: RoleAttributionType;
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

  for (const attr of attributions) {
    if (attr.scope === "subtree") {
      // Récupérer tous les descendants via closure table
      const descendants = await db
        .select({
          descendantId: sitesArborescence.descendantId,
          profondeur: sitesArborescence.profondeur,
        })
        .from(sitesArborescence)
        .where(
          and(
            eq(sitesArborescence.ancetreId, attr.siteId),
            eq(sitesArborescence.entrepriseId, entrepriseId),
          ),
        );

      // Pour chaque descendant (sauf le site lui-même)
      for (const desc of descendants) {
        if (
          desc.descendantId === attr.siteId ||
          !desc.descendantId ||
          desc.profondeur === null
        )
          continue; // Skip self
        if (directSiteIds.has(desc.descendantId)) continue; // Skip si déjà attribution directe

        // Calculer le rôle effectif (prend en compte les exclusions et overrides)
        const effectiveRole = await resolveUserEffectiveRoleOnSite({
          userId,
          siteId: desc.descendantId,
          entrepriseId,
        });

        // Si pas de rôle effectif (exclusion), skip
        if (!effectiveRole) continue;

        // Récupérer les infos du site descendant
        const descendantSite = allSites.find((s) => s.id === desc.descendantId);
        if (!descendantSite) continue;

        // Créer une pseudo-attribution pour l'héritage
        inheritedAttributions.push({
          id: `inherited-${attr.id}-${desc.descendantId}`, // ID fictif
          userId: attr.userId,
          siteId: desc.descendantId,
          mode: "inclure", // Toujours inclure pour les hérités (exclusions filtrées avant)
          scope: "self", // Les hérités sont considérés comme self
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
  }

  // Combiner attributions directes + héritées
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
  role: RoleAttributionType,
) {
  // Récupérer TOUS les sites (actifs ET inactifs)
  const allSites = await db.query.sites.findMany({
    where: eq(sites.entrepriseId, entrepriseId),
    orderBy: (sites, { asc }) => [asc(sites.nom)],
  });

  // Récupérer TOUS les sites attribués (peu importe le rôle)
  const existingAttributions = await db.query.userSiteAttributions.findMany({
    where: and(
      eq(userSiteAttributions.userId, userId),
      eq(userSiteAttributions.entrepriseId, entrepriseId),
    ),
    columns: { siteId: true },
  });

  const attributedSiteIds = new Set(existingAttributions.map((a) => a.siteId));
  const availableSites = allSites.filter(
    (site) => !attributedSiteIds.has(site.id),
  );

  return availableSites;
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
