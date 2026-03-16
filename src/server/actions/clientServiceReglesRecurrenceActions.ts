"use server";

import { db } from "@/db";
import {
  clientServiceExceptionsRecurrence,
  clientServiceOccurrences,
  clientServiceQuotasPlanification,
  clientServiceReglesRecurrence,
  tacheListeItems,
  tacheListesTemplates,
} from "@/db/schema/services";
import { onClientServiceChanged } from "@/server/utils/clientServiceOccurrences.utils";
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
  updateRegleTacheListeSchema,
  upsertQuotaPlanificationActionSchema,
} from "@/zod-schemas/clientServiceReglesRecurrence.schema";
import {
  createExceptionDeplaceeSchema,
  createExceptionSupprimeeSchema,
} from "@/zod-schemas/clientServiceExceptions.schema";
import {
  deleteFuturePlanifieeOccurrences,
} from "@/server/utils/clientServiceOccurrences.utils";
import { and, asc, eq, gte, inArray } from "drizzle-orm";
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

    const regleRows = await db
      .select({
        regle: clientServiceReglesRecurrence,
        tacheListeTemplateName: tacheListesTemplates.nom,
      })
      .from(clientServiceReglesRecurrence)
      .leftJoin(
        tacheListesTemplates,
        eq(tacheListesTemplates.id, clientServiceReglesRecurrence.tacheListeTemplateId),
      )
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

    // Fetch checklist items for all unique template IDs
    const templateIds = [
      ...new Set(
        regleRows
          .map((r) => r.regle.tacheListeTemplateId)
          .filter((id): id is string => id !== null),
      ),
    ];
    const itemsByTemplate = new Map<string, { id: string; ordre: number; titre: string; dureeEstimeeMinutes: number | null }[]>();
    if (templateIds.length > 0) {
      const itemRows = await db
        .select({
          id: tacheListeItems.id,
          templateId: tacheListeItems.listeTemplateId,
          ordre: tacheListeItems.ordre,
          titre: tacheListeItems.titre,
          dureeEstimeeMinutes: tacheListeItems.dureeEstimeeMinutes,
        })
        .from(tacheListeItems)
        .where(
          templateIds.length === 1
            ? eq(tacheListeItems.listeTemplateId, templateIds[0]!)
            : inArray(tacheListeItems.listeTemplateId, templateIds),
        )
        .orderBy(asc(tacheListeItems.ordre));
      for (const item of itemRows) {
        const list = itemsByTemplate.get(item.templateId) ?? [];
        list.push({
          id: item.id,
          ordre: item.ordre,
          titre: item.titre,
          dureeEstimeeMinutes: item.dureeEstimeeMinutes,
        });
        itemsByTemplate.set(item.templateId, list);
      }
    }

    const regles = regleRows.map((r) => ({
      ...selectRegleRecurrenceSchema.parse(r.regle),
      tacheListeTemplateName: r.tacheListeTemplateName ?? null,
      tacheListeItems: r.regle.tacheListeTemplateId
        ? (itemsByTemplate.get(r.regle.tacheListeTemplateId) ?? [])
        : [],
    }));

    return { regles };
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

    // Valider que dtstartLocal >= prestation.dateDebut
    if (prestation.dateDebut) {
      const dtstartDate = new Date(parsedInput.dtstartLocal);
      if (dtstartDate < prestation.dateDebut) {
        throw errors.conflict(
          `La date de début de la règle (${dtstartDate.toLocaleDateString("fr-FR")}) ne peut pas être antérieure à la date de début de la prestation (${prestation.dateDebut.toLocaleDateString("fr-FR")}).`,
        );
      }
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
        tacheListeTemplateId: parsedInput.tacheListeTemplateId ?? null,
        createdById: session.user.id,
        updatedById: session.user.id,
      })
      .returning();

    await onClientServiceChanged({
      clientServiceId: parsedInput.clientServiceId,
      now: new Date(),
    });

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

    // Valider que dtstartLocal >= prestation.dateDebut (si modifié)
    if (parsedInput.dtstartLocal !== undefined && prestation.dateDebut) {
      const dtstartDate = new Date(parsedInput.dtstartLocal);
      if (dtstartDate < prestation.dateDebut) {
        throw errors.conflict(
          `La date de début de la règle (${dtstartDate.toLocaleDateString("fr-FR")}) ne peut pas être antérieure à la date de début de la prestation (${prestation.dateDebut.toLocaleDateString("fr-FR")}).`,
        );
      }
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
    if (parsedInput.tacheListeTemplateId !== undefined)
      updateFields.tacheListeTemplateId =
        parsedInput.tacheListeTemplateId ?? null;

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

// ==================== EXCEPTIONS RÉCURRENCE ====================

/**
 * Ajoute UNTIL=<dateOriginale-1s> à une chaîne RRULE (sans DTSTART).
 * Retire tout UNTIL ou COUNT existant pour éviter les conflits.
 */
function addUntilToRrule(rruleStr: string, exclusiveDate: Date): string {
  const until = new Date(exclusiveDate.getTime() - 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const untilStr =
    `${until.getUTCFullYear()}${pad(until.getUTCMonth() + 1)}${pad(until.getUTCDate())}` +
    `T${pad(until.getUTCHours())}${pad(until.getUTCMinutes())}${pad(until.getUTCSeconds())}Z`;
  return rruleStr
    .replace(/;?UNTIL=[^;]+/i, "")
    .replace(/;?COUNT=\d+/i, "")
    .trimEnd()
    .replace(/;$/, "") + `;UNTIL=${untilStr}`;
}

/**
 * Crée une exception "supprimée" sur une règle de récurrence.
 *
 * Scopes :
 *   "occurrence" — supprime cette occurrence seulement (exception en DB + suppression de
 *                  l'occurrence matérialisée planifiée si elle existe)
 *   "suivantes"  — supprime cette occurrence et toutes les suivantes (tronque la RRULE avec
 *                  UNTIL + supprime les occurrences planifiées futures)
 *   "serie"      — désactive la règle entière (actif = false) + supprime les futures planifiées
 */
export const createExceptionSupprimeeAction = actionClient
  .metadata({ actionName: "createExceptionSupprimeeAction" })
  .inputSchema(createExceptionSupprimeeSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) throw errors.unauthorized();

    const {
      entrepriseId,
      clientServiceId,
      regleRecurrenceId,
      dateOriginale,
      scope,
      motif,
    } = parsedInput;

    const prestation = await getPrestationById(clientServiceId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation introuvable.");
    }

    const canManage = await canManageRegles(
      session.user.id,
      entrepriseId,
      prestation.siteId,
    );
    if (!canManage) {
      throw errors.forbidden("Vous n'avez pas les droits pour modifier cette prestation.");
    }

    // Vérifier que la règle appartient bien à cette prestation
    const [regle] = await db
      .select()
      .from(clientServiceReglesRecurrence)
      .where(
        and(
          eq(clientServiceReglesRecurrence.id, regleRecurrenceId),
          eq(clientServiceReglesRecurrence.clientServiceId, clientServiceId),
        ),
      )
      .limit(1);
    if (!regle) throw errors.notFound("Règle de récurrence introuvable.");

    const dateOriginaleDate = new Date(dateOriginale);
    const now = new Date();

    await db.transaction(async (tx) => {
      // 1. Insérer l'exception "supprimee" (idempotent — si elle existe déjà, pas d'erreur critique)
      await tx
        .insert(clientServiceExceptionsRecurrence)
        .values({
          clientServiceId,
          regleRecurrenceId,
          siteId: null,
          dateOriginale: dateOriginaleDate,
          typeException: "supprimee",
          motif: motif ?? null,
          createdById: session.user.id,
          updatedById: session.user.id,
        })
        .onConflictDoNothing();

      if (scope === "occurrence") {
        // Supprimer l'occurrence matérialisée planifiée pour cette date, si elle existe
        await tx.delete(clientServiceOccurrences).where(
          and(
            eq(clientServiceOccurrences.clientServiceId, clientServiceId),
            eq(clientServiceOccurrences.regleRecurrenceId, regleRecurrenceId),
            eq(clientServiceOccurrences.statut, "planifiee"),
            eq(clientServiceOccurrences.dateDebutOriginale, dateOriginaleDate),
          ),
        );
      } else if (scope === "suivantes") {
        // Tronquer la RRULE avec UNTIL juste avant dateOriginale
        const newRrule = addUntilToRrule(regle.regleRrule, dateOriginaleDate);
        await tx
          .update(clientServiceReglesRecurrence)
          .set({
            regleRrule: newRrule,
            updatedById: session.user.id,
            updatedAt: now,
          })
          .where(eq(clientServiceReglesRecurrence.id, regleRecurrenceId));

        // Supprimer toutes les occurrences planifiées à partir de dateOriginale
        await deleteFuturePlanifieeOccurrences({
          clientServiceId,
          now: dateOriginaleDate,
          tx,
        });
      } else {
        // scope === "serie" : désactiver la règle entière
        await tx
          .update(clientServiceReglesRecurrence)
          .set({
            actif: false,
            updatedById: session.user.id,
            updatedAt: now,
          })
          .where(eq(clientServiceReglesRecurrence.id, regleRecurrenceId));

        // Supprimer toutes les futures occurrences planifiées (à partir de maintenant)
        await deleteFuturePlanifieeOccurrences({
          clientServiceId,
          now,
          tx,
        });
      }
    });

    return { success: true, scope };
  });

/**
 * Crée une exception "déplacée" sur une règle de récurrence.
 *
 * Scopes :
 *   "occurrence" — déplace cette occurrence seulement : insère l'exception + met à jour
 *                  la date de l'occurrence matérialisée planifiée si elle existe
 *   "suivantes"  — tronque la RRULE avec UNTIL + insère l'exception pour cette occurrence
 *                  + supprime les futures planifiées (l'utilisateur crée ensuite une nouvelle règle)
 */
export const createExceptionDeplaceeAction = actionClient
  .metadata({ actionName: "createExceptionDeplaceeAction" })
  .inputSchema(createExceptionDeplaceeSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) throw errors.unauthorized();

    const {
      entrepriseId,
      clientServiceId,
      regleRecurrenceId,
      dateOriginale,
      nouvelleDateDebut,
      nouvelleHeureFin,
      scope,
      motif,
    } = parsedInput;

    const prestation = await getPrestationById(clientServiceId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation introuvable.");
    }

    const canManage = await canManageRegles(
      session.user.id,
      entrepriseId,
      prestation.siteId,
    );
    if (!canManage) {
      throw errors.forbidden("Vous n'avez pas les droits pour modifier cette prestation.");
    }

    const [regle] = await db
      .select()
      .from(clientServiceReglesRecurrence)
      .where(
        and(
          eq(clientServiceReglesRecurrence.id, regleRecurrenceId),
          eq(clientServiceReglesRecurrence.clientServiceId, clientServiceId),
        ),
      )
      .limit(1);
    if (!regle) throw errors.notFound("Règle de récurrence introuvable.");

    const dateOriginaleDate = new Date(dateOriginale);
    const nouvelleDateDebutDate = new Date(nouvelleDateDebut);
    const nouvelleHeureFinDate = nouvelleHeureFin ? new Date(nouvelleHeureFin) : null;
    const now = new Date();

    await db.transaction(async (tx) => {
      // 1. Insérer l'exception "deplacee"
      await tx
        .insert(clientServiceExceptionsRecurrence)
        .values({
          clientServiceId,
          regleRecurrenceId,
          siteId: null,
          dateOriginale: dateOriginaleDate,
          typeException: "deplacee",
          nouvelleDateDebut: nouvelleDateDebutDate,
          nouvelleHeureFin: nouvelleHeureFinDate,
          motif: motif ?? null,
          createdById: session.user.id,
          updatedById: session.user.id,
        })
        .onConflictDoNothing();

      if (scope === "occurrence") {
        // Mettre à jour la date de l'occurrence matérialisée planifiée si elle existe
        await tx
          .update(clientServiceOccurrences)
          .set({
            dateDebutPrevue: nouvelleDateDebutDate,
            dateFinPrevue: nouvelleHeureFinDate,
            updatedById: session.user.id,
            updatedAt: now,
          })
          .where(
            and(
              eq(clientServiceOccurrences.clientServiceId, clientServiceId),
              eq(clientServiceOccurrences.regleRecurrenceId, regleRecurrenceId),
              eq(clientServiceOccurrences.statut, "planifiee"),
              eq(clientServiceOccurrences.dateDebutOriginale, dateOriginaleDate),
            ),
          );
      } else {
        // scope === "suivantes" : tronquer la RRULE + supprimer futures planifiées
        const newRrule = addUntilToRrule(regle.regleRrule, dateOriginaleDate);
        await tx
          .update(clientServiceReglesRecurrence)
          .set({
            regleRrule: newRrule,
            updatedById: session.user.id,
            updatedAt: now,
          })
          .where(eq(clientServiceReglesRecurrence.id, regleRecurrenceId));

        // Supprimer toutes les occurrences planifiées à partir de dateOriginale
        // (sauf celle qu'on vient de déplacer — elle sera mise à jour via l'exception)
        await tx.delete(clientServiceOccurrences).where(
          and(
            eq(clientServiceOccurrences.clientServiceId, clientServiceId),
            eq(clientServiceOccurrences.regleRecurrenceId, regleRecurrenceId),
            eq(clientServiceOccurrences.statut, "planifiee"),
            gte(clientServiceOccurrences.dateDebutOriginale, dateOriginaleDate),
          ),
        );

        // Re-créer l'occurrence déplacée avec la nouvelle date
        await tx
          .insert(clientServiceOccurrences)
          .values({
            clientServiceId,
            siteId: prestation.siteId,
            typeSource: "regle_recurrence",
            regleRecurrenceId,
            dateDebutOriginale: dateOriginaleDate,
            dateDebutPrevue: nouvelleDateDebutDate,
            dateFinPrevue: nouvelleHeureFinDate,
            statut: "planifiee",
            createdById: session.user.id,
            updatedById: session.user.id,
          })
          .onConflictDoNothing();
      }
    });

    return { success: true, scope };
  });

// ==================== UPDATE REGLE TACHE LISTE ====================

export const updateRegleTacheListeAction = actionClient
  .metadata({ actionName: "updateRegleTacheListeAction" })
  .inputSchema(updateRegleTacheListeSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { regleId, prestationId, entrepriseId, tacheListeTemplateId } =
      parsedInput;

    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    const canManage = await canManageRegles(
      currentUser.id,
      entrepriseId,
      prestation.siteId,
    );
    if (!canManage) {
      throw errors.forbidden(
        "Vous devez être responsable de ce site pour modifier la checklist.",
      );
    }

    // Vérifier que la règle appartient à la prestation
    const [regle] = await db
      .select({ id: clientServiceReglesRecurrence.id })
      .from(clientServiceReglesRecurrence)
      .where(
        and(
          eq(clientServiceReglesRecurrence.id, regleId),
          eq(clientServiceReglesRecurrence.clientServiceId, prestationId),
        ),
      )
      .limit(1);

    if (!regle) throw errors.notFound("Règle de récurrence");

    // Si un pack est fourni, vérifier compatibilité avec le service
    if (tacheListeTemplateId) {
      const [pack] = await db
        .select({ serviceId: tacheListesTemplates.serviceId })
        .from(tacheListesTemplates)
        .where(eq(tacheListesTemplates.id, tacheListeTemplateId))
        .limit(1);

      if (!pack) throw errors.notFound("Pack de tâches");
      if (pack.serviceId !== prestation.serviceId) {
        throw errors.conflict(
          "Ce pack de tâches n'est pas compatible avec le service de cette prestation.",
        );
      }
    }

    const [updated] = await db
      .update(clientServiceReglesRecurrence)
      .set({
        tacheListeTemplateId,
        updatedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(clientServiceReglesRecurrence.id, regleId))
      .returning();

    if (!updated) throw errors.internal("Échec de la mise à jour.");

    await onClientServiceChanged({ clientServiceId: prestationId, now: new Date() });

    return { regle: selectRegleRecurrenceSchema.parse(updated) };
  });
