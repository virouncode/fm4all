import "server-only";
import { db } from "@/db";
import { usersArborescence } from "@/db/schema/users";
import { eq, and } from "drizzle-orm";

type DbOrTransactionType =
  | typeof db
  | Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * INSERT: Créer les entrées de closure table pour un nouvel utilisateur
 *
 * Algorithme:
 * 1. Ligne réflexive (user → user, profondeur 0)
 * 2. Si parentId: copier les ancêtres du parent avec profondeur+1
 */
export async function insertUserArborescence({
  entrepriseId,
  userId,
  parentId,
  createdById,
  tx,
}: {
  entrepriseId: string;
  userId: string;
  parentId: string | null;
  createdById: string;
  tx?: DbOrTransactionType;
}) {
  const dbClient = tx || db;

  // 1. Entry réflexive (user → user, profondeur 0)
  await dbClient.insert(usersArborescence).values({
    entrepriseId,
    ancetreId: userId,
    descendantId: userId,
    profondeur: 0,
    createdById,
    updatedById: createdById,
  });

  // 2. Copier ancêtres du parent si parentId
  if (parentId) {
    const ancestorsOfParent = await dbClient
      .select()
      .from(usersArborescence)
      .where(
        and(
          eq(usersArborescence.entrepriseId, entrepriseId),
          eq(usersArborescence.descendantId, parentId),
        ),
      );

    const entries = ancestorsOfParent.map((ancestor) => ({
      entrepriseId,
      ancetreId: ancestor.ancetreId,
      descendantId: userId,
      profondeur: ancestor.profondeur + 1,
      createdById,
      updatedById: createdById,
    }));

    if (entries.length > 0) {
      await dbClient.insert(usersArborescence).values(entries);
    }
  }
}

/**
 * DELETE: Supprimer les entrées de closure table
 */
export async function deleteUserArborescence({
  entrepriseId,
  userId,
  tx,
}: {
  entrepriseId: string;
  userId: string;
  tx?: DbOrTransactionType;
}) {
  const dbClient = tx || db;

  await dbClient.delete(usersArborescence).where(
    and(
      eq(usersArborescence.entrepriseId, entrepriseId),
      eq(usersArborescence.descendantId, userId),
    ),
  );
}

/**
 * CHECK: Vérifier si un utilisateur a des enfants directs
 */
export async function userHasChildren({
  entrepriseId,
  userId,
  tx,
}: {
  entrepriseId: string;
  userId: string;
  tx?: DbOrTransactionType;
}): Promise<boolean> {
  const dbClient = tx || db;

  const [result] = await dbClient
    .select()
    .from(usersArborescence)
    .where(
      and(
        eq(usersArborescence.entrepriseId, entrepriseId),
        eq(usersArborescence.ancetreId, userId),
        eq(usersArborescence.profondeur, 1),
      ),
    )
    .limit(1);

  return !!result;
}

/**
 * CHECK: Vérifier si un utilisateur est descendant d'un autre
 * @returns true si descendantId est un descendant de ancetreId
 */
export async function isUserDescendant({
  entrepriseId,
  ancetreId,
  descendantId,
  tx,
}: {
  entrepriseId: string;
  ancetreId: string;
  descendantId: string;
  tx?: DbOrTransactionType;
}): Promise<boolean> {
  const dbClient = tx || db;

  const [result] = await dbClient
    .select()
    .from(usersArborescence)
    .where(
      and(
        eq(usersArborescence.entrepriseId, entrepriseId),
        eq(usersArborescence.ancetreId, ancetreId),
        eq(usersArborescence.descendantId, descendantId),
      ),
    )
    .limit(1);

  return !!result;
}
