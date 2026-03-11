"use server";

import { db } from "@/db";
import { factureLignes, factureNumeroSeq, factures } from "@/db/schema/factures";
import { documents, documentsLinks } from "@/db/schema/documents";
import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import { getFactureById, getFacturesPaginated } from "@/server/queries/factures.query";
import { hasAccessToEntreprise } from "@/server/queries/userAdhesions.query";
import { promoteS3Key } from "@/server/s3/s3";
import {
  canUserAnnulerFacture,
  canUserEditFacture,
  canUserEmettreFacture,
} from "@/server/utils/facturesPermissions.utils";
import {
  getActivePosture,
  getEffectivePlateformeRole,
} from "@/server/utils/permissions.utils";
import { normalizeForSubmit } from "@/zod-helpers/normalize";
import {
  annulerFactureSchema,
  emettreFactureSchema,
  factureQuerySchema,
  insertFactureLigneSchema,
  insertFactureSchema,
  reorderFactureLignesSchema,
  saveFactureWithLignesSchema,
  updateFactureLigneSchema,
  updateFactureSchema,
} from "@/zod-schemas/factures.schema";
import { SQL, and, asc, eq, sql } from "drizzle-orm";
import { entreprises } from "@/db/schema/entreprises";
import { flattenValidationErrors } from "next-safe-action";
import { z } from "zod";

// ============================= GET FACTURES ==============================//

export const getFacturesAction = actionClient
  .metadata({ actionName: "getFacturesAction" })
  .inputSchema(factureQuerySchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);

    let scopeCondition: SQL | undefined = undefined;
    if (!plateformeRole?.role) {
      const { entrepriseId } = parsedInput;
      const adhesion = await hasAccessToEntreprise(currentUser.id, entrepriseId);
      if (!adhesion) throw errors.forbidden("Accès refusé.");

      const posture = await getActivePosture();
      const { tabType } = parsedInput;

      if (posture === "prestataire") {
        if (tabType === "emises") {
          // Prestataire : factures qu'il a émises (brouillon + emise + annulee)
          scopeCondition = eq(factures.emetteurEntrepriseId, entrepriseId);
        } else {
          // Prestataire : factures reçues (emise uniquement, dont il est le destinataire)
          scopeCondition = and(
            eq(factures.destinataireEntrepriseId, entrepriseId),
            eq(factures.statut, "emise"),
          );
        }
      } else {
        // Client : toujours les factures reçues (emise uniquement)
        scopeCondition = and(
          eq(factures.destinataireEntrepriseId, entrepriseId),
          eq(factures.statut, "emise"),
        );
      }
    }

    // Plateforme : "recues" = toutes les factures emise (vue destinataires)
    if (plateformeRole?.role && parsedInput.tabType === "recues") {
      scopeCondition = eq(factures.statut, "emise");
    }

    return getFacturesPaginated(parsedInput, scopeCondition);
  });

export const getFactureEmetteursAction = actionClient
  .metadata({ actionName: "getFactureEmetteursAction" })
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

    const emetteur = db
      .select({ id: entreprises.id, nom: entreprises.nom })
      .from(factures)
      .innerJoin(entreprises, eq(factures.emetteurEntrepriseId, entreprises.id))
      .where(
        plateformeRole?.role
          ? undefined
          : eq(factures.destinataireEntrepriseId, parsedInput.entrepriseId),
      )
      .groupBy(entreprises.id, entreprises.nom)
      .orderBy(asc(entreprises.nom));

    return { emetteurs: await emetteur };
  });

export const getFactureDetailAction = actionClient
  .metadata({ actionName: "getFactureDetailAction" })
  .inputSchema(z.object({ factureId: z.uuid() }), {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const factureRow = await getFactureById(parsedInput.factureId);
    if (!factureRow) throw errors.notFound("Facture introuvable.");

    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (!plateformeRole?.role) {
      const [asEmetteur, asDestinataire] = await Promise.all([
        hasAccessToEntreprise(currentUser.id, factureRow.emetteurEntrepriseId),
        hasAccessToEntreprise(currentUser.id, factureRow.destinataireEntrepriseId),
      ]);
      if (!asEmetteur && !asDestinataire)
        throw errors.forbidden("Accès refusé.");
    }

    return { facture: factureRow };
  });

// ============================= CRUD FACTURE ==============================//

export const insertFactureAction = actionClient
  .metadata({ actionName: "insertFactureAction" })
  .inputSchema(insertFactureSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const hasAccess = await hasAccessToEntreprise(
      currentUser.id,
      parsedInput.emetteurEntrepriseId,
    );
    if (!hasAccess)
      throw errors.forbidden(
        "Vous ne pouvez pas créer une facture au nom de cette entreprise.",
      );

    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: [
        "clientServiceId",
        "ticketId",
        "siteId",
        "description",
        "noteInterne",
        "notesClient",
        "periodeDebut",
        "periodeFin",
      ] as const,
    });

    const [inserted] = await db
      .insert(factures)
      .values({
        emetteurEntrepriseId: normalized.emetteurEntrepriseId,
        destinataireEntrepriseId: normalized.destinataireEntrepriseId,
        proprietaireEntrepriseId: normalized.proprietaireEntrepriseId,
        clientServiceId: normalized.clientServiceId,
        ticketId: normalized.ticketId,
        siteId: normalized.siteId,
        titre: normalized.titre,
        description: normalized.description,
        noteInterne: normalized.noteInterne,
        notesClient: normalized.notesClient,
        dateEcheance: normalized.dateEcheance,
        periodeDebut: normalized.periodeDebut,
        periodeFin: normalized.periodeFin,
        remiseGlobaleHt: normalized.remiseGlobaleHt ?? 0,
        genereeParOutil: normalized.genereeParOutil ?? false,
        modeCommercialSnapshot: normalized.modeCommercialSnapshot ?? "direct",
        statut: "brouillon",
        createdById: currentUser.id,
        updatedById: currentUser.id,
      })
      .returning();

    return { facture: inserted };
  });

export const updateFactureAction = actionClient
  .metadata({ actionName: "updateFactureAction" })
  .inputSchema(updateFactureSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const canEdit = await canUserEditFacture(currentUser.id, parsedInput.id);
    if (!canEdit)
      throw errors.forbidden(
        "Modification impossible : la facture est émise ou vous n'avez pas les droits.",
      );

    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: [
        "clientServiceId",
        "ticketId",
        "siteId",
        "description",
        "noteInterne",
        "notesClient",
        "periodeDebut",
        "periodeFin",
      ] as const,
    });

    const [updated] = await db
      .update(factures)
      .set({
        ...(normalized.siteId !== undefined && { siteId: normalized.siteId }),
        ...(normalized.titre && { titre: normalized.titre }),
        description: normalized.description,
        noteInterne: normalized.noteInterne,
        notesClient: normalized.notesClient,
        ...(normalized.dateEcheance !== undefined && {
          dateEcheance: normalized.dateEcheance,
        }),
        periodeDebut: normalized.periodeDebut,
        periodeFin: normalized.periodeFin,
        ...(normalized.remiseGlobaleHt !== undefined && {
          remiseGlobaleHt: normalized.remiseGlobaleHt,
        }),
        updatedById: currentUser.id,
      })
      .where(eq(factures.id, parsedInput.id))
      .returning();

    return { facture: updated };
  });

export const deleteFactureAction = actionClient
  .metadata({ actionName: "deleteFactureAction" })
  .inputSchema(z.object({ factureId: z.uuid() }), {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const canEdit = await canUserEditFacture(currentUser.id, parsedInput.factureId);
    if (!canEdit)
      throw errors.forbidden(
        "Suppression impossible : la facture est émise ou vous n'avez pas les droits.",
      );

    await db.delete(factures).where(eq(factures.id, parsedInput.factureId));
    return { success: true };
  });

// ============================= LIGNES ==============================//

export const insertFactureLigneAction = actionClient
  .metadata({ actionName: "insertFactureLigneAction" })
  .inputSchema(insertFactureLigneSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const canEdit = await canUserEditFacture(currentUser.id, parsedInput.factureId);
    if (!canEdit) throw errors.forbidden("Modification impossible.");

    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: ["serviceId", "description"] as const,
    });

    const [inserted] = await db
      .insert(factureLignes)
      .values({
        factureId: normalized.factureId,
        serviceId: normalized.serviceId,
        designation: normalized.designation,
        description: normalized.description,
        quantite: normalized.quantite,
        unite: normalized.unite,
        prixUnitaireHt: normalized.prixUnitaireHt,
        tauxTva: normalized.tauxTva,
        remiseHtMontant: normalized.remiseHtMontant ?? 0,
        typeSource: normalized.typeSource ?? "manuel",
        ordre: normalized.ordre,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      })
      .returning();

    return { ligne: inserted };
  });

export const updateFactureLigneAction = actionClient
  .metadata({ actionName: "updateFactureLigneAction" })
  .inputSchema(updateFactureLigneSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const ligne = await db.query.factureLignes.findFirst({
      where: eq(factureLignes.id, parsedInput.id),
    });
    if (!ligne) throw errors.notFound("Ligne introuvable.");

    const canEdit = await canUserEditFacture(currentUser.id, ligne.factureId);
    if (!canEdit) throw errors.forbidden("Modification impossible.");

    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: ["serviceId", "description"] as const,
    });

    const [updated] = await db
      .update(factureLignes)
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
        ...(normalized.ordre !== undefined && { ordre: normalized.ordre }),
        updatedById: currentUser.id,
      })
      .where(eq(factureLignes.id, parsedInput.id))
      .returning();

    return { ligne: updated };
  });

export const deleteFactureLigneAction = actionClient
  .metadata({ actionName: "deleteFactureLigneAction" })
  .inputSchema(z.object({ ligneId: z.uuid() }), {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const ligne = await db.query.factureLignes.findFirst({
      where: eq(factureLignes.id, parsedInput.ligneId),
    });
    if (!ligne) throw errors.notFound("Ligne introuvable.");

    const canEdit = await canUserEditFacture(currentUser.id, ligne.factureId);
    if (!canEdit) throw errors.forbidden("Modification impossible.");

    await db.delete(factureLignes).where(eq(factureLignes.id, parsedInput.ligneId));
    return { success: true };
  });

export const reorderFactureLignesAction = actionClient
  .metadata({ actionName: "reorderFactureLignesAction" })
  .inputSchema(reorderFactureLignesSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const canEdit = await canUserEditFacture(currentUser.id, parsedInput.factureId);
    if (!canEdit) throw errors.forbidden("Modification impossible.");

    await db.transaction(async (tx) => {
      for (let i = 0; i < parsedInput.orderedIds.length; i++) {
        await tx
          .update(factureLignes)
          .set({ ordre: i, updatedById: currentUser.id })
          .where(
            and(
              eq(factureLignes.id, parsedInput.orderedIds[i]),
              eq(factureLignes.factureId, parsedInput.factureId),
            ),
          );
      }
    });

    return { success: true };
  });

// ============================= SAVE COMBINED ==============================//

export const saveFactureWithLignesAction = actionClient
  .metadata({ actionName: "saveFactureWithLignesAction" })
  .inputSchema(saveFactureWithLignesSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: [
        "id",
        "clientServiceId",
        "ticketId",
        "siteId",
        "description",
        "noteInterne",
        "notesClient",
        "periodeDebut",
        "periodeFin",
      ] as const,
    });

    const savedFacture = await db.transaction(async (tx) => {
      if (normalized.id) {
        // UPDATE — vérifier permission
        const existing = await tx.query.factures.findFirst({
          where: eq(factures.id, normalized.id),
        });
        if (!existing) throw errors.notFound("Facture introuvable.");
        if (existing.statut !== "brouillon")
          throw errors.conflict("La facture n'est plus modifiable.");

        const hasAccess = await hasAccessToEntreprise(
          currentUser.id,
          existing.emetteurEntrepriseId,
        );
        if (!hasAccess) throw errors.forbidden("Accès refusé.");

        const [updated] = await tx
          .update(factures)
          .set({
            siteId: normalized.siteId,
            titre: normalized.titre,
            description: normalized.description,
            noteInterne: normalized.noteInterne,
            notesClient: normalized.notesClient,
            dateEcheance: normalized.dateEcheance,
            periodeDebut: normalized.periodeDebut,
            periodeFin: normalized.periodeFin,
            remiseGlobaleHt: normalized.remiseGlobaleHt ?? 0,
            updatedById: currentUser.id,
          })
          .where(eq(factures.id, normalized.id))
          .returning();

        // Remplacer toutes les lignes
        await tx.delete(factureLignes).where(eq(factureLignes.factureId, normalized.id));
        if (parsedInput.lignes.length > 0) {
          await tx.insert(factureLignes).values(
            parsedInput.lignes.map((l) => ({
              factureId: normalized.id!,
              serviceId: l.serviceId || null,
              designation: l.designation,
              description: l.description || null,
              quantite: l.quantite,
              unite: l.unite,
              prixUnitaireHt: l.prixUnitaireHt,
              tauxTva: l.tauxTva,
              remiseHtMontant: l.remiseHtMontant,
              typeSource: l.typeSource ?? "manuel",
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
            "Vous ne pouvez pas créer une facture au nom de cette entreprise.",
          );

        const [inserted] = await tx
          .insert(factures)
          .values({
            emetteurEntrepriseId: normalized.emetteurEntrepriseId,
            destinataireEntrepriseId: normalized.destinataireEntrepriseId,
            proprietaireEntrepriseId: normalized.proprietaireEntrepriseId,
            clientServiceId: normalized.clientServiceId,
            ticketId: normalized.ticketId,
            siteId: normalized.siteId,
            titre: normalized.titre,
            description: normalized.description,
            noteInterne: normalized.noteInterne,
            notesClient: normalized.notesClient,
            dateEcheance: normalized.dateEcheance,
            periodeDebut: normalized.periodeDebut,
            periodeFin: normalized.periodeFin,
            remiseGlobaleHt: normalized.remiseGlobaleHt ?? 0,
            modeCommercialSnapshot:
              parsedInput.modeCommercialSnapshot ?? "direct",
            statut: "brouillon",
            createdById: currentUser.id,
            updatedById: currentUser.id,
          })
          .returning();

        if (parsedInput.lignes.length > 0) {
          await tx.insert(factureLignes).values(
            parsedInput.lignes.map((l) => ({
              factureId: inserted.id,
              serviceId: l.serviceId || null,
              designation: l.designation,
              description: l.description || null,
              quantite: l.quantite,
              unite: l.unite,
              prixUnitaireHt: l.prixUnitaireHt,
              tauxTva: l.tauxTva,
              remiseHtMontant: l.remiseHtMontant,
              typeSource: l.typeSource ?? "manuel",
              ordre: l.ordre,
              createdById: currentUser.id,
              updatedById: currentUser.id,
            })),
          );
        }

        return inserted;
      }
    });

    return { facture: savedFacture };
  });

// ============================= TRANSITIONS ==============================//

export const emettreFactureAction = actionClient
  .metadata({ actionName: "emettreFactureAction" })
  .inputSchema(emettreFactureSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const canEmettre = await canUserEmettreFacture(
      currentUser.id,
      parsedInput.factureId,
    );
    if (!canEmettre)
      throw errors.forbidden("Vous ne pouvez pas émettre cette facture.");

    const updated = await db.transaction(async (tx) => {
      // Récupérer toutes les lignes pour calculer les totaux
      const lignesRows = await tx
        .select()
        .from(factureLignes)
        .where(eq(factureLignes.factureId, parsedInput.factureId))
        .orderBy(asc(factureLignes.ordre));

      if (lignesRows.length === 0)
        throw errors.conflict("La facture doit contenir au moins une ligne.");

      const factureRow = await tx.query.factures.findFirst({
        where: eq(factures.id, parsedInput.factureId),
      });
      if (!factureRow) throw errors.notFound("Facture introuvable.");

      // Calculer les montants par ligne et figer
      let totalHtLignes = 0;
      let totalTvaLignes = 0;
      let totalTtcLignes = 0;

      for (const ligne of lignesRows) {
        const montantHtLigne =
          Math.round(parseFloat(ligne.quantite) * ligne.prixUnitaireHt) -
          ligne.remiseHtMontant;
        const montantTvaLigne = Math.round(
          (montantHtLigne * ligne.tauxTva) / 10000,
        );
        const montantTtcLigne = montantHtLigne + montantTvaLigne;

        totalHtLignes += montantHtLigne;
        totalTvaLignes += montantTvaLigne;
        totalTtcLignes += montantTtcLigne;

        // Figer les montants sur la ligne
        await tx
          .update(factureLignes)
          .set({
            montantHt: montantHtLigne,
            montantTva: montantTvaLigne,
            montantTtc: montantTtcLigne,
            updatedById: currentUser.id,
          })
          .where(eq(factureLignes.id, ligne.id));
      }

      // Appliquer la remise globale HT sur le total HT
      const remiseGlobale = factureRow.remiseGlobaleHt ?? 0;
      const montantHtFinal = totalHtLignes - remiseGlobale;
      const montantTtcFinal = montantHtFinal + totalTvaLignes;

      // Générer le numéro unique via la séquence PostgreSQL
      const seqResult = await tx.execute(
        sql`SELECT nextval(${factureNumeroSeq.seqName}::regclass) AS seq`,
      );
      const seq = Number(seqResult.rows[0].seq);
      const year = new Date().getFullYear();
      const numero = `F-${year}-${String(seq).padStart(6, "0")}`;

      const [row] = await tx
        .update(factures)
        .set({
          statut: "emise",
          numero,
          dateEmission: new Date(),
          montantHt: montantHtFinal,
          montantTva: totalTvaLignes,
          montantTtc: montantTtcFinal,
          updatedById: currentUser.id,
        })
        .where(
          and(
            eq(factures.id, parsedInput.factureId),
            eq(factures.statut, "brouillon"), // garde-fou
          ),
        )
        .returning();

      return row;
    });

    if (!updated) throw errors.conflict("La facture n'est plus en brouillon.");
    return { facture: updated };
  });

export const annulerFactureAction = actionClient
  .metadata({ actionName: "annulerFactureAction" })
  .inputSchema(annulerFactureSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const canAnnuler = await canUserAnnulerFacture(
      currentUser.id,
      parsedInput.factureId,
    );
    if (!canAnnuler)
      throw errors.forbidden("Vous ne pouvez pas annuler cette facture.");

    const [updated] = await db
      .update(factures)
      .set({ statut: "annulee", updatedById: currentUser.id })
      .where(
        and(
          eq(factures.id, parsedInput.factureId),
          eq(factures.statut, "emise"),
        ),
      )
      .returning();

    if (!updated) throw errors.conflict("La facture n'est plus émise.");
    return { facture: updated };
  });

// ============================= SAVE PDF ==============================//

export const saveFacturePdfAction = actionClient
  .metadata({ actionName: "saveFacturePdfAction" })
  .inputSchema(
    z.object({
      factureId: z.uuid(),
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

    const factureRow = await db.query.factures.findFirst({
      where: eq(factures.id, parsedInput.factureId),
    });
    if (!factureRow) throw errors.notFound("Facture introuvable.");

    // Vérifier accès à la facture (emetteur ou destinataire)
    const [asEmetteur, asDestinataire] = await Promise.all([
      hasAccessToEntreprise(currentUser.id, factureRow.emetteurEntrepriseId),
      hasAccessToEntreprise(currentUser.id, factureRow.destinataireEntrepriseId),
    ]);
    if (!asEmetteur && !asDestinataire)
      throw errors.forbidden("Accès refusé.");

    const storageKey = await promoteS3Key({ tempKey: parsedInput.tempKey });

    const result = await db.transaction(async (tx) => {
      const [doc] = await tx
        .insert(documents)
        .values({
          proprietaireEntrepriseId: factureRow.emetteurEntrepriseId,
          categorie: "facture",
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
        proprietaireEntrepriseId: factureRow.emetteurEntrepriseId,
        factureId: parsedInput.factureId,
        visibilite: "public",
        createdById: currentUser.id,
        updatedById: currentUser.id,
      });

      return { storageKey };
    });

    return result;
  });
