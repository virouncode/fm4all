"use server";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { devis, devisLignes, devisNumeroSeq } from "@/db/schema/devis";
import { documents, documentsLinks } from "@/db/schema/documents";
import { sitesArborescence } from "@/db/schema/sites";
import { userClientSiteAttributions } from "@/db/schema/users";
import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import { getDevisById, getDevisPaginated } from "@/server/queries/devis.query";
import { hasAccessToEntreprise } from "@/server/queries/userAdhesions.query";
import { promoteS3Key } from "@/server/s3/s3";
import {
  canUserEditDevis,
  canUserEmettreDevis,
} from "@/server/utils/devisPermissions.utils";
import { getEffectivePlateformeRole } from "@/server/utils/permissions.utils";
import { normalizeForSubmit } from "@/zod-helpers/normalize";
import {
  devisQuerySchema,
  emettreDevisSchema,
  insertDevisLigneSchema,
  insertDevisSchema,
  refuserDevisSchema,
  reorderDevisLignesSchema,
  saveDevisWithLignesSchema,
  signerDevisSchema,
  updateDevisLigneSchema,
  updateDevisSchema,
} from "@/zod-schemas/devis.schema";
import { and, asc, eq, or, sql } from "drizzle-orm";
import { entreprises } from "@/db/schema/entreprises";
import { flattenValidationErrors } from "next-safe-action";
import { z } from "zod";

// ============================= GET DEVIS ==============================//

export const getDevisAction = actionClient
  .metadata({ actionName: "getDevisAction" })
  .inputSchema(devisQuerySchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);

    let scopeCondition = undefined;
    if (!plateformeRole?.role) {
      const { entrepriseId } = parsedInput;
      const adhesion = await hasAccessToEntreprise(
        currentUser.id,
        entrepriseId,
      );
      if (!adhesion) throw errors.forbidden("Accès refusé.");
      scopeCondition = sql`(${devis.emetteurEntrepriseId} = ${entrepriseId} OR ${devis.proprietaireEntrepriseId} = ${entrepriseId})`;
    }

    return getDevisPaginated(
      { ...parsedInput, emetteurId: parsedInput.emetteurId },
      scopeCondition,
    );
  });

export const getDevisEmetteursAction = actionClient
  .metadata({ actionName: "getDevisEmetteursAction" })
  .inputSchema(
    z.object({ entrepriseId: z.uuid() }),
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

    if (!plateformeRole?.role) {
      const hasAccess = await hasAccessToEntreprise(
        currentUser.id,
        parsedInput.entrepriseId,
      );
      if (!hasAccess) throw errors.forbidden("Accès refusé.");
    }

    const rows = await db
      .selectDistinct({ id: entreprises.id, nom: entreprises.nom })
      .from(devis)
      .innerJoin(entreprises, eq(devis.emetteurEntrepriseId, entreprises.id))
      .where(
        plateformeRole?.role
          ? undefined
          : eq(devis.proprietaireEntrepriseId, parsedInput.entrepriseId),
      )
      .orderBy(asc(entreprises.nom));

    return { emetteurs: rows };
  });

export const getDevisDetailAction = actionClient
  .metadata({ actionName: "getDevisDetailAction" })
  .inputSchema(z.object({ devisId: z.uuid() }), {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const devisRow = await getDevisById(parsedInput.devisId);
    if (!devisRow) throw errors.notFound("Devis introuvable.");

    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (!plateformeRole?.role) {
      const [asEmetteur, asProprietaire] = await Promise.all([
        hasAccessToEntreprise(currentUser.id, devisRow.emetteurEntrepriseId),
        hasAccessToEntreprise(
          currentUser.id,
          devisRow.proprietaireEntrepriseId,
        ),
      ]);
      if (!asEmetteur && !asProprietaire)
        throw errors.forbidden("Accès refusé.");
    }

    return { devis: devisRow };
  });

// ============================= CRUD DEVIS ==============================//

export const insertDevisAction = actionClient
  .metadata({ actionName: "insertDevisAction" })
  .inputSchema(insertDevisSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    // La plateforme ne crée pas de devis
    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (plateformeRole?.role)
      throw errors.forbidden(
        "La plateforme ne peut pas créer de devis directement.",
      );

    // L'utilisateur doit être dans l'entreprise émettrice
    const hasAccess = await hasAccessToEntreprise(
      currentUser.id,
      parsedInput.emetteurEntrepriseId,
    );
    if (!hasAccess)
      throw errors.forbidden(
        "Vous ne pouvez pas créer un devis au nom de cette entreprise.",
      );

    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: [
        "devisDemandeId",
        "ticketId",
        "description",
        "noteInterne",
      ] as const,
    });

    const [inserted] = await db
      .insert(devis)
      .values({
        proprietaireEntrepriseId: normalized.proprietaireEntrepriseId,
        emetteurEntrepriseId: normalized.emetteurEntrepriseId,
        demandeurEntrepriseId: normalized.demandeurEntrepriseId,
        siteId: normalized.siteId,
        devisDemandeId: normalized.devisDemandeId,
        ticketId: normalized.ticketId,
        titre: normalized.titre,
        description: normalized.description,
        noteInterne: normalized.noteInterne,
        remiseGlobaleHt: normalized.remiseGlobaleHt ?? 0,
        validTo: normalized.validTo,
        statut: "brouillon",
        createdById: currentUser.id,
        updatedById: currentUser.id,
      })
      .returning();

    return { devis: inserted };
  });

export const updateDevisAction = actionClient
  .metadata({ actionName: "updateDevisAction" })
  .inputSchema(updateDevisSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const canEdit = await canUserEditDevis(currentUser.id, parsedInput.id);
    if (!canEdit)
      throw errors.forbidden(
        "Modification impossible : le devis est émis ou vous n'avez pas les droits.",
      );

    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: [
        "devisDemandeId",
        "ticketId",
        "description",
        "noteInterne",
      ] as const,
    });

    const [updated] = await db
      .update(devis)
      .set({
        ...(normalized.siteId && { siteId: normalized.siteId }),
        ...(normalized.titre && { titre: normalized.titre }),
        description: normalized.description,
        noteInterne: normalized.noteInterne,
        ...(normalized.remiseGlobaleHt !== undefined && {
          remiseGlobaleHt: normalized.remiseGlobaleHt,
        }),
        validTo: normalized.validTo,
        updatedById: currentUser.id,
      })
      .where(eq(devis.id, parsedInput.id))
      .returning();

    return { devis: updated };
  });

export const deleteDevisAction = actionClient
  .metadata({ actionName: "deleteDevisAction" })
  .inputSchema(z.object({ devisId: z.uuid() }), {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const canEdit = await canUserEditDevis(currentUser.id, parsedInput.devisId);
    if (!canEdit)
      throw errors.forbidden(
        "Suppression impossible : le devis est émis ou vous n'avez pas les droits.",
      );

    await db.delete(devis).where(eq(devis.id, parsedInput.devisId));
    return { success: true };
  });

// ============================= LIGNES ==============================//

export const insertDevisLigneAction = actionClient
  .metadata({ actionName: "insertDevisLigneAction" })
  .inputSchema(insertDevisLigneSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const canEdit = await canUserEditDevis(currentUser.id, parsedInput.devisId);
    if (!canEdit) throw errors.forbidden("Modification impossible.");

    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: ["serviceId", "description"] as const,
    });

    const [inserted] = await db
      .insert(devisLignes)
      .values({
        devisId: normalized.devisId,
        serviceId: normalized.serviceId,
        designation: normalized.designation,
        description: normalized.description,
        quantite: normalized.quantite,
        unite: normalized.unite,
        prixUnitaireHt: normalized.prixUnitaireHt,
        tauxTva: normalized.tauxTva ?? 2000,
        remiseHtMontant: normalized.remiseHtMontant ?? 0,
        typePrix: normalized.typePrix,
        ordre: normalized.ordre,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      })
      .returning();

    return { ligne: inserted };
  });

export const updateDevisLigneAction = actionClient
  .metadata({ actionName: "updateDevisLigneAction" })
  .inputSchema(updateDevisLigneSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const ligne = await db.query.devisLignes.findFirst({
      where: eq(devisLignes.id, parsedInput.id),
    });
    if (!ligne) throw errors.notFound("Ligne introuvable.");

    const canEdit = await canUserEditDevis(currentUser.id, ligne.devisId);
    if (!canEdit) throw errors.forbidden("Modification impossible.");

    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: ["serviceId", "description"] as const,
    });

    const [updated] = await db
      .update(devisLignes)
      .set({
        ...(normalized.serviceId !== undefined && {
          serviceId: normalized.serviceId,
        }),
        ...(normalized.designation && { designation: normalized.designation }),
        description: normalized.description,
        ...(normalized.quantite && { quantite: normalized.quantite }),
        ...(normalized.unite && { unite: normalized.unite }),
        ...(normalized.prixUnitaireHt !== undefined && {
          prixUnitaireHt: normalized.prixUnitaireHt,
        }),
        ...(normalized.tauxTva !== undefined && {
          tauxTva: normalized.tauxTva,
        }),
        ...(normalized.remiseHtMontant !== undefined && {
          remiseHtMontant: normalized.remiseHtMontant,
        }),
        ...(normalized.typePrix && { typePrix: normalized.typePrix }),
        ...(normalized.ordre !== undefined && { ordre: normalized.ordre }),
        updatedById: currentUser.id,
      })
      .where(eq(devisLignes.id, parsedInput.id))
      .returning();

    return { ligne: updated };
  });

export const deleteDevisLigneAction = actionClient
  .metadata({ actionName: "deleteDevisLigneAction" })
  .inputSchema(z.object({ ligneId: z.uuid() }), {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const ligne = await db.query.devisLignes.findFirst({
      where: eq(devisLignes.id, parsedInput.ligneId),
    });
    if (!ligne) throw errors.notFound("Ligne introuvable.");

    const canEdit = await canUserEditDevis(currentUser.id, ligne.devisId);
    if (!canEdit) throw errors.forbidden("Modification impossible.");

    await db.delete(devisLignes).where(eq(devisLignes.id, parsedInput.ligneId));
    return { success: true };
  });

export const reorderDevisLignesAction = actionClient
  .metadata({ actionName: "reorderDevisLignesAction" })
  .inputSchema(reorderDevisLignesSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const canEdit = await canUserEditDevis(currentUser.id, parsedInput.devisId);
    if (!canEdit) throw errors.forbidden("Modification impossible.");

    await db.transaction(async (tx) => {
      for (let i = 0; i < parsedInput.orderedIds.length; i++) {
        await tx
          .update(devisLignes)
          .set({ ordre: i, updatedById: currentUser.id })
          .where(
            and(
              eq(devisLignes.id, parsedInput.orderedIds[i]),
              eq(devisLignes.devisId, parsedInput.devisId),
            ),
          );
      }
    });

    return { success: true };
  });

// ============================= SAVE COMBINED ==============================//

export const saveDevisWithLignesAction = actionClient
  .metadata({ actionName: "saveDevisWithLignesAction" })
  .inputSchema(saveDevisWithLignesSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (plateformeRole?.role)
      throw errors.forbidden(
        "La plateforme ne peut pas créer ou modifier de devis.",
      );

    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: [
        "id",
        "devisDemandeId",
        "ticketId",
        "description",
        "noteInterne",
      ] as const,
    });

    const savedDevis = await db.transaction(async (tx) => {
      if (normalized.id) {
        // UPDATE — vérifier permission
        const existing = await tx.query.devis.findFirst({
          where: eq(devis.id, normalized.id),
        });
        if (!existing) throw errors.notFound("Devis introuvable.");
        if (existing.statut !== "brouillon")
          throw errors.conflict("Le devis n'est plus modifiable.");

        const hasAccess = await hasAccessToEntreprise(
          currentUser.id,
          existing.emetteurEntrepriseId,
        );
        if (!hasAccess) throw errors.forbidden("Accès refusé.");

        const [updated] = await tx
          .update(devis)
          .set({
            siteId: normalized.siteId,
            titre: normalized.titre,
            description: normalized.description,
            noteInterne: normalized.noteInterne,
            remiseGlobaleHt: normalized.remiseGlobaleHt ?? 0,
            validTo: normalized.validTo,
            updatedById: currentUser.id,
          })
          .where(eq(devis.id, normalized.id))
          .returning();

        // Remplacer toutes les lignes
        await tx
          .delete(devisLignes)
          .where(eq(devisLignes.devisId, normalized.id));
        if (parsedInput.lignes.length > 0) {
          await tx.insert(devisLignes).values(
            parsedInput.lignes.map((l) => ({
              devisId: normalized.id!,
              serviceId: l.serviceId || null,
              designation: l.designation,
              description: l.description || null,
              quantite: l.quantite,
              unite: l.unite,
              prixUnitaireHt: l.prixUnitaireHt,
              tauxTva: l.tauxTva,
              remiseHtMontant: l.remiseHtMontant,
              typePrix: l.typePrix,
              periodeFacturation: l.periodeFacturation || null,
              ordre: l.ordre,
              createdById: currentUser.id,
              updatedById: currentUser.id,
            })),
          );
        }

        return updated;
      } else {
        // CREATE
        const hasAccess = await hasAccessToEntreprise(
          currentUser.id,
          parsedInput.emetteurEntrepriseId,
        );
        if (!hasAccess)
          throw errors.forbidden(
            "Vous ne pouvez pas créer un devis au nom de cette entreprise.",
          );

        const [inserted] = await tx
          .insert(devis)
          .values({
            proprietaireEntrepriseId: normalized.proprietaireEntrepriseId,
            emetteurEntrepriseId: normalized.emetteurEntrepriseId,
            demandeurEntrepriseId: normalized.demandeurEntrepriseId,
            siteId: normalized.siteId,
            devisDemandeId: normalized.devisDemandeId,
            ticketId: normalized.ticketId,
            titre: normalized.titre,
            description: normalized.description,
            noteInterne: normalized.noteInterne,
            dateEmission: normalized.dateEmission,
            remiseGlobaleHt: normalized.remiseGlobaleHt ?? 0,
            validTo: normalized.validTo,
            statut: "brouillon",
            createdById: currentUser.id,
            updatedById: currentUser.id,
          })
          .returning();

        if (parsedInput.lignes.length > 0) {
          await tx.insert(devisLignes).values(
            parsedInput.lignes.map((l) => ({
              devisId: inserted.id,
              serviceId: l.serviceId || null,
              designation: l.designation,
              description: l.description || null,
              quantite: l.quantite,
              unite: l.unite,
              prixUnitaireHt: l.prixUnitaireHt,
              tauxTva: l.tauxTva,
              remiseHtMontant: l.remiseHtMontant,
              typePrix: l.typePrix,
              periodeFacturation: l.periodeFacturation || null,
              ordre: l.ordre,
              createdById: currentUser.id,
              updatedById: currentUser.id,
            })),
          );
        }

        return inserted;
      }
    });

    return { devis: savedDevis };
  });

// ============================= TRANSITIONS ==============================//

export const emettreDevisAction = actionClient
  .metadata({ actionName: "emettreDevisAction" })
  .inputSchema(emettreDevisSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const canEmettre = await canUserEmettreDevis(
      currentUser.id,
      parsedInput.devisId,
    );
    if (!canEmettre)
      throw errors.forbidden("Vous ne pouvez pas émettre ce devis.");

    const updated = await db.transaction(async (tx) => {
      // Générer le numéro unique via la séquence PostgreSQL
      const seqResult = await tx.execute(
        sql`SELECT nextval(${devisNumeroSeq.seqName}::regclass) AS seq`,
      );
      const seq = Number(seqResult.rows[0].seq);
      const year = new Date().getFullYear();
      const numero = `D-${year}-${String(seq).padStart(6, "0")}`;

      const [row] = await tx
        .update(devis)
        .set({
          statut: "emis",
          numero,
          dateEmission: new Date(),
          updatedById: currentUser.id,
        })
        .where(
          and(
            eq(devis.id, parsedInput.devisId),
            eq(devis.statut, "brouillon"), // garde-fou
          ),
        )
        .returning();

      return row;
    });

    if (!updated) throw errors.conflict("Le devis n'est plus en brouillon.");
    return { devis: updated };
  });

export const signerDevisAction = actionClient
  .metadata({ actionName: "signerDevisAction" })
  .inputSchema(signerDevisSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const devisRow = await db.query.devis.findFirst({
      where: eq(devis.id, parsedInput.devisId),
    });
    if (!devisRow) throw errors.notFound("Devis introuvable.");
    if (devisRow.statut !== "emis")
      throw errors.conflict("Le devis n'est pas émis.");

    const hasAccess = await hasAccessToEntreprise(
      currentUser.id,
      devisRow.proprietaireEntrepriseId,
    );
    if (!hasAccess) throw errors.forbidden("Accès refusé.");

    const [updated] = await db
      .update(devis)
      .set({ statut: "signe", updatedById: currentUser.id })
      .where(and(eq(devis.id, parsedInput.devisId), eq(devis.statut, "emis")))
      .returning();

    if (!updated) throw errors.conflict("Le devis n'est plus refusé.");
    return { devis: updated };
  });

// ============================= SAVE PDF ==============================//

export const saveDevisPdfAction = actionClient
  .metadata({ actionName: "saveDevisPdfAction" })
  .inputSchema(
    z.object({
      devisId: z.uuid(),
      tempKey: z.string().min(1),
      filename: z.string().min(1),
      sizeBytes: z.number().int().min(0),
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

    const devisRow = await db.query.devis.findFirst({
      where: eq(devis.id, parsedInput.devisId),
    });
    if (!devisRow) throw errors.notFound("Devis introuvable.");

    const [asEmetteur, asProprietaire] = await Promise.all([
      hasAccessToEntreprise(currentUser.id, devisRow.emetteurEntrepriseId),
      hasAccessToEntreprise(currentUser.id, devisRow.proprietaireEntrepriseId),
    ]);
    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (!plateformeRole?.role && !asEmetteur && !asProprietaire) {
      throw errors.forbidden("Accès refusé.");
    }

    const storageKey = await promoteS3Key({ tempKey: parsedInput.tempKey });

    const result = await db.transaction(async (tx) => {
      const [doc] = await tx
        .insert(documents)
        .values({
          proprietaireEntrepriseId: devisRow.emetteurEntrepriseId,
          categorie: "devis",
          titre: parsedInput.filename,
          storageProvider: "s3",
          storageKey,
          filename: parsedInput.filename,
          mimeType: "application/pdf",
          sizeBytes: parsedInput.sizeBytes,
          createdById: currentUser.id,
        })
        .returning();

      await tx.insert(documentsLinks).values({
        documentId: doc.id,
        proprietaireEntrepriseId: devisRow.emetteurEntrepriseId,
        devisId: parsedInput.devisId,
        visibilite: "public",
        createdById: currentUser.id,
        updatedById: currentUser.id,
      });

      return { storageKey };
    });

    return result;
  });

export const refuserDevisAction = actionClient
  .metadata({ actionName: "refuserDevisAction" })
  .inputSchema(refuserDevisSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const devisRow = await db.query.devis.findFirst({
      where: eq(devis.id, parsedInput.devisId),
    });
    if (!devisRow) throw errors.notFound("Devis introuvable.");
    if (devisRow.statut !== "emis")
      throw errors.conflict("Le devis n'est pas émis.");

    const hasAccess = await hasAccessToEntreprise(
      currentUser.id,
      devisRow.proprietaireEntrepriseId,
    );
    if (!hasAccess) throw errors.forbidden("Accès refusé.");

    const [updated] = await db
      .update(devis)
      .set({ statut: "refuse", updatedById: currentUser.id })
      .where(and(eq(devis.id, parsedInput.devisId), eq(devis.statut, "emis")))
      .returning();

    if (!updated) throw errors.conflict("Le devis n'est plus émis.");
    return { devis: updated };
  });

// ============================= GET RESPONSABLE SITE ==============================//

export const getSiteResponsableAction = actionClient
  .metadata({ actionName: "getSiteResponsableAction" })
  .inputSchema(
    z.object({
      siteId: z.uuid(),
      entrepriseId: z.uuid(),
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

    const rows = await db
      .select({
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        phone: user.phone,
      })
      .from(userClientSiteAttributions)
      .innerJoin(user, eq(userClientSiteAttributions.userId, user.id))
      .innerJoin(
        sitesArborescence,
        and(
          eq(sitesArborescence.ancetreId, userClientSiteAttributions.siteId),
          eq(sitesArborescence.descendantId, parsedInput.siteId),
          eq(sitesArborescence.entrepriseId, parsedInput.entrepriseId),
        ),
      )
      .where(
        and(
          eq(userClientSiteAttributions.entrepriseId, parsedInput.entrepriseId),
          eq(userClientSiteAttributions.role, "responsable_site"),
          or(
            eq(sitesArborescence.profondeur, 0),
            eq(userClientSiteAttributions.scope, "subtree"),
          ),
        ),
      )
      .orderBy(asc(sitesArborescence.profondeur))
      .limit(1);

    return { responsable: rows[0] ?? null };
  });
