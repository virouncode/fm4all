import "server-only";

import { db } from "@/db";
import { documents, documentsLinks } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export async function getDocumentById(documentId: string) {
  const [row] = await db
    .select({
      id: documents.id,
      proprietaireEntrepriseId: documents.proprietaireEntrepriseId,
      storageProvider: documents.storageProvider,
      storageKey: documents.storageKey,
      filename: documents.filename,
      mimeType: documents.mimeType,
      sizeBytes: documents.sizeBytes,
    })
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  return row ?? null;
}

export async function getDocumentsByTicketId(ticketId: string) {
  const rows = await db
    .select({
      id: documents.id,
      proprietaireEntrepriseId: documents.proprietaireEntrepriseId,
      storageProvider: documents.storageProvider,
      storageKey: documents.storageKey,
      filename: documents.filename,
      mimeType: documents.mimeType,
      sizeBytes: documents.sizeBytes,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .innerJoin(documentsLinks, eq(documentsLinks.documentId, documents.id))
    .where(
      and(
        eq(documentsLinks.ticketId, ticketId),
        isNull(documentsLinks.ticketMessageId), // Exclure les PJ des messages
      ),
    )
    .orderBy(documents.createdAt);

  return rows;
}
