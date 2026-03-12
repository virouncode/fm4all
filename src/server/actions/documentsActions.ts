"use server";

import { db } from "@/db";
import { documentTagLinks, documents, documentsLinks, documentsTags } from "@/db/schema/documents";
import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { promoteS3Key } from "@/server/s3/s3";
import { getSession } from "@/server/auth/get-session";
import { getUserClientAdhesion, getUserPrestataireAdhesion, hasAccessToEntreprise } from "@/server/queries/userAdhesions.query";
import { getEffectivePlateformeRole } from "@/server/utils/permissions.utils";
import {
  getAllEntreprises,
  getDocumentPartnersForClient,
  getDocumentPartnersForPrestataire,
  getDocumentTagsByEntreprise,
  getDocumentTagsByEntreprises,
  getMyStandaloneDocuments,
  getSharedDocuments,
} from "@/server/queries/documents.query";
import {
  deleteDocumentSchema,
  getDocumentPartnersSchema,
  getDocumentsSchema,
  insertDocumentTagFormSchema,
  updateDocumentFormSchema,
} from "@/zod-schemas/documents.schema";
import { and, eq } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { cookies } from "next/headers";
import { z } from "zod";
import { deleteS3Object } from "@/server/s3/s3";

const handleValidationErrorsShape = async (ve: Parameters<typeof flattenValidationErrors>[0]) =>
  flattenValidationErrors(ve).fieldErrors;

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function requireUser() {
  const session = await getSession();
  if (!session?.user) throw errors.unauthorized("Non authentifié.");
  return session.user;
}

// ─── Permission helper ────────────────────────────────────────────────────────

async function assertCanWrite(userId: string, entrepriseId: string): Promise<void> {
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) return;

  const [clientAdhesion, prestataireAdhesion] = await Promise.all([
    getUserClientAdhesion({ userId, entrepriseId }),
    getUserPrestataireAdhesion({ userId }),
  ]);

  if (clientAdhesion?.role === "admin" || clientAdhesion?.role === "manager") return;
  if (
    prestataireAdhesion?.entrepriseId === entrepriseId &&
    (prestataireAdhesion.role === "admin" || prestataireAdhesion.role === "manager")
  ) return;

  throw errors.forbidden("Seuls les administrateurs et managers peuvent gérer les documents.");
}

// ─── Get documents ────────────────────────────────────────────────────────────

export const getDocumentsAction = actionClient
  .metadata({ actionName: "getDocumentsAction" })
  .inputSchema(getDocumentsSchema, { handleValidationErrorsShape })
  .action(async ({ parsedInput }) => {
    const currentUser = await requireUser();

    const hasAccess = await hasAccessToEntreprise(currentUser.id, parsedInput.entrepriseId);
    if (!hasAccess) throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");

    const {
      entrepriseId,
      tab,
      search,
      visibilite,
      tagIds,
      partenaireEntrepriseId,
      orderBy,
      orderDir,
      page = 1,
      pageSize = 30,
    } = parsedInput;

    if (tab === "mes_documents") {
      const { rows, total } = await getMyStandaloneDocuments({
        entrepriseId,
        search,
        visibilite,
        tagIds,
        orderBy,
        orderDir,
        page,
        pageSize,
      });
      return {
        documents: rows,
        total,
        hasMore: page * pageSize < total,
      };
    }

    // Tab "partages"
    const cookieStore = await cookies();
    const posture = cookieStore.get("fm4all:postureActive")?.value;
    const platformRole = await getEffectivePlateformeRole(currentUser.id);

    let partnerIds: string[] | null;

    if (platformRole?.role) {
      partnerIds = null;
    } else if (posture === "client") {
      const partners = await getDocumentPartnersForClient(entrepriseId);
      partnerIds = partners.map((p) => p.id);
    } else {
      const partners = await getDocumentPartnersForPrestataire(entrepriseId);
      partnerIds = partners.map((p) => p.id);
    }

    const { rows, total } = await getSharedDocuments({
      myEntrepriseId: entrepriseId,
      partnerIds,
      partenaireEntrepriseId,
      search,
      tagIds,
      orderBy,
      orderDir,
      page,
      pageSize,
    });

    return { documents: rows, total, hasMore: page * pageSize < total };
  });

// ─── Insert document ──────────────────────────────────────────────────────────

const insertDocumentActionSchema = z.object({
  entrepriseId: z.uuid(),
  titre: z.string().optional(),
  visibilite: z.enum(["prive", "public"]),
  tagIds: z.array(z.uuid()),
  file: z.object({
    storageKey: z.string().min(1),
    filename: z.string().min(1),
    mimeType: z.string().min(1),
    sizeBytes: z.number().int().positive(),
  }),
});

export const insertDocumentAction = actionClient
  .metadata({ actionName: "insertDocumentAction" })
  .inputSchema(insertDocumentActionSchema, { handleValidationErrorsShape })
  .action(async ({ parsedInput }) => {
    const currentUser = await requireUser();

    await assertCanWrite(currentUser.id, parsedInput.entrepriseId);

    const { entrepriseId, titre, visibilite, tagIds, file } = parsedInput;

    const permanentKey = await promoteS3Key({ tempKey: file.storageKey });

    const result = await db.transaction(async (tx) => {
      const [doc] = await tx
        .insert(documents)
        .values({
          proprietaireEntrepriseId: entrepriseId,
          categorie: "document",
          titre: titre || null,
          storageProvider: "s3",
          storageKey: permanentKey,
          filename: file.filename,
          mimeType: file.mimeType,
          sizeBytes: file.sizeBytes,
          createdById: currentUser.id,
        })
        .returning();

      await tx.insert(documentsLinks).values({
        documentId: doc.id,
        proprietaireEntrepriseId: entrepriseId,
        entrepriseId,
        visibilite,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      });

      if (tagIds.length > 0) {
        await tx.insert(documentTagLinks).values(
          tagIds.map((tagId) => ({ documentId: doc.id, tagId })),
        );
      }

      return doc;
    });

    return { document: result };
  });

// ─── Update document ──────────────────────────────────────────────────────────

export const updateDocumentAction = actionClient
  .metadata({ actionName: "updateDocumentAction" })
  .inputSchema(updateDocumentFormSchema, { handleValidationErrorsShape })
  .action(async ({ parsedInput }) => {
    const currentUser = await requireUser();

    await assertCanWrite(currentUser.id, parsedInput.entrepriseId);

    const { documentId, entrepriseId, titre, visibilite, tagIds } = parsedInput;

    const existing = await db.query.documents.findFirst({
      where: and(
        eq(documents.id, documentId),
        eq(documents.proprietaireEntrepriseId, entrepriseId),
      ),
    });
    if (!existing) throw errors.notFound("Document introuvable.");

    await db.transaction(async (tx) => {
      await tx
        .update(documents)
        .set({ titre: titre || null })
        .where(eq(documents.id, documentId));

      await tx
        .update(documentsLinks)
        .set({ visibilite, updatedById: currentUser.id })
        .where(
          and(
            eq(documentsLinks.documentId, documentId),
            eq(documentsLinks.proprietaireEntrepriseId, entrepriseId),
          ),
        );

      await tx
        .delete(documentTagLinks)
        .where(eq(documentTagLinks.documentId, documentId));

      if (tagIds.length > 0) {
        await tx.insert(documentTagLinks).values(
          tagIds.map((tagId) => ({ documentId, tagId })),
        );
      }
    });

    return { success: true };
  });

// ─── Delete document ──────────────────────────────────────────────────────────

export const deleteDocumentAction = actionClient
  .metadata({ actionName: "deleteDocumentAction" })
  .inputSchema(deleteDocumentSchema, { handleValidationErrorsShape })
  .action(async ({ parsedInput }) => {
    const currentUser = await requireUser();

    await assertCanWrite(currentUser.id, parsedInput.entrepriseId);

    const { documentId, entrepriseId } = parsedInput;

    const existing = await db.query.documents.findFirst({
      where: and(
        eq(documents.id, documentId),
        eq(documents.proprietaireEntrepriseId, entrepriseId),
      ),
    });
    if (!existing) throw errors.notFound("Document introuvable.");

    await deleteS3Object({ key: existing.storageKey });
    await db.delete(documents).where(eq(documents.id, documentId));

    return { success: true };
  });

// ─── Get tags for an enterprise ──────────────────────────────────────────────

export const getDocumentTagsAction = actionClient
  .metadata({ actionName: "getDocumentTagsAction" })
  .inputSchema(z.object({ entrepriseId: z.uuid() }), { handleValidationErrorsShape })
  .action(async ({ parsedInput }) => {
    const currentUser = await requireUser();

    const hasAccess = await hasAccessToEntreprise(currentUser.id, parsedInput.entrepriseId);
    if (!hasAccess) throw errors.forbidden("Accès refusé.");

    const tags = await getDocumentTagsByEntreprise(parsedInput.entrepriseId);
    return { tags };
  });

// ─── Get tags for multiple enterprises (shared tab) ──────────────────────────

export const getDocumentTagsForPartnersAction = actionClient
  .metadata({ actionName: "getDocumentTagsForPartnersAction" })
  .inputSchema(
    z.object({ entrepriseId: z.uuid(), partenaireEntrepriseId: z.uuid().optional() }),
    { handleValidationErrorsShape },
  )
  .action(async ({ parsedInput }) => {
    const currentUser = await requireUser();

    const hasAccess = await hasAccessToEntreprise(currentUser.id, parsedInput.entrepriseId);
    if (!hasAccess) throw errors.forbidden("Accès refusé.");

    const cookieStore = await cookies();
    const posture = cookieStore.get("fm4all:postureActive")?.value;
    const platformRole = await getEffectivePlateformeRole(currentUser.id);

    let tags;

    if (parsedInput.partenaireEntrepriseId) {
      tags = await getDocumentTagsByEntreprise(parsedInput.partenaireEntrepriseId);
    } else if (platformRole?.role) {
      const allEntreprises = await getAllEntreprises(parsedInput.entrepriseId);
      tags = await getDocumentTagsByEntreprises(allEntreprises.map((e) => e.id));
    } else if (posture === "client") {
      const partners = await getDocumentPartnersForClient(parsedInput.entrepriseId);
      tags = await getDocumentTagsByEntreprises(partners.map((p) => p.id));
    } else {
      const partners = await getDocumentPartnersForPrestataire(parsedInput.entrepriseId);
      tags = await getDocumentTagsByEntreprises(partners.map((p) => p.id));
    }

    return { tags };
  });

// ─── Insert tag ───────────────────────────────────────────────────────────────

export const insertDocumentTagAction = actionClient
  .metadata({ actionName: "insertDocumentTagAction" })
  .inputSchema(insertDocumentTagFormSchema, { handleValidationErrorsShape })
  .action(async ({ parsedInput }) => {
    const currentUser = await requireUser();

    await assertCanWrite(currentUser.id, parsedInput.entrepriseId);

    const [tag] = await db
      .insert(documentsTags)
      .values({
        proprietaireEntrepriseId: parsedInput.entrepriseId,
        nom: parsedInput.nom,
        couleur: parsedInput.couleur ?? null,
        createdById: currentUser.id,
      })
      .returning();

    return { tag };
  });

// ─── Get document partners (for "Documents partagés" selector) ────────────────

export const getDocumentPartnersAction = actionClient
  .metadata({ actionName: "getDocumentPartnersAction" })
  .inputSchema(getDocumentPartnersSchema, { handleValidationErrorsShape })
  .action(async ({ parsedInput }) => {
    const currentUser = await requireUser();

    const hasAccess = await hasAccessToEntreprise(currentUser.id, parsedInput.entrepriseId);
    if (!hasAccess) throw errors.forbidden("Accès refusé.");

    const cookieStore = await cookies();
    const posture = cookieStore.get("fm4all:postureActive")?.value;
    const platformRole = await getEffectivePlateformeRole(currentUser.id);

    let partners: { id: string; nom: string }[];

    if (platformRole?.role) {
      partners = await getAllEntreprises(parsedInput.entrepriseId);
    } else if (posture === "client") {
      partners = await getDocumentPartnersForClient(parsedInput.entrepriseId);
    } else {
      partners = await getDocumentPartnersForPrestataire(parsedInput.entrepriseId);
    }

    return { partners };
  });

// ─── Legacy: get single document ─────────────────────────────────────────────

export const getDocumentAction = actionClient
  .metadata({ actionName: "getDocumentAction" })
  .inputSchema(z.object({ documentId: z.uuid() }), { handleValidationErrorsShape })
  .action(async ({ parsedInput }) => {
    const currentUser = await requireUser();

    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, parsedInput.documentId),
    });

    // Basic auth check — doc is accessible to the owner's enterprise members
    if (!doc) return { document: null };

    const hasAccess = await hasAccessToEntreprise(currentUser.id, doc.proprietaireEntrepriseId);
    if (!hasAccess) throw errors.forbidden("Accès refusé.");

    return { document: doc };
  });
