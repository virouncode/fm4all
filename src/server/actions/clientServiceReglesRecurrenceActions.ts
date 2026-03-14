"use server";

import { db } from "@/db";
import {
  clientServiceQuotasPlanification,
  clientServiceReglesRecurrence,
} from "@/db/schema/services";
import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import { getPrestationById } from "@/server/queries/clientServices.query";
import {
  hasAccessToEntreprise,
  getUserClientAdhesion,
  getUserPrestataireAdhesion,
} from "@/server/queries/userAdhesions.query";
import {
  getActivePosture,
  getEffectivePlateformeRole,
  resolvePostureAwareSiteRole,
} from "@/server/utils/permissions.utils";
import {
  deleteRegleRecurrenceActionSchema,
  getQuotaPlanificationActionSchema,
  getReglesRecurrenceActionSchema,
  insertRegleRecurrenceActionSchema,
  reorderReglesRecurrenceActionSchema,
  selectRegleRecurrenceSchema,
  updateRegleRecurrenceActionSchema,
  upsertQuotaPlanificationActionSchema,
} from "@/zod-schemas/clientServiceReglesRecurrence.schema";
import { and, asc, eq } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";

// ==================== HELPERS ====================

/**
 * Vérifie si l'utilisateur peut gérer les règles de récurrence d'une prestation.
 * - Plateforme → toujours autorisé
 * - Posture client : client_admin OU responsable_site sur le site
 * - Posture prestataire : prestataire_admin OU responsable_site sur le site client
 */
async function canManageRegles(
  userId: string,
  entrepriseId: string,
  siteId: string,
): Promise<boolean> {
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) return true;

  const posture = await getActivePosture();

  if (posture === "client") {
    const clientAdhesion = await getUserClientAdhesion({ userId, entrepriseId });
    if (clientAdhesion?.role === "admin") return true;
  } else if (posture === "prestataire") {
    const prestataireAdhesion = await getUserPrestataireAdhesion({ userId });
    if (prestataireAdhesion?.role === "admin") return true;
  }

  const siteRole = await resolvePostureAwareSiteRole({
    userId,
    siteId,
    entrepriseId,
  });
  return siteRole === "responsable_site";
}

// ==================== GET RÈGLES ====================

export const getReglesRecurrenceByPrestationAction = actionClient
  .metadata({ actionName: "getReglesRecurrenceByPrestationAction" })
  .inputSchema(getReglesRecurrenceActionSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) throw errors.unauthorized();

    const hasAccess = await hasAccessToEntreprise(
      session.user.id,
      parsedInput.entrepriseId,
    );
    if (!hasAccess) throw errors.forbidden("Accès refusé à cette entreprise.");

    const regles = await db
      .select()
      .from(clientServiceReglesRecurrence)
      .where(
        eq(
          clientServiceReglesRecurrence.clientServiceId,
          parsedInput.clientServiceId,
        ),
      )
      .orderBy(
        asc(clientServiceReglesRecurrence.ordre),
        asc(clientServiceReglesRecurrence.createdAt),
      );

    return { regles: regles.map((r) => selectRegleRecurrenceSchema.parse(r)) };
  });

// ==================== INSERT RÈGLE ====================

export const insertRegleRecurrenceAction = actionClient
  .metadata({ actionName: "insertRegleRecurrenceAction" })
  .inputSchema(insertRegleRecurrenceActionSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) throw errors.unauthorized();

    const prestation = await getPrestationById(parsedInput.clientServiceId);
    if (!prestation) throw errors.notFound("Prestation introuvable.");

    if (prestation.entrepriseId !== parsedInput.entrepriseId) {
      throw errors.forbidden(
        "Cette prestation n'appartient pas à l'entreprise spécifiée.",
      );
    }

    const canManage = await canManageRegles(
      session.user.id,
      parsedInput.entrepriseId,
      prestation.siteId,
    );
    if (!canManage) {
      throw errors.forbidden(
        "Vous n'avez pas les droits pour modifier cette prestation.",
      );
    }

    if (prestation.famillePlanification !== "recurrence_auto") {
      throw errors.conflict(
        "Les règles de récurrence ne s'appliquent qu'aux prestations à récurrence automatique.",
      );
    }

    // Calculer le prochain ordre
    const [lastRegle] = await db
      .select({ ordre: clientServiceReglesRecurrence.ordre })
      .from(clientServiceReglesRecurrence)
      .where(
        eq(
          clientServiceReglesRecurrence.clientServiceId,
          parsedInput.clientServiceId,
        ),
      )
      .orderBy(
        asc(clientServiceReglesRecurrence.ordre),
        asc(clientServiceReglesRecurrence.createdAt),
      );

    const nextOrdre =
      parsedInput.ordre != null
        ? Number(parsedInput.ordre)
        : (lastRegle?.ordre ?? -1) + 1;

    const [inserted] = await db
      .insert(clientServiceReglesRecurrence)
      .values({
        clientServiceId: parsedInput.clientServiceId,
        libelle: parsedInput.libelle || null,
        dtstartLocal: new Date(parsedInput.dtstartLocal),
        fuseauHoraire: parsedInput.fuseauHoraire ?? "Europe/Paris",
        regleRrule: parsedInput.regleRrule,
        dureePrevueMinutes:
          parsedInput.dureePrevueMinutes != null &&
          parsedInput.dureePrevueMinutes !== ""
            ? Number(parsedInput.dureePrevueMinutes)
            : null,
        actif: parsedInput.actif ?? true,
        ordre: nextOrdre,
        createdById: session.user.id,
        updatedById: session.user.id,
      })
      .returning();

    return { regle: selectRegleRecurrenceSchema.parse(inserted) };
  });

// ==================== UPDATE RÈGLE ====================

export const updateRegleRecurrenceAction = actionClient
  .metadata({ actionName: "updateRegleRecurrenceAction" })
  .inputSchema(updateRegleRecurrenceActionSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) throw errors.unauthorized();

    // Charger la règle pour avoir le clientServiceId
    const [existing] = await db
      .select()
      .from(clientServiceReglesRecurrence)
      .where(eq(clientServiceReglesRecurrence.id, parsedInput.id))
      .limit(1);

    if (!existing) throw errors.notFound("Règle de récurrence introuvable.");

    const prestation = await getPrestationById(existing.clientServiceId);
    if (!prestation) throw errors.notFound("Prestation introuvable.");

    if (prestation.entrepriseId !== parsedInput.entrepriseId) {
      throw errors.forbidden(
        "Cette prestation n'appartient pas à l'entreprise spécifiée.",
      );
    }

    const canManage = await canManageRegles(
      session.user.id,
      parsedInput.entrepriseId,
      prestation.siteId,
    );
    if (!canManage) {
      throw errors.forbidden(
        "Vous n'avez pas les droits pour modifier cette prestation.",
      );
    }

    const updateFields: Partial<typeof clientServiceReglesRecurrence.$inferInsert> =
      {
        updatedById: session.user.id,
      };

    if (parsedInput.libelle !== undefined)
      updateFields.libelle = parsedInput.libelle || null;
    if (parsedInput.dtstartLocal !== undefined)
      updateFields.dtstartLocal = new Date(parsedInput.dtstartLocal);
    if (parsedInput.fuseauHoraire !== undefined)
      updateFields.fuseauHoraire = parsedInput.fuseauHoraire;
    if (parsedInput.regleRrule !== undefined)
      updateFields.regleRrule = parsedInput.regleRrule;
    if (parsedInput.dureePrevueMinutes !== undefined)
      updateFields.dureePrevueMinutes =
        parsedInput.dureePrevueMinutes !== ""
          ? Number(parsedInput.dureePrevueMinutes)
          : null;
    if (parsedInput.actif !== undefined) updateFields.actif = parsedInput.actif;
    if (parsedInput.ordre !== undefined)
      updateFields.ordre = Number(parsedInput.ordre);

    const [updated] = await db
      .update(clientServiceReglesRecurrence)
      .set(updateFields)
      .where(eq(clientServiceReglesRecurrence.id, parsedInput.id))
      .returning();

    return { regle: selectRegleRecurrenceSchema.parse(updated) };
  });

// ==================== DELETE RÈGLE ====================

export const deleteRegleRecurrenceAction = actionClient
  .metadata({ actionName: "deleteRegleRecurrenceAction" })
  .inputSchema(deleteRegleRecurrenceActionSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) throw errors.unauthorized();

    const [existing] = await db
      .select()
      .from(clientServiceReglesRecurrence)
      .where(eq(clientServiceReglesRecurrence.id, parsedInput.id))
      .limit(1);

    if (!existing) throw errors.notFound("Règle de récurrence introuvable.");

    if (existing.clientServiceId !== parsedInput.clientServiceId) {
      throw errors.forbidden(
        "Cette règle n'appartient pas à la prestation spécifiée.",
      );
    }

    const prestation = await getPrestationById(existing.clientServiceId);
    if (!prestation) throw errors.notFound("Prestation introuvable.");

    if (prestation.entrepriseId !== parsedInput.entrepriseId) {
      throw errors.forbidden(
        "Cette prestation n'appartient pas à l'entreprise spécifiée.",
      );
    }

    const canManage = await canManageRegles(
      session.user.id,
      parsedInput.entrepriseId,
      prestation.siteId,
    );
    if (!canManage) {
      throw errors.forbidden(
        "Vous n'avez pas les droits pour modifier cette prestation.",
      );
    }

    await db
      .delete(clientServiceReglesRecurrence)
      .where(eq(clientServiceReglesRecurrence.id, parsedInput.id));

    return { deletedId: parsedInput.id };
  });

// ==================== RÉORDONNER LES RÈGLES ====================

export const reorderReglesRecurrenceAction = actionClient
  .metadata({ actionName: "reorderReglesRecurrenceAction" })
  .inputSchema(reorderReglesRecurrenceActionSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) throw errors.unauthorized();

    const hasAccess = await hasAccessToEntreprise(
      session.user.id,
      parsedInput.entrepriseId,
    );
    if (!hasAccess) throw errors.forbidden("Accès refusé à cette entreprise.");

    const prestation = await getPrestationById(parsedInput.clientServiceId);
    if (!prestation) throw errors.notFound("Prestation introuvable.");

    if (prestation.entrepriseId !== parsedInput.entrepriseId) {
      throw errors.forbidden(
        "Cette prestation n'appartient pas à l'entreprise spécifiée.",
      );
    }

    const canManage = await canManageRegles(
      session.user.id,
      parsedInput.entrepriseId,
      prestation.siteId,
    );
    if (!canManage) {
      throw errors.forbidden(
        "Vous n'avez pas les droits pour modifier cette prestation.",
      );
    }

    // Mettre à jour l'ordre de chaque règle dans une transaction
    await db.transaction(async (tx) => {
      for (let i = 0; i < parsedInput.orderedIds.length; i++) {
        await tx
          .update(clientServiceReglesRecurrence)
          .set({ ordre: i, updatedById: session.user.id })
          .where(
            and(
              eq(clientServiceReglesRecurrence.id, parsedInput.orderedIds[i]!),
              eq(
                clientServiceReglesRecurrence.clientServiceId,
                parsedInput.clientServiceId,
              ),
            ),
          );
      }
    });

    return { success: true };
  });

// ==================== QUOTA PLANIFICATION ====================

export const getQuotaPlanificationAction = actionClient
  .metadata({ actionName: "getQuotaPlanificationAction" })
  .inputSchema(getQuotaPlanificationActionSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) throw errors.unauthorized();

    const hasAccess = await hasAccessToEntreprise(
      session.user.id,
      parsedInput.entrepriseId,
    );
    if (!hasAccess) throw errors.forbidden("Accès refusé à cette entreprise.");

    const [quota] = await db
      .select()
      .from(clientServiceQuotasPlanification)
      .where(
        eq(
          clientServiceQuotasPlanification.clientServiceId,
          parsedInput.clientServiceId,
        ),
      )
      .limit(1);

    return { quota: quota ?? null };
  });

export const upsertQuotaPlanificationAction = actionClient
  .metadata({ actionName: "upsertQuotaPlanificationAction" })
  .inputSchema(upsertQuotaPlanificationActionSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) throw errors.unauthorized();

    const prestation = await getPrestationById(parsedInput.clientServiceId);
    if (!prestation) throw errors.notFound("Prestation introuvable.");

    if (prestation.entrepriseId !== parsedInput.entrepriseId) {
      throw errors.forbidden(
        "Cette prestation n'appartient pas à l'entreprise spécifiée.",
      );
    }

    const canManage = await canManageRegles(
      session.user.id,
      parsedInput.entrepriseId,
      prestation.siteId,
    );
    if (!canManage) {
      throw errors.forbidden(
        "Vous n'avez pas les droits pour modifier cette prestation.",
      );
    }

    if (prestation.famillePlanification !== "quota_manuel") {
      throw errors.conflict(
        "Les quotas de planification ne s'appliquent qu'aux prestations à planification manuelle.",
      );
    }

    // Calculer dateAncragePeriode
    const modeAncrage = parsedInput.modeAncragePeriode ?? "contrat";
    let dateAncrage: string;

    if (modeAncrage === "contrat" && prestation.dateDebut) {
      dateAncrage = prestation.dateDebut.toISOString().slice(0, 10);
    } else {
      // Mode civil : début de la période courante
      const now = new Date();
      const periode = parsedInput.periodeQuota;
      if (periode === "trimestre") {
        const trimestre = Math.floor(now.getMonth() / 3);
        dateAncrage = `${now.getFullYear()}-${String(trimestre * 3 + 1).padStart(2, "0")}-01`;
      } else if (periode === "semestre") {
        const semestre = now.getMonth() < 6 ? 0 : 1;
        dateAncrage = `${now.getFullYear()}-${semestre === 0 ? "01" : "07"}-01`;
      } else {
        dateAncrage = `${now.getFullYear()}-01-01`;
      }
    }

    const [upserted] = await db
      .insert(clientServiceQuotasPlanification)
      .values({
        clientServiceId: parsedInput.clientServiceId,
        nbOccurrencesParPeriode: Number(parsedInput.nbOccurrencesParPeriode),
        periodeQuota: parsedInput.periodeQuota,
        modeAncragePeriode: modeAncrage,
        dateAncragePeriode: dateAncrage,
        notes: parsedInput.notes || null,
        createdById: session.user.id,
        updatedById: session.user.id,
      })
      .onConflictDoUpdate({
        target: clientServiceQuotasPlanification.clientServiceId,
        set: {
          nbOccurrencesParPeriode: Number(parsedInput.nbOccurrencesParPeriode),
          periodeQuota: parsedInput.periodeQuota,
          modeAncragePeriode: modeAncrage,
          dateAncragePeriode: dateAncrage,
          notes: parsedInput.notes || null,
          updatedById: session.user.id,
        },
      })
      .returning();

    return { quota: upserted };
  });
