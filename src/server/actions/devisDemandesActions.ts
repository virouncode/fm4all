"use server";

import { db } from "@/db";
import { clientPrestataireRelations } from "@/db/schema/entreprises";
import { documents, documentsLinks } from "@/db/schema/documents";
import { devis, devisDemandes } from "@/db/schema/devis";
import { userPrestataireAdhesions } from "@/db/schema/users";
import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import { promoteS3Key } from "@/server/s3/s3";
import {
  getDevisDemandeAttachments,
  getDevisDemandeById,
  getDevisDemandesPaginated,
  getDevisDemandesPaginatedForPrestataire,
} from "@/server/queries/devisDemandes.query";
import { hasAccessToEntreprise } from "@/server/queries/userAdhesions.query";
import { getServicesByPrestataire } from "@/server/queries/services.query";
import {
  getActivePosture,
  getEffectivePlateformeRole,
} from "@/server/utils/permissions.utils";
import { getAllPrestataireSiteIds } from "@/server/queries/userPrestataireSiteAttributions.query";
import {
  assertDevisDemandeOwnership,
  canUserCreateDevisDemande,
  getAccessibleSiteIdsForUser,
  getCreatableSiteIds,
  getDevisDemandePermissions,
} from "@/server/utils/devisDemandesPermissions.utils";
import { normalizeForSubmit } from "@/zod-helpers/normalize";
import {
  devisDemandeQuerySchema,
  deleteDevisDemandeSchema,
  insertDevisDemandeFormSchema,
  selectDevisDemandeSchema,
  updateDevisDemandeFormSchema,
  updateDevisDemandeStatutSchema,
} from "@/zod-schemas/devis.schema";
import { and, eq } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { z } from "zod";

// ============================= GET DEMANDES ==============================//

export const getDevisDemandesAction = actionClient
  .metadata({ actionName: "getDevisDemandesAction" })
  .inputSchema(devisDemandeQuerySchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    // Branche plateforme
    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (plateformeRole?.role) {
      return getDevisDemandesPaginated(parsedInput);
    }

    // Branche prestataire
    const posture = await getActivePosture();
    if (posture === "prestataire") {
      const prestataireAdhesion = await db.query.userPrestataireAdhesions.findFirst({
        where: and(
          eq(userPrestataireAdhesions.userId, currentUser.id),
          eq(userPrestataireAdhesions.statut, "actif"),
        ),
      });
      if (!prestataireAdhesion) throw errors.forbidden("Accès refusé.");

      const prestataireEntrepriseId = prestataireAdhesion.entrepriseId;

      // Clients du prestataire (via clientPrestataireRelations)
      const clientRows = await db
        .select({ clientEntrepriseId: clientPrestataireRelations.clientEntrepriseId })
        .from(clientPrestataireRelations)
        .where(eq(clientPrestataireRelations.prestataireEntrepriseId, prestataireEntrepriseId));
      const allClientIds = clientRows.map((r) => r.clientEntrepriseId);

      // Services proposés par le prestataire
      const serviceRows = await getServicesByPrestataire(prestataireEntrepriseId);
      const allServiceIds = serviceRows.map((r) => r.id);

      // Scope sites : admin prestataire → undefined (aucune restriction), sinon attribués
      let scopeSiteIds: string[] | undefined = undefined;
      if (prestataireAdhesion.role !== "admin") {
        scopeSiteIds = await getAllPrestataireSiteIds({ userId: currentUser.id });
      }

      return getDevisDemandesPaginatedForPrestataire({
        allClientIds,
        allServiceIds,
        scopeSiteIds,
        clientId: parsedInput.clientId,
        serviceId: parsedInput.serviceId,
        siteId: parsedInput.siteId,
        statut: parsedInput.statut,
        search: parsedInput.search,
        orderBy: parsedInput.orderBy,
        orderDir: parsedInput.orderDir,
        page: parsedInput.page,
        pageSize: parsedInput.pageSize,
      });
    }

    // Branche client (défaut)
    const adhesion = await hasAccessToEntreprise(
      currentUser.id,
      parsedInput.entrepriseId,
    );
    if (!adhesion) throw errors.forbidden("Accès refusé.");

    // Calculer les siteIds accessibles (null = admin, tableau = filtrage)
    const scopeSiteIds = await getAccessibleSiteIdsForUser({
      userId: currentUser.id,
      entrepriseId: parsedInput.entrepriseId,
    });

    return getDevisDemandesPaginated(parsedInput, scopeSiteIds ?? undefined);
  });

// ============================= GET DEMANDE BY ID ==============================//

export const getDevisDemandeByIdAction = actionClient
  .metadata({ actionName: "getDevisDemandeByIdAction" })
  .inputSchema(z.object({ id: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const demande = await getDevisDemandeById(parsedInput.id);
    if (!demande) throw errors.notFound("Demande introuvable.");

    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (!plateformeRole?.role) {
      const perms = await getDevisDemandePermissions({
        userId: currentUser.id,
        devisDemandeId: parsedInput.id,
        entrepriseId: demande.demandeurEntrepriseId,
      });
      if (!perms.canView) throw errors.forbidden("Accès refusé.");

      return { demande, permissions: perms };
    }

    // Plateforme : lecture seule
    const perms = {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canChangeStatut: false,
    };
    return { demande, permissions: perms };
  });

// ============================= INSERT DEMANDE ==============================//

export const insertDevisDemandeAction = actionClient
  .metadata({ actionName: "insertDevisDemandeAction" })
  .inputSchema(
    insertDevisDemandeFormSchema.extend({
      entrepriseId: z.string().min(1, "Entreprise obligatoire"),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (plateformeRole?.role) {
      throw errors.forbidden("La plateforme ne peut pas créer de demande de devis.");
    }

    const canCreate = await canUserCreateDevisDemande({
      userId: currentUser.id,
      siteId: parsedInput.siteId,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!canCreate) {
      throw errors.forbidden(
        "Vous n'avez pas les droits pour créer une demande sur ce site.",
      );
    }

    const inserted = await db.transaction(async (tx) => {
      const [demande] = await tx
        .insert(devisDemandes)
        .values({
          demandeurEntrepriseId: parsedInput.entrepriseId,
          siteId: parsedInput.siteId,
          serviceId: parsedInput.serviceId,
          titre: parsedInput.titre,
          description: parsedInput.description,
          statut: "ouverte",
          createdById: currentUser.id,
          updatedById: currentUser.id,
        })
        .returning();

      if (parsedInput.attachments && parsedInput.attachments.length > 0) {
        for (const attachment of parsedInput.attachments) {
          if (!attachment.storageKey) continue;

          const promotedKey = await promoteS3Key({
            tempKey: attachment.storageKey,
          });

          const [document] = await tx
            .insert(documents)
            .values({
              proprietaireEntrepriseId: parsedInput.entrepriseId,
              categorie: "devis_demande",
              storageProvider: "s3",
              storageKey: promotedKey,
              filename: attachment.filename,
              mimeType: attachment.mimeType,
              sizeBytes: attachment.sizeBytes,
              createdById: currentUser.id,
            })
            .returning();

          await tx.insert(documentsLinks).values({
            documentId: document.id,
            proprietaireEntrepriseId: parsedInput.entrepriseId,
            devisDemandeId: demande.id,
            visibilite: "public",
            createdById: currentUser.id,
            updatedById: currentUser.id,
          });
        }
      }

      return demande;
    });

    return { demande: selectDevisDemandeSchema.parse(inserted) };
  });

// ============================= UPDATE DEMANDE ==============================//

export const updateDevisDemandeAction = actionClient
  .metadata({ actionName: "updateDevisDemandeAction" })
  .inputSchema(
    updateDevisDemandeFormSchema.extend({
      entrepriseId: z.string().min(1),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const owns = await assertDevisDemandeOwnership({
      devisDemandeId: parsedInput.id,
      entrepriseId: parsedInput.entrepriseId,
    });
    if (!owns) throw errors.notFound("Demande introuvable.");

    const perms = await getDevisDemandePermissions({
      userId: currentUser.id,
      devisDemandeId: parsedInput.id,
      entrepriseId: parsedInput.entrepriseId,
    });
    if (!perms.canEdit) {
      throw errors.forbidden(
        "Vous n'avez pas les droits pour modifier cette demande.",
      );
    }

    const { id, entrepriseId: _eid, attachments, ...fields } = parsedInput;
    // description est NOT NULL en DB — pas d'optionalStrings pour éviter "" → null
    const normalized = normalizeForSubmit(fields, {});

    const updated = await db.transaction(async (tx) => {
      const [demande] = await tx
        .update(devisDemandes)
        .set({
          ...(normalized.titre !== undefined && { titre: normalized.titre }),
          ...(normalized.description !== undefined && {
            description: normalized.description,
          }),
          updatedById: currentUser.id,
          updatedAt: new Date(),
        })
        .where(eq(devisDemandes.id, id))
        .returning();

      if (attachments && attachments.length > 0) {
        for (const attachment of attachments) {
          if (!attachment.storageKey) continue;

          // Only promote temp keys (existing documents keep their key)
          const promotedKey = await promoteS3Key({
            tempKey: attachment.storageKey,
          });

          const [document] = await tx
            .insert(documents)
            .values({
              proprietaireEntrepriseId: parsedInput.entrepriseId,
              categorie: "devis_demande",
              storageProvider: "s3",
              storageKey: promotedKey,
              filename: attachment.filename,
              mimeType: attachment.mimeType,
              sizeBytes: attachment.sizeBytes,
              createdById: currentUser.id,
            })
            .returning();

          await tx.insert(documentsLinks).values({
            documentId: document.id,
            proprietaireEntrepriseId: parsedInput.entrepriseId,
            devisDemandeId: demande.id,
            visibilite: "public",
            createdById: currentUser.id,
            updatedById: currentUser.id,
          });
        }
      }

      return demande;
    });

    return { demande: selectDevisDemandeSchema.parse(updated) };
  });

// ============================= DELETE DEMANDE ==============================//

export const deleteDevisDemandeAction = actionClient
  .metadata({ actionName: "deleteDevisDemandeAction" })
  .inputSchema(
    deleteDevisDemandeSchema.extend({
      entrepriseId: z.string().min(1),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const owns = await assertDevisDemandeOwnership({
      devisDemandeId: parsedInput.id,
      entrepriseId: parsedInput.entrepriseId,
    });
    if (!owns) throw errors.notFound("Demande introuvable.");

    const perms = await getDevisDemandePermissions({
      userId: currentUser.id,
      devisDemandeId: parsedInput.id,
      entrepriseId: parsedInput.entrepriseId,
    });
    if (!perms.canDelete) {
      // Distinguer : interdiction droits vs devis lié
      const [linkedDevis] = await db
        .select({ id: devis.id })
        .from(devis)
        .where(eq(devis.devisDemandeId, parsedInput.id))
        .limit(1);

      if (linkedDevis) {
        throw errors.forbidden(
          "Impossible de supprimer : un devis est lié à cette demande. Annulez ou clôturez la demande.",
        );
      }
      throw errors.forbidden(
        "Vous n'avez pas les droits pour supprimer cette demande.",
      );
    }

    await db
      .delete(devisDemandes)
      .where(
        and(
          eq(devisDemandes.id, parsedInput.id),
          eq(devisDemandes.demandeurEntrepriseId, parsedInput.entrepriseId),
        ),
      );

    return { success: true };
  });

// ============================= CHANGE STATUT ==============================//

export const updateDevisDemandeStatutAction = actionClient
  .metadata({ actionName: "updateDevisDemandeStatutAction" })
  .inputSchema(
    updateDevisDemandeStatutSchema.extend({
      entrepriseId: z.string().min(1),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (plateformeRole?.role) {
      throw errors.forbidden(
        "La plateforme ne peut pas modifier le statut d'une demande de devis.",
      );
    }

    const owns = await assertDevisDemandeOwnership({
      devisDemandeId: parsedInput.id,
      entrepriseId: parsedInput.entrepriseId,
    });
    if (!owns) throw errors.notFound("Demande introuvable.");

    const perms = await getDevisDemandePermissions({
      userId: currentUser.id,
      devisDemandeId: parsedInput.id,
      entrepriseId: parsedInput.entrepriseId,
    });
    if (!perms.canChangeStatut) {
      throw errors.forbidden(
        "Vous n'avez pas les droits pour modifier le statut de cette demande.",
      );
    }

    // Vérifier la transition de statut
    const current = await db.query.devisDemandes.findFirst({
      where: eq(devisDemandes.id, parsedInput.id),
      columns: { statut: true },
    });
    if (!current) throw errors.notFound("Demande introuvable.");

    const VALID_TRANSITIONS: Record<string, string[]> = {
      ouverte: ["en_cours", "annulee", "archivee"],
      en_cours: ["cloturee", "annulee", "archivee"],
      annulee: ["archivee"],
      cloturee: [],
      archivee: [],
    };

    const allowed = VALID_TRANSITIONS[current.statut] ?? [];
    if (!allowed.includes(parsedInput.statut)) {
      throw errors.forbidden(
        `Transition "${current.statut}" → "${parsedInput.statut}" non autorisée.`,
      );
    }

    const [updated] = await db
      .update(devisDemandes)
      .set({
        statut: parsedInput.statut,
        updatedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(devisDemandes.id, parsedInput.id))
      .returning();

    return { demande: selectDevisDemandeSchema.parse(updated) };
  });

// ============================= DELETE ATTACHMENT ==============================//

export const deleteDevisDemandeAttachmentAction = actionClient
  .metadata({ actionName: "deleteDevisDemandeAttachmentAction" })
  .inputSchema(
    z.object({
      documentId: z.string().min(1),
      devisDemandeId: z.string().min(1),
      entrepriseId: z.string().min(1),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const owns = await assertDevisDemandeOwnership({
      devisDemandeId: parsedInput.devisDemandeId,
      entrepriseId: parsedInput.entrepriseId,
    });
    if (!owns) throw errors.notFound("Demande introuvable.");

    const perms = await getDevisDemandePermissions({
      userId: currentUser.id,
      devisDemandeId: parsedInput.devisDemandeId,
      entrepriseId: parsedInput.entrepriseId,
    });
    if (!perms.canEdit) {
      throw errors.forbidden(
        "Vous n'avez pas les droits pour supprimer cette pièce jointe.",
      );
    }

    // Supprimer le lien (cascade supprime documentsLinks → documents via ON DELETE CASCADE)
    await db
      .delete(documentsLinks)
      .where(
        and(
          eq(documentsLinks.documentId, parsedInput.documentId),
          eq(documentsLinks.devisDemandeId, parsedInput.devisDemandeId),
        ),
      );

    // Supprimer le document lui-même
    await db
      .delete(documents)
      .where(eq(documents.id, parsedInput.documentId));

    return { success: true };
  });

// ============================= GET ATTACHMENTS ==============================//

export const getDevisDemandeAttachmentsAction = actionClient
  .metadata({ actionName: "getDevisDemandeAttachmentsAction" })
  .inputSchema(z.object({ devisDemandeId: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    // Access check: verify user can view this demande
    const demande = await getDevisDemandeById(parsedInput.devisDemandeId);
    if (!demande) throw errors.notFound("Demande introuvable.");

    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (!plateformeRole?.role) {
      const perms = await getDevisDemandePermissions({
        userId: currentUser.id,
        devisDemandeId: parsedInput.devisDemandeId,
        entrepriseId: demande.demandeurEntrepriseId,
      });
      if (!perms.canView) throw errors.forbidden("Accès refusé.");
    }

    return getDevisDemandeAttachments(parsedInput.devisDemandeId);
  });

// ============================= GET CREATABLE SITES ==============================//
// Pour pré-filtrer les sites dans le formulaire de création

export const getCreatableSitesForDevisDemandeAction = actionClient
  .metadata({ actionName: "getCreatableSitesForDevisDemandeAction" })
  .inputSchema(z.object({ entrepriseId: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const creatableSiteIds = await getCreatableSiteIds({
      userId: currentUser.id,
      entrepriseId: parsedInput.entrepriseId,
    });

    return { creatableSiteIds };
  });
