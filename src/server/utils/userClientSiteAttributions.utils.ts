import "server-only";
import { db } from "@/db";
import { userClientSiteAttributions } from "@/db/schema/users";
import { sitesArborescence } from "@/db/schema/sites";
import { and, eq, inArray } from "drizzle-orm";
import type {
  AttributionModeType,
  RoleClientAttributionType,
} from "@/zod-schemas/userSiteAttribution.schema";
import { getSiteAncestorsFromClosureTable } from "../queries/userSiteAttributions.query";

type DbOrTransactionType =
  | typeof db
  | Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Résolution des droits : Trouve le rôle effectif d'un utilisateur sur un site
 *
 * Algorithme (Modèle B : Spécificité) :
 * 1. Récupérer toutes les attributions de l'utilisateur
 * 2. Pour chaque attribution :
 *    - Si scope=self : vérifier siteId === targetSiteId
 *    - Si scope=subtree : vérifier avec sitesArborescence
 * 3. Parmi les attributions valides, prendre celle avec profondeur minimale
 *
 * @returns Attribution effective ou null si aucune
 */
export async function resolveUserRightsOnSite({
  userId,
  siteId,
  entrepriseId,
  tx,
}: {
  userId: string;
  siteId: string;
  entrepriseId: string;
  tx?: DbOrTransactionType;
}): Promise<{
  role: RoleClientAttributionType;
  scope: "self" | "subtree";
  attributionId: string;
  profondeur: number;
} | null> {
  const dbClient = tx || db;

  // 1. Récupérer toutes les attributions de l'utilisateur
  const attributions = await dbClient
    .select()
    .from(userClientSiteAttributions)
    .where(
      and(
        eq(userClientSiteAttributions.userId, userId),
        eq(userClientSiteAttributions.entrepriseId, entrepriseId),
      ),
    );

  if (attributions.length === 0) return null;

  // 2. Pour chaque attribution, vérifier si elle couvre le site cible
  const validAttributions: Array<{
    role: RoleClientAttributionType;
    scope: "self" | "subtree";
    attributionId: string;
    profondeur: number;
  }> = [];

  for (const attr of attributions) {
    if (attr.scope === "self") {
      // Cas 1: scope=self → match uniquement si même siteId
      if (attr.siteId === siteId) {
        validAttributions.push({
          role: attr.role,
          scope: attr.scope,
          attributionId: attr.id,
          profondeur: 0, // Profondeur 0 pour self (le plus spécifique)
        });
      }
    } else if (attr.scope === "subtree") {
      // Cas 2: scope=subtree → vérifier avec sitesArborescence
      const [relation] = await dbClient
        .select({ profondeur: sitesArborescence.profondeur })
        .from(sitesArborescence)
        .where(
          and(
            eq(sitesArborescence.entrepriseId, entrepriseId),
            eq(sitesArborescence.ancetreId, attr.siteId),
            eq(sitesArborescence.descendantId, siteId),
          ),
        )
        .limit(1);

      if (relation) {
        validAttributions.push({
          role: attr.role,
          scope: attr.scope,
          attributionId: attr.id,
          profondeur: relation.profondeur,
        });
      }
    }
  }

  if (validAttributions.length === 0) return null;

  // 3. Prendre celle avec profondeur minimale (plus spécifique)
  validAttributions.sort((a, b) => a.profondeur - b.profondeur);
  return validAttributions[0];
}

/**
 * @deprecated Utilisez resolveUserEffectiveRoleOnSite() à la place (prend en compte mode=exclure)
 */
export async function resolveUserRightsOnSite_OLD({
  userId,
  siteId,
  entrepriseId,
  tx,
}: {
  userId: string;
  siteId: string;
  entrepriseId: string;
  tx?: DbOrTransactionType;
}): Promise<{
  role: RoleClientAttributionType;
  scope: "self" | "subtree";
  attributionId: string;
  profondeur: number;
} | null> {
  // Code identique à l'ancien resolveUserRightsOnSite
  const dbClient = tx || db;

  const attributions = await dbClient
    .select()
    .from(userClientSiteAttributions)
    .where(
      and(
        eq(userClientSiteAttributions.userId, userId),
        eq(userClientSiteAttributions.entrepriseId, entrepriseId),
      ),
    );

  if (attributions.length === 0) return null;

  const validAttributions: Array<{
    role: RoleClientAttributionType;
    scope: "self" | "subtree";
    attributionId: string;
    profondeur: number;
  }> = [];

  for (const attr of attributions) {
    if (attr.scope === "self") {
      if (attr.siteId === siteId) {
        validAttributions.push({
          role: attr.role,
          scope: attr.scope,
          attributionId: attr.id,
          profondeur: 0,
        });
      }
    } else if (attr.scope === "subtree") {
      const [relation] = await dbClient
        .select({ profondeur: sitesArborescence.profondeur })
        .from(sitesArborescence)
        .where(
          and(
            eq(sitesArborescence.entrepriseId, entrepriseId),
            eq(sitesArborescence.ancetreId, attr.siteId),
            eq(sitesArborescence.descendantId, siteId),
          ),
        )
        .limit(1);

      if (relation) {
        validAttributions.push({
          role: attr.role,
          scope: attr.scope,
          attributionId: attr.id,
          profondeur: relation.profondeur,
        });
      }
    }
  }

  if (validAttributions.length === 0) return null;

  validAttributions.sort((a, b) => a.profondeur - b.profondeur);
  return validAttributions[0];
}

/**
 * Résolution des droits effectifs : Trouve le rôle effectif d'un utilisateur sur un site
 * (NOUVELLE VERSION avec prise en compte de mode=exclure)
 *
 * Algorithme :
 * 1. Récupérer toutes les attributions de l'utilisateur (inclure + exclure)
 * 2. Pour chaque attribution :
 *    - Si scope=self ET siteId match → profondeur 0 (le plus spécifique)
 *    - Si scope=subtree → vérifier avec closure table si le site est descendant
 * 3. Trier par profondeur ASC (plus proche = plus spécifique)
 * 4. Prendre la première attribution
 * 5. Si mode=exclure → Retourner null (accès refusé)
 * 6. Si mode=inclure → Retourner le rôle
 *
 * @returns Rôle effectif ou null si accès refusé ou aucune attribution
 */
export async function resolveUserEffectiveRoleOnSite({
  userId,
  siteId,
  entrepriseId,
  tx,
}: {
  userId: string;
  siteId: string;
  entrepriseId: string;
  tx?: DbOrTransactionType;
}): Promise<RoleClientAttributionType | null> {
  const dbClient = tx || db;

  // 1. Récupérer TOUTES les attributions de l'utilisateur (inclure + exclure)
  const attributions = await dbClient
    .select()
    .from(userClientSiteAttributions)
    .where(
      and(
        eq(userClientSiteAttributions.userId, userId),
        eq(userClientSiteAttributions.entrepriseId, entrepriseId),
      ),
    );

  if (attributions.length === 0) return null;

  // 2. Pour chaque attribution, vérifier si elle couvre le site cible
  const validAttributions: Array<{
    role: RoleClientAttributionType;
    mode: "inclure" | "exclure";
    scope: "self" | "subtree";
    profondeur: number;
  }> = [];

  for (const attr of attributions) {
    if (attr.scope === "self") {
      // Cas 1: scope=self → match uniquement si même siteId
      if (attr.siteId === siteId) {
        validAttributions.push({
          role: attr.role,
          mode: attr.mode,
          scope: attr.scope,
          profondeur: 0, // Profondeur 0 pour self (le plus spécifique)
        });
      }
    } else if (attr.scope === "subtree") {
      // Cas 2: scope=subtree → vérifier avec sitesArborescence
      const [relation] = await dbClient
        .select({ profondeur: sitesArborescence.profondeur })
        .from(sitesArborescence)
        .where(
          and(
            eq(sitesArborescence.entrepriseId, entrepriseId),
            eq(sitesArborescence.ancetreId, attr.siteId),
            eq(sitesArborescence.descendantId, siteId),
          ),
        )
        .limit(1);

      if (relation) {
        validAttributions.push({
          role: attr.role,
          mode: attr.mode,
          scope: attr.scope,
          profondeur: relation.profondeur,
        });
      }
    }
  }

  if (validAttributions.length === 0) return null;

  // 3. Trier par profondeur ASC (plus proche = plus spécifique)
  validAttributions.sort((a, b) => a.profondeur - b.profondeur);

  // 4. Prendre la première attribution (la plus spécifique)
  const mostSpecific = validAttributions[0];

  // 5. Si mode=exclure → Accès refusé
  if (mostSpecific.mode === "exclure") {
    return null;
  }

  // 6. Si mode=inclure → Retourner le rôle
  return mostSpecific.role;
}

/**
 * Version BATCH de resolveUserEffectiveRoleOnSite()
 * Résout le rôle effectif d'un utilisateur sur PLUSIEURS sites en 2 queries max
 * au lieu de N*(1+K) queries pour la version unitaire.
 *
 * Même algorithme (spécificité par profondeur, mode exclure) appliqué en mémoire.
 *
 * @returns Map<siteId, RoleClientAttributionType | null>
 */
export async function resolveUserEffectiveRolesOnSites({
  userId,
  siteIds,
  entrepriseId,
  tx,
}: {
  userId: string;
  siteIds: string[];
  entrepriseId: string;
  tx?: DbOrTransactionType;
}): Promise<Map<string, RoleClientAttributionType | null>> {
  if (siteIds.length === 0) {
    return new Map();
  }

  const dbClient = tx || db;

  // 1 seule query : toutes les attributions de l'utilisateur
  const attributions = await dbClient
    .select()
    .from(userClientSiteAttributions)
    .where(
      and(
        eq(userClientSiteAttributions.userId, userId),
        eq(userClientSiteAttributions.entrepriseId, entrepriseId),
      ),
    );

  if (attributions.length === 0) {
    return new Map(siteIds.map((id) => [id, null]));
  }

  // Séparer self vs subtree
  const selfAttrs = attributions.filter((a) => a.scope === "self");
  const subtreeAttrs = attributions.filter((a) => a.scope === "subtree");

  // 1 seule query : toutes les relations closure pour les subtree attrs × siteIds
  let closureRelations: Array<{
    ancetreId: string | null;
    descendantId: string | null;
    profondeur: number | null;
  }> = [];

  if (subtreeAttrs.length > 0) {
    closureRelations = await dbClient
      .select({
        ancetreId: sitesArborescence.ancetreId,
        descendantId: sitesArborescence.descendantId,
        profondeur: sitesArborescence.profondeur,
      })
      .from(sitesArborescence)
      .where(
        and(
          eq(sitesArborescence.entrepriseId, entrepriseId),
          inArray(
            sitesArborescence.ancetreId,
            subtreeAttrs.map((a) => a.siteId),
          ),
          inArray(sitesArborescence.descendantId, siteIds),
        ),
      );
  }

  // Index closure pour lookup O(1) : ancetreId → descendantId → profondeur
  const closureMap = new Map<string, Map<string, number>>();
  for (const rel of closureRelations) {
    if (
      rel.ancetreId === null ||
      rel.descendantId === null ||
      rel.profondeur === null
    )
      continue;
    if (!closureMap.has(rel.ancetreId))
      closureMap.set(rel.ancetreId, new Map());
    closureMap.get(rel.ancetreId)!.set(rel.descendantId, rel.profondeur);
  }

  // Résoudre en mémoire pour chaque siteId (même algo que resolveUserEffectiveRoleOnSite)
  const results = new Map<string, RoleClientAttributionType | null>();

  for (const siteId of siteIds) {
    const validAttrs: Array<{
      role: RoleClientAttributionType;
      mode: "inclure" | "exclure";
      profondeur: number;
    }> = [];

    // Check self attributions
    for (const attr of selfAttrs) {
      if (attr.siteId === siteId) {
        validAttrs.push({
          role: attr.role,
          mode: attr.mode,
          profondeur: 0,
        });
      }
    }

    // Check subtree attributions via closure index
    for (const attr of subtreeAttrs) {
      const profondeur = closureMap.get(attr.siteId)?.get(siteId);
      if (profondeur !== undefined) {
        validAttrs.push({
          role: attr.role,
          mode: attr.mode,
          profondeur,
        });
      }
    }

    if (validAttrs.length === 0) {
      results.set(siteId, null);
      continue;
    }

    // Trier par profondeur ASC (plus spécifique en premier)
    validAttrs.sort((a, b) => a.profondeur - b.profondeur);
    const mostSpecific = validAttrs[0];

    // mode=exclure → null, mode=inclure → role
    results.set(
      siteId,
      mostSpecific.mode === "exclure" ? null : mostSpecific.role,
    );
  }

  return results;
}

/**
 * Vérifie si un utilisateur a un rôle spécifique sur un site
 * (utile pour permissions type "est responsable_site")
 */
export async function userHasRoleOnSite({
  userId,
  siteId,
  role,
  entrepriseId,
  tx,
}: {
  userId: string;
  siteId: string;
  role: RoleClientAttributionType;
  entrepriseId: string;
  tx?: DbOrTransactionType;
}): Promise<boolean> {
  const resolved = await resolveUserEffectiveRoleOnSite({
    userId,
    siteId,
    entrepriseId,
    tx,
  });

  return resolved === role;
}

/**
 * Canonise un ensemble d'attributions en supprimant les redondances
 *
 * Règles de nettoyage :
 * A. Redondance via subtree
 *    SI attribution A couvre déjà le site B (même rôle, mode=inclure)
 *    ALORS ne pas stocker attribution B
 *
 * B. Override (conserver)
 *    SI attribution sur enfant a un rôle DIFFÉRENT
 *    ALORS conserver (c'est une exception positive)
 *
 * C. Exclusions (toujours conserver)
 *    TOUTES les attributions mode=exclure sont gardées (ce sont des exceptions)
 *
 * @param attributions - Attributions à canoniser
 * @param userId - ID de l'utilisateur (pour vérifier cohérence)
 * @param entrepriseId - ID de l'entreprise
 * @returns Attributions canonisées (sans redondances)
 */
export async function canonizeAttributions({
  attributions,
  userId,
  entrepriseId,
}: {
  attributions: Array<{
    siteId: string;
    mode: AttributionModeType;
    scope: "self" | "subtree";
    role: RoleClientAttributionType;
  }>;
  userId: string;
  entrepriseId: string;
}): Promise<
  Array<{
    siteId: string;
    mode: AttributionModeType;
    scope: "self" | "subtree";
    role: RoleClientAttributionType;
  }>
> {
  const canonical: Array<{
    siteId: string;
    mode: AttributionModeType;
    scope: "self" | "subtree";
    role: RoleClientAttributionType;
  }> = [];

  for (const attr of attributions) {
    // Règle C : Les exclusions sont TOUJOURS gardées
    if (attr.mode === "exclure") {
      canonical.push(attr);
      continue;
    }

    // Règle A : Vérifier si l'attribution est redondante (mode=inclure uniquement)
    // Une attribution est redondante si :
    // - Un ancêtre du site a déjà une attribution (scope=subtree, mode=inclure, même rôle)

    // Récupérer les ancêtres du site
    const ancestors = await getSiteAncestorsFromClosureTable({
      siteId: attr.siteId,
      entrepriseId,
    });

    // Chercher si un ancêtre a déjà une attribution qui couvre ce site
    const isCoveredByAncestor = attributions.some((otherAttr) => {
      // Même site → pas un ancêtre
      if (otherAttr.siteId === attr.siteId) return false;

      // Scope doit être subtree pour couvrir
      if (otherAttr.scope !== "subtree") return false;

      // Mode doit être inclure
      if (otherAttr.mode !== "inclure") return false;

      // Rôles doivent être identiques (sinon c'est un override, règle B)
      if (otherAttr.role !== attr.role) return false;

      // Vérifier si otherAttr.siteId est un ancêtre de attr.siteId
      const isAncestor = ancestors.some((anc) => anc.ancetreId === otherAttr.siteId);

      return isAncestor;
    });

    // Si pas couvert par un ancêtre → GARDER
    if (!isCoveredByAncestor) {
      canonical.push(attr);
    }
    // Sinon → SUPPRIMER (redondant)
  }

  return canonical;
}
