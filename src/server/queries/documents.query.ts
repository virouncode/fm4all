import "server-only";

import { db } from "@/db";
import {
  documentTagLinks,
  documents,
  documentsLinks,
  documentsTags,
} from "@/db/schema/documents";
import {
  clientPrestataireRelations,
  entreprises,
  entrepriseRoles,
} from "@/db/schema/entreprises";
import { SelectDocumentWithTagsType } from "@/zod-schemas/documents.schema";
import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  ne,
  or,
  sql,
} from "drizzle-orm";

// ─── Condition helpers ────────────────────────────────────────────────────────

/** JOIN condition qui identifie un lien "standalone" (document rattaché à une entreprise, pas à une entité) */
function standaloneJoinBase() {
  return and(
    isNotNull(documentsLinks.entrepriseId),
    isNull(documentsLinks.ticketId),
    isNull(documentsLinks.ticketMessageId),
    isNull(documentsLinks.siteId),
    isNull(documentsLinks.occurrenceId),
    isNull(documentsLinks.devisId),
    isNull(documentsLinks.devisDemandeId),
    isNull(documentsLinks.contratId),
    isNull(documentsLinks.factureId),
    isNull(documentsLinks.clientServiceId),
    isNull(documentsLinks.clientServiceExecutionId),
    isNull(documentsLinks.occurrenceTacheId),
  );
}

// ─── Existing queries (tickets, etc.) ────────────────────────────────────────

export async function getDocumentsByTicketId(ticketId: string) {
  return db
    .select({
      id: documents.id,
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
        isNull(documentsLinks.ticketMessageId),
      ),
    )
    .orderBy(asc(documents.createdAt));
}

export async function getDocumentById(documentId: string) {
  return db.query.documents.findFirst({
    where: eq(documents.id, documentId),
  });
}

// ─── Standalone document queries ──────────────────────────────────────────────

type OrderByField = "createdAt" | "titre" | "filename" | "sizeBytes" | "mimeType";

function resolveOrderBy(orderBy: OrderByField, orderDir: "asc" | "desc") {
  const col = {
    createdAt: documents.createdAt,
    titre: documents.titre,
    filename: documents.filename,
    sizeBytes: documents.sizeBytes,
    mimeType: documents.mimeType,
  }[orderBy] ?? documents.createdAt;
  return orderDir === "asc" ? asc(col) : desc(col);
}

async function enrichWithTags(
  rows: Array<{ id: string } & Record<string, unknown>>,
): Promise<Map<string, Array<{ id: string; nom: string; couleur: string | null }>>> {
  const tagsByDocId = new Map<string, Array<{ id: string; nom: string; couleur: string | null }>>();
  if (rows.length === 0) return tagsByDocId;

  const tagRows = await db
    .select({
      documentId: documentTagLinks.documentId,
      tagId: documentsTags.id,
      nom: documentsTags.nom,
      couleur: documentsTags.couleur,
    })
    .from(documentTagLinks)
    .innerJoin(documentsTags, eq(documentsTags.id, documentTagLinks.tagId))
    .where(inArray(documentTagLinks.documentId, rows.map((r) => r.id)));

  for (const t of tagRows) {
    if (!tagsByDocId.has(t.documentId)) tagsByDocId.set(t.documentId, []);
    tagsByDocId.get(t.documentId)!.push({ id: t.tagId, nom: t.nom, couleur: t.couleur });
  }
  return tagsByDocId;
}

/** "Mes documents" — documents standalone de mon entreprise */
export async function getMyStandaloneDocuments(params: {
  entrepriseId: string;
  search?: string;
  visibilite?: "prive" | "public";
  tagIds?: string[];
  orderBy?: OrderByField;
  orderDir?: "asc" | "desc";
  page: number;
  pageSize: number;
}): Promise<{ rows: SelectDocumentWithTagsType[]; total: number }> {
  const {
    entrepriseId,
    search,
    visibilite,
    tagIds,
    orderBy = "createdAt",
    orderDir = "desc",
    page,
    pageSize,
  } = params;

  const joinCond = and(
    eq(documentsLinks.documentId, documents.id),
    eq(documentsLinks.proprietaireEntrepriseId, entrepriseId),
    standaloneJoinBase(),
  );

  const whereConditions = [eq(documents.proprietaireEntrepriseId, entrepriseId)];

  if (visibilite) whereConditions.push(eq(documentsLinks.visibilite, visibilite));
  if (search) {
    whereConditions.push(
      or(ilike(documents.titre, `%${search}%`), ilike(documents.filename, `%${search}%`))!,
    );
  }
  if (tagIds && tagIds.length > 0) {
    whereConditions.push(
      inArray(
        documents.id,
        db
          .select({ id: documentTagLinks.documentId })
          .from(documentTagLinks)
          .where(inArray(documentTagLinks.tagId, tagIds)),
      ),
    );
  }

  const where = and(...whereConditions);

  const [rows, countRows] = await Promise.all([
    db
      .select({
        id: documents.id,
        proprietaireEntrepriseId: documents.proprietaireEntrepriseId,
        proprietaireEntrepriseNom: entreprises.nom,
        categorie: documents.categorie,
        titre: documents.titre,
        storageKey: documents.storageKey,
        filename: documents.filename,
        mimeType: documents.mimeType,
        sizeBytes: documents.sizeBytes,
        createdAt: documents.createdAt,
        visibilite: documentsLinks.visibilite,
      })
      .from(documents)
      .innerJoin(documentsLinks, joinCond)
      .innerJoin(entreprises, eq(entreprises.id, documents.proprietaireEntrepriseId))
      .where(where)
      .orderBy(resolveOrderBy(orderBy, orderDir))
      .limit(pageSize)
      .offset((page - 1) * pageSize),

    db
      .select({ count: sql<number>`count(*)::int` })
      .from(documents)
      .innerJoin(documentsLinks, joinCond)
      .where(where),
  ]);

  const total = countRows[0]?.count ?? 0;
  const tagsByDocId = await enrichWithTags(rows);

  return {
    rows: rows.map((r) => ({
      ...r,
      visibilite: r.visibilite as "prive" | "public",
      tags: tagsByDocId.get(r.id) ?? [],
    })),
    total,
  };
}

/** "Documents partagés" — documents publics d'autres entreprises partenaires */
export async function getSharedDocuments(params: {
  myEntrepriseId: string;
  /** null = toutes les entreprises (plateforme), [] = aucun partenaire, [...] = filtre par ces IDs */
  partnerIds: string[] | null;
  partenaireEntrepriseId?: string;
  search?: string;
  tagIds?: string[];
  orderBy?: OrderByField;
  orderDir?: "asc" | "desc";
  page: number;
  pageSize: number;
}): Promise<{ rows: SelectDocumentWithTagsType[]; total: number }> {
  const {
    myEntrepriseId,
    partnerIds,
    partenaireEntrepriseId,
    search,
    tagIds,
    orderBy = "createdAt",
    orderDir = "desc",
    page,
    pageSize,
  } = params;

  const joinCond = and(
    eq(documentsLinks.documentId, documents.id),
    eq(documentsLinks.visibilite, "public"),
    standaloneJoinBase(),
  );

  const whereConditions = [ne(documents.proprietaireEntrepriseId, myEntrepriseId)];

  // Partner filter
  if (partenaireEntrepriseId) {
    whereConditions.push(eq(documents.proprietaireEntrepriseId, partenaireEntrepriseId));
  } else if (partnerIds !== null && partnerIds.length > 0) {
    whereConditions.push(inArray(documents.proprietaireEntrepriseId, partnerIds));
  } else if (partnerIds !== null && partnerIds.length === 0) {
    // No partners — return nothing
    return { rows: [], total: 0 };
  }
  // partnerIds === null → plateforme, pas de filtre (tout voir)

  if (search) {
    whereConditions.push(
      or(ilike(documents.titre, `%${search}%`), ilike(documents.filename, `%${search}%`))!,
    );
  }
  if (tagIds && tagIds.length > 0) {
    whereConditions.push(
      inArray(
        documents.id,
        db
          .select({ id: documentTagLinks.documentId })
          .from(documentTagLinks)
          .where(inArray(documentTagLinks.tagId, tagIds)),
      ),
    );
  }

  const where = and(...whereConditions);

  const [rows, countRows] = await Promise.all([
    db
      .select({
        id: documents.id,
        proprietaireEntrepriseId: documents.proprietaireEntrepriseId,
        proprietaireEntrepriseNom: entreprises.nom,
        categorie: documents.categorie,
        titre: documents.titre,
        storageKey: documents.storageKey,
        filename: documents.filename,
        mimeType: documents.mimeType,
        sizeBytes: documents.sizeBytes,
        createdAt: documents.createdAt,
        visibilite: documentsLinks.visibilite,
      })
      .from(documents)
      .innerJoin(documentsLinks, joinCond)
      .innerJoin(entreprises, eq(entreprises.id, documents.proprietaireEntrepriseId))
      .where(where)
      .orderBy(resolveOrderBy(orderBy, orderDir))
      .limit(pageSize)
      .offset((page - 1) * pageSize),

    db
      .select({ count: sql<number>`count(*)::int` })
      .from(documents)
      .innerJoin(documentsLinks, joinCond)
      .where(where),
  ]);

  const total = countRows[0]?.count ?? 0;
  const tagsByDocId = await enrichWithTags(rows);

  return {
    rows: rows.map((r) => ({
      ...r,
      visibilite: r.visibilite as "prive" | "public",
      tags: tagsByDocId.get(r.id) ?? [],
    })),
    total,
  };
}

/** Tags d'une entreprise (pour la tag bar) */
export async function getDocumentTagsByEntreprise(entrepriseId: string) {
  return db
    .select({
      id: documentsTags.id,
      nom: documentsTags.nom,
      couleur: documentsTags.couleur,
      proprietaireEntrepriseId: documentsTags.proprietaireEntrepriseId,
    })
    .from(documentsTags)
    .where(eq(documentsTags.proprietaireEntrepriseId, entrepriseId))
    .orderBy(asc(documentsTags.nom));
}

/** Tags de plusieurs entreprises (pour "Documents partagés" \/ "Toutes") */
export async function getDocumentTagsByEntreprises(entrepriseIds: string[]) {
  if (entrepriseIds.length === 0) return [];
  return db
    .select({
      id: documentsTags.id,
      nom: documentsTags.nom,
      couleur: documentsTags.couleur,
      proprietaireEntrepriseId: documentsTags.proprietaireEntrepriseId,
    })
    .from(documentsTags)
    .where(inArray(documentsTags.proprietaireEntrepriseId, entrepriseIds))
    .orderBy(asc(documentsTags.nom));
}

/** Entreprises partenaires pour "Documents partagés" (clients/prestataires + plateforme) */
export async function getDocumentPartnersForClient(clientEntrepriseId: string) {
  const [prestataires, plateformes] = await Promise.all([
    db
      .select({ id: entreprises.id, nom: entreprises.nom })
      .from(entreprises)
      .innerJoin(
        clientPrestataireRelations,
        and(
          eq(clientPrestataireRelations.prestataireEntrepriseId, entreprises.id),
          eq(clientPrestataireRelations.clientEntrepriseId, clientEntrepriseId),
        ),
      )
      .orderBy(asc(entreprises.nom)),
    db
      .select({ id: entreprises.id, nom: entreprises.nom })
      .from(entreprises)
      .innerJoin(
        entrepriseRoles,
        and(
          eq(entrepriseRoles.entrepriseId, entreprises.id),
          eq(entrepriseRoles.role, "plateforme"),
        ),
      )
      .where(ne(entreprises.id, clientEntrepriseId))
      .orderBy(asc(entreprises.nom)),
  ]);

  const seen = new Set<string>();
  const result: { id: string; nom: string }[] = [];
  for (const e of [...prestataires, ...plateformes]) {
    if (!seen.has(e.id)) {
      seen.add(e.id);
      result.push(e);
    }
  }
  return result;
}

export async function getDocumentPartnersForPrestataire(prestataireEntrepriseId: string) {
  const [clients, plateformes] = await Promise.all([
    db
      .select({ id: entreprises.id, nom: entreprises.nom })
      .from(entreprises)
      .innerJoin(
        clientPrestataireRelations,
        and(
          eq(clientPrestataireRelations.clientEntrepriseId, entreprises.id),
          eq(
            clientPrestataireRelations.prestataireEntrepriseId,
            prestataireEntrepriseId,
          ),
        ),
      )
      .orderBy(asc(entreprises.nom)),
    db
      .select({ id: entreprises.id, nom: entreprises.nom })
      .from(entreprises)
      .innerJoin(
        entrepriseRoles,
        and(
          eq(entrepriseRoles.entrepriseId, entreprises.id),
          eq(entrepriseRoles.role, "plateforme"),
        ),
      )
      .where(ne(entreprises.id, prestataireEntrepriseId))
      .orderBy(asc(entreprises.nom)),
  ]);

  const seen = new Set<string>();
  const result: { id: string; nom: string }[] = [];
  for (const e of [...clients, ...plateformes]) {
    if (!seen.has(e.id)) {
      seen.add(e.id);
      result.push(e);
    }
  }
  return result;
}

export async function getAllEntreprises(excludeId: string) {
  return db
    .select({ id: entreprises.id, nom: entreprises.nom })
    .from(entreprises)
    .where(ne(entreprises.id, excludeId))
    .orderBy(asc(entreprises.nom));
}
