import "server-only";

import { db } from "@/db";
import { tacheListeItems, tacheListesTemplates } from "@/db/schema/services";
import { and, asc, eq, inArray, isNull, or } from "drizzle-orm";

export type TacheListeItemRow = {
  id: string;
  ordre: number;
  titre: string;
  description: string | null;
  actif: boolean;
  dureeEstimeeMinutes: number | null;
};

export type TacheListeTemplateRow = {
  id: string;
  serviceId: string;
  proprietaireEntrepriseId: string | null;
  nom: string;
  actif: boolean;
};

export type TacheListeTemplateWithItems = TacheListeTemplateRow & {
  items: TacheListeItemRow[];
};

/**
 * GET AVAILABLE PACKS FOR A CONTEXT
 *
 * Returns all active packs for a given service visible to the caller.
 * Always includes system packs (proprietaireEntrepriseId IS NULL).
 * Also includes packs belonging to the provided entrepriseIds.
 *
 * Pack visibility rules (caller is responsible for computing entrepriseIds):
 *   - Client/plateforme creating client_service : [clientId]
 *   - Prestataire creating client_service       : [prestataireId, clientId]
 *   - Creating/editing execution                : [clientId, prestataireId]
 *
 * Items are included (nested) ordered by `ordre`.
 */
export async function getAvailableTacheListesTemplates({
  serviceId,
  entrepriseIds,
}: {
  serviceId: string;
  entrepriseIds: string[];
}): Promise<TacheListeTemplateWithItems[]> {
  const packs = await db
    .select({
      id: tacheListesTemplates.id,
      serviceId: tacheListesTemplates.serviceId,
      proprietaireEntrepriseId: tacheListesTemplates.proprietaireEntrepriseId,
      nom: tacheListesTemplates.nom,
      actif: tacheListesTemplates.actif,
    })
    .from(tacheListesTemplates)
    .where(
      and(
        eq(tacheListesTemplates.serviceId, serviceId),
        eq(tacheListesTemplates.actif, true),
        or(
          isNull(tacheListesTemplates.proprietaireEntrepriseId),
          entrepriseIds.length > 0
            ? inArray(
                tacheListesTemplates.proprietaireEntrepriseId,
                entrepriseIds,
              )
            : undefined,
        ),
      ),
    )
    .orderBy(asc(tacheListesTemplates.nom));

  if (packs.length === 0) return [];

  const packIds = packs.map((p) => p.id);

  const items = await db
    .select({
      id: tacheListeItems.id,
      listeTemplateId: tacheListeItems.listeTemplateId,
      ordre: tacheListeItems.ordre,
      titre: tacheListeItems.titre,
      description: tacheListeItems.description,
      actif: tacheListeItems.actif,
      dureeEstimeeMinutes: tacheListeItems.dureeEstimeeMinutes,
    })
    .from(tacheListeItems)
    .where(
      and(
        inArray(tacheListeItems.listeTemplateId, packIds),
        eq(tacheListeItems.actif, true),
      ),
    )
    .orderBy(asc(tacheListeItems.ordre));

  // Group items by pack
  const itemsByPack = new Map<string, TacheListeItemRow[]>();
  for (const item of items) {
    const existing = itemsByPack.get(item.listeTemplateId) ?? [];
    existing.push({
      id: item.id,
      ordre: item.ordre,
      titre: item.titre,
      description: item.description,
      actif: item.actif,
      dureeEstimeeMinutes: item.dureeEstimeeMinutes,
    });
    itemsByPack.set(item.listeTemplateId, existing);
  }

  return packs.map((pack) => ({
    ...pack,
    items: itemsByPack.get(pack.id) ?? [],
  }));
}

/**
 * GET PACK WITH ALL ITEMS (including inactive) — for pack editor
 */
export async function getTacheListeTemplateWithItems(
  id: string,
): Promise<TacheListeTemplateWithItems | null> {
  const [pack] = await db
    .select({
      id: tacheListesTemplates.id,
      serviceId: tacheListesTemplates.serviceId,
      proprietaireEntrepriseId: tacheListesTemplates.proprietaireEntrepriseId,
      nom: tacheListesTemplates.nom,
      actif: tacheListesTemplates.actif,
    })
    .from(tacheListesTemplates)
    .where(eq(tacheListesTemplates.id, id))
    .limit(1);

  if (!pack) return null;

  const items = await db
    .select({
      id: tacheListeItems.id,
      listeTemplateId: tacheListeItems.listeTemplateId,
      ordre: tacheListeItems.ordre,
      titre: tacheListeItems.titre,
      description: tacheListeItems.description,
      actif: tacheListeItems.actif,
      dureeEstimeeMinutes: tacheListeItems.dureeEstimeeMinutes,
    })
    .from(tacheListeItems)
    .where(eq(tacheListeItems.listeTemplateId, id))
    .orderBy(asc(tacheListeItems.ordre));

  return {
    ...pack,
    items: items.map((item) => ({
      id: item.id,
      ordre: item.ordre,
      titre: item.titre,
      description: item.description,
      actif: item.actif,
      dureeEstimeeMinutes: item.dureeEstimeeMinutes,
    })),
  };
}

/**
 * GET ALL PACKS FOR A PROPRIETAIRE (for pack manager)
 * Returns all packs (active + inactive) with their items.
 * Pass proprietaireEntrepriseId = null to get system packs.
 */
export async function getTacheListesTemplatesByProprietaire({
  proprietaireEntrepriseId,
  serviceId,
}: {
  proprietaireEntrepriseId: string | null;
  serviceId?: string;
}): Promise<TacheListeTemplateWithItems[]> {
  const ownerCondition =
    proprietaireEntrepriseId === null
      ? isNull(tacheListesTemplates.proprietaireEntrepriseId)
      : eq(
          tacheListesTemplates.proprietaireEntrepriseId,
          proprietaireEntrepriseId,
        );

  const conditions = [ownerCondition];

  if (serviceId) {
    conditions.push(eq(tacheListesTemplates.serviceId, serviceId));
  }

  const packs = await db
    .select({
      id: tacheListesTemplates.id,
      serviceId: tacheListesTemplates.serviceId,
      proprietaireEntrepriseId: tacheListesTemplates.proprietaireEntrepriseId,
      nom: tacheListesTemplates.nom,
      actif: tacheListesTemplates.actif,
    })
    .from(tacheListesTemplates)
    .where(and(...conditions))
    .orderBy(asc(tacheListesTemplates.nom));

  if (packs.length === 0) return [];

  const packIds = packs.map((p) => p.id);

  const items = await db
    .select({
      id: tacheListeItems.id,
      listeTemplateId: tacheListeItems.listeTemplateId,
      ordre: tacheListeItems.ordre,
      titre: tacheListeItems.titre,
      description: tacheListeItems.description,
      actif: tacheListeItems.actif,
      dureeEstimeeMinutes: tacheListeItems.dureeEstimeeMinutes,
    })
    .from(tacheListeItems)
    .where(inArray(tacheListeItems.listeTemplateId, packIds))
    .orderBy(asc(tacheListeItems.ordre));

  const itemsByPack = new Map<string, TacheListeItemRow[]>();
  for (const item of items) {
    const existing = itemsByPack.get(item.listeTemplateId) ?? [];
    existing.push({
      id: item.id,
      ordre: item.ordre,
      titre: item.titre,
      description: item.description,
      actif: item.actif,
      dureeEstimeeMinutes: item.dureeEstimeeMinutes,
    });
    itemsByPack.set(item.listeTemplateId, existing);
  }

  return packs.map((pack) => ({
    ...pack,
    items: itemsByPack.get(pack.id) ?? [],
  }));
}
