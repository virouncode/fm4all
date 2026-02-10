import "server-only";

import { db } from "@/db";
import { documents, user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserById(userId: string) {
  const [row] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  return row ?? null;
}

export async function getUserByEmail(email: string) {
  const [row] = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  return row ?? null;
}

/**
 * Vue "profil" : user + avatar document (via avatarId)
 * - join sur documents pour récupérer storageProvider/storageKey/etc.
 */
export async function getUserForProfileById(userId: string) {
  const [row] = await db
    .select({
      id: user.id,
      name: user.name,
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      phone: user.phone,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,

      avatarId: user.avatarId,

      avatar: {
        id: documents.id,
        proprietaireEntrepriseId: documents.proprietaireEntrepriseId,
        categorie: documents.categorie,
        titre: documents.titre,
        storageProvider: documents.storageProvider,
        storageKey: documents.storageKey,
        filename: documents.filename,
        mimeType: documents.mimeType,
        sizeBytes: documents.sizeBytes,
        createdAt: documents.createdAt,
        createdById: documents.createdById,
      },
    })
    .from(user)
    .leftJoin(documents, eq(user.avatarId, documents.id))
    .where(eq(user.id, userId))
    .limit(1);

  return row ?? null;
}
