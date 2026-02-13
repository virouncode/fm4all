import "server-only";
import { db } from "@/db";
import { sitesArborescence } from "@/db/schema/sites";
import { eq, and, gt } from "drizzle-orm";

type DbOrTransaction = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * INSERT: Créer les entrées de closure table pour un nouveau site
 *
 * Algorithme:
 * 1. Ligne réflexive (site → site, profondeur 0)
 * 2. Si parentId: copier les ancêtres du parent avec profondeur+1
 */
export async function insertSiteArborescence({
  entrepriseId,
  siteId,
  parentId,
  userId,
  tx,
}: {
  entrepriseId: string;
  siteId: string;
  parentId: string | null;
  userId: string;
  tx?: DbOrTransaction;
}) {
  const dbClient = tx || db;

  // 1. Entry réflexive (site → site, profondeur 0)
  await dbClient.insert(sitesArborescence).values({
    entrepriseId,
    ancetreId: siteId,
    descendantId: siteId,
    profondeur: 0,
    createdById: userId,
    updatedById: userId,
  });

  // 2. Copier ancêtres du parent si parentId
  if (parentId) {
    // Récupérer tous les ancêtres du parent (y compris le parent lui-même)
    const ancestorsOfParent = await dbClient
      .select()
      .from(sitesArborescence)
      .where(
        and(
          eq(sitesArborescence.entrepriseId, entrepriseId),
          eq(sitesArborescence.descendantId, parentId)
        )
      );

    // Insérer une ligne pour chaque ancêtre avec profondeur+1
    const entries = ancestorsOfParent.map((ancestor) => ({
      entrepriseId,
      ancetreId: ancestor.ancetreId,
      descendantId: siteId,
      profondeur: ancestor.profondeur + 1,
      createdById: userId,
      updatedById: userId,
    }));

    if (entries.length > 0) {
      await dbClient.insert(sitesArborescence).values(entries);
    }
  }
}

/**
 * DELETE: Supprimer les entrées de closure table
 *
 * Supprime toutes les entrées où le site est descendant.
 * Les entrées où il est ancêtre sont supprimées automatiquement
 * par onDelete: "cascade" sur la FK.
 */
export async function deleteSiteArborescence({
  entrepriseId,
  siteId,
  tx,
}: {
  entrepriseId: string;
  siteId: string;
  tx?: DbOrTransaction;
}) {
  const dbClient = tx || db;

  await dbClient
    .delete(sitesArborescence)
    .where(
      and(
        eq(sitesArborescence.entrepriseId, entrepriseId),
        eq(sitesArborescence.descendantId, siteId)
      )
    );
}

/**
 * CHECK: Vérifier si un site a des enfants directs
 *
 * Vérifie si un site a des enfants directs (profondeur = 1)
 */
export async function siteHasChildren({
  entrepriseId,
  siteId,
  tx,
}: {
  entrepriseId: string;
  siteId: string;
  tx?: DbOrTransaction;
}): Promise<boolean> {
  const dbClient = tx || db;

  const [result] = await dbClient
    .select()
    .from(sitesArborescence)
    .where(
      and(
        eq(sitesArborescence.entrepriseId, entrepriseId),
        eq(sitesArborescence.ancetreId, siteId),
        eq(sitesArborescence.profondeur, 1)
      )
    )
    .limit(1);

  return !!result;
}

/**
 * GET DESCENDANTS: Récupérer tous les descendants d'un site
 *
 * Récupère tous les IDs des descendants (enfants, petits-enfants, etc.)
 * en excluant le site lui-même (profondeur > 0).
 *
 * Utilise la closure table pour une récupération efficace via l'index
 * sites_arborescence_anc_idx (entrepriseId, ancetreId).
 *
 * @param entrepriseId - ID de l'entreprise
 * @param siteId - ID du site ancêtre
 * @param tx - Transaction optionnelle
 * @returns Liste des IDs des descendants (excluant le site lui-même)
 */
export async function getDescendantsOfSite({
  entrepriseId,
  siteId,
  tx,
}: {
  entrepriseId: string;
  siteId: string;
  tx?: DbOrTransaction;
}): Promise<string[]> {
  const dbClient = tx || db;

  const results = await dbClient
    .select({ descendantId: sitesArborescence.descendantId })
    .from(sitesArborescence)
    .where(
      and(
        eq(sitesArborescence.entrepriseId, entrepriseId),
        eq(sitesArborescence.ancetreId, siteId),
        gt(sitesArborescence.profondeur, 0) // Exclure la ligne réflexive (profondeur=0)
      )
    );

  return results.map((r) => r.descendantId);
}
