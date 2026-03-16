"use server";

import { db } from "@/db";
import { documents, documentsLinks } from "@/db/schema/documents";
import {
  clientServiceExecutions,
  clientServiceOccurrences,
  clientServiceReglesRecurrence,
  occurrenceTaches,
} from "@/db/schema/services";
import { tickets } from "@/db/schema/tickets";
import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import {
  countFilteredOccurrencesByPrestationId,
  getOccurrencesByPrestationId,
  getOccurrenceWithDetailsById,
} from "@/server/queries/clientServiceExecutions.query";
import {
  getPrestationById,
  getPrestationWithJoinsById,
  getQuotaInfoForPrestation,
  prestataireHasExecutionOnPrestation,
} from "@/server/queries/clientServices.query";
import {
  getUserClientAdhesion,
  getUserPrestataireAdhesion,
} from "@/server/queries/userAdhesions.query";
import {
  getActivePosture,
  getEffectivePlateformeRole,
  resolvePostureAwareSiteRole,
} from "@/server/utils/permissions.utils";
import type { ModePilotageType } from "@/zod-schemas/clientServiceExecutions.schema";
import { getUsersByEntrepriseId, getUsersByPrestataireEntrepriseId } from "@/server/queries/users.query";
import { promoteS3Key, s3, S3_BUCKET } from "@/server/s3/s3";
import {
  deleteFuturePlanifieeOccurrences,
  ensureOccurrencesWindow,
  insertPrixAppliquesForOccurrence,
  pickExecutionForOccurrence,
  snapshotOccurrenceTaches,
} from "@/server/utils/clientServiceOccurrences.utils";
import {
  addTachePieceJointeSchema,
  deleteAdHocTacheSchema,
  deleteTachePieceJointeSchema,
  dragOccurrenceSchema,
  getAssignableUsersForOccurrenceSchema,
  getOccurrencesPageSchema,
  getOccurrenceTachesSchema,
  insertAdHocTacheSchema,
  insertOccurrenceOnDemandFormSchema,
  occurrenceTicketsSchema,
  resizeOccurrenceSchema,
  ticketOccurrenceLinkSchema,
  updateAdHocTacheSchema,
  updateOccurrenceAssigneeSchema,
  updateOccurrenceDatesSchema,
  updateOccurrenceStatutSchema,
  updateOccurrenceTacheStatutSchema,
  updateTacheAssigneeSchema,
  updateTacheTempsPasseSchema,
} from "@/zod-schemas/clientServiceOccurrences.schema";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import {
  and,
  asc,
  count,
  eq,
  inArray,
  isNull,
  max,
  or,
} from "drizzle-orm";
import { DateTime } from "luxon";
import { flattenValidationErrors } from "next-safe-action";

// ==================== HELPERS ====================

/**
 * Retourne le modePilotage d'une exécution, ou "client" par défaut si pas d'exécution assignée.
 */
async function getExecutionContext(
  executionId: string | null,
): Promise<ModePilotageType> {
  if (!executionId) return "client";
  const [row] = await db
    .select({ modePilotage: clientServiceExecutions.modePilotage })
    .from(clientServiceExecutions)
    .where(eq(clientServiceExecutions.id, executionId))
    .limit(1);
  return row?.modePilotage ?? "client";
}

/**
 * Vérifie si une date est aujourd'hui (même jour calendaire en heure de Paris).
 * null → démarrage autorisé (occurrence sans date prévue).
 *
 * Utilise le fuseau Europe/Paris pour éviter les décalages entre 00h et 02h du matin.
 */
function isSameDayAsToday(date: Date | null): boolean {
  if (!date) return true;
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayStr = formatter
    .format(new Date())
    .split("/")
    .reverse()
    .join("-"); // → "YYYY-MM-DD"
  const dateStr = formatter
    .format(date)
    .split("/")
    .reverse()
    .join("-"); // → "YYYY-MM-DD"
  return dateStr === todayStr;
}

/**
 * Peut gérer (créer, replanifier, annuler, réassigner).
 *
 * modePilotage=client ou collaboration → client admin | client responsable_site
 * modePilotage=prestataire ou collaboration → prestataire admin | prestataire responsable_site
 * Plateforme → toujours autorisé
 */
async function canManageOccurrence(
  userId: string,
  clientEntrepriseId: string,
  siteId: string,
  modePilotage: ModePilotageType,
): Promise<boolean> {
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) return true;

  const posture = await getActivePosture();

  if (posture === "client") {
    if (modePilotage !== "client" && modePilotage !== "collaboration") return false;
    const adhesion = await getUserClientAdhesion({ userId, entrepriseId: clientEntrepriseId });
    if (adhesion?.role === "admin") return true;
    const siteRole = await resolvePostureAwareSiteRole({ userId, siteId, entrepriseId: clientEntrepriseId });
    return siteRole === "responsable_site";
  }

  if (posture === "prestataire") {
    if (modePilotage !== "prestataire" && modePilotage !== "collaboration") return false;
    const prestataireAdhesion = await getUserPrestataireAdhesion({ userId });
    if (!prestataireAdhesion) return false;
    if (prestataireAdhesion.role === "admin") return true;
    const siteRole = await resolvePostureAwareSiteRole({ userId, siteId, entrepriseId: prestataireAdhesion.entrepriseId });
    return siteRole === "responsable_site";
  }

  return false;
}

/**
 * Peut exécuter (démarrer, faire les tâches, terminer).
 * Rôles étendus par rapport à canManageOccurrence.
 *
 * modePilotage=client ou collaboration → client admin | responsable_site | demandeur_site
 * modePilotage=prestataire ou collaboration → prestataire admin | responsable_site | intervenant_site
 * Plateforme → toujours autorisé
 */
async function canExecuteOccurrence(
  userId: string,
  clientEntrepriseId: string,
  siteId: string,
  modePilotage: ModePilotageType,
): Promise<boolean> {
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) return true;

  const posture = await getActivePosture();

  if (posture === "client") {
    if (modePilotage !== "client" && modePilotage !== "collaboration") return false;
    const adhesion = await getUserClientAdhesion({ userId, entrepriseId: clientEntrepriseId });
    if (adhesion?.role === "admin") return true;
    const siteRole = await resolvePostureAwareSiteRole({ userId, siteId, entrepriseId: clientEntrepriseId });
    return siteRole === "responsable_site" || siteRole === "demandeur_site";
  }

  if (posture === "prestataire") {
    if (modePilotage !== "prestataire" && modePilotage !== "collaboration") return false;
    const prestataireAdhesion = await getUserPrestataireAdhesion({ userId });
    if (!prestataireAdhesion) return false;
    if (prestataireAdhesion.role === "admin") return true;
    const siteRole = await resolvePostureAwareSiteRole({ userId, siteId, entrepriseId: prestataireAdhesion.entrepriseId });
    return siteRole === "responsable_site" || siteRole === "intervenant_site";
  }

  return false;
}

// Transitions autorisées par statut courant
// Référence : docs/regles_metier.md — machine d'état occurrences
// planifiee → en_cours (démarrage) | annulee | non_honoree (prestataire absent avant démarrage)
// en_cours  → terminee uniquement
const OCCURRENCE_TRANSITIONS: Record<
  string,
  readonly ("en_cours" | "terminee" | "non_honoree" | "annulee")[]
> = {
  planifiee: ["en_cours", "annulee", "non_honoree"],
  en_cours: ["terminee"],
};

// ==================== UPDATE OCCURRENCE STATUT ====================

export const updateOccurrenceStatutAction = actionClient
  .metadata({ actionName: "updateOccurrenceStatutAction" })
  .inputSchema(updateOccurrenceStatutSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const {
      occurrenceId,
      prestationId,
      entrepriseId,
      statut: newStatut,
    } = parsedInput;

    // 1. Charger la prestation (siteId + appartenance entreprise)
    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    // 2. Charger l'occurrence (avant le check de permission pour accéder à executionId)
    const [occurrence] = await db
      .select()
      .from(clientServiceOccurrences)
      .where(
        and(
          eq(clientServiceOccurrences.id, occurrenceId),
          eq(clientServiceOccurrences.clientServiceId, prestationId),
        ),
      )
      .limit(1);

    if (!occurrence) throw errors.notFound("Intervention");

    // 3. Récupérer le modePilotage depuis l'exécution
    const modePilotage = await getExecutionContext(occurrence.executionId);

    // 4. Permissions selon le type de transition
    // annulee / non_honoree = décision managériale → canManageOccurrence requis
    // en_cours / terminee   = travail terrain → canExecuteOccurrence suffit
    const isManagementTransition =
      newStatut === "annulee" || newStatut === "non_honoree";

    if (isManagementTransition) {
      const canManage = await canManageOccurrence(
        currentUser.id,
        entrepriseId,
        prestation.siteId,
        modePilotage,
      );
      if (!canManage) {
        throw errors.forbidden(
          "Vous n'êtes pas autorisé à annuler ou marquer cette intervention comme non honorée.",
        );
      }
    } else {
      const canExecute = await canExecuteOccurrence(
        currentUser.id,
        entrepriseId,
        prestation.siteId,
        modePilotage,
      );
      if (!canExecute) {
        throw errors.forbidden(
          "Vous n'êtes pas autorisé à modifier le statut de cette intervention.",
        );
      }
    }

    // 5. Vérifier la transition d'état
    const allowedTransitions = OCCURRENCE_TRANSITIONS[occurrence.statut] ?? [];
    if (!allowedTransitions.includes(newStatut)) {
      throw errors.conflict(
        `Transition invalide : ${occurrence.statut} → ${newStatut}.`,
      );
    }

    // 6. RÈGLE DÉMARRAGE : exécution assignée + même journée
    if (newStatut === "en_cours") {
      if (!occurrence.executionId) {
        throw errors.conflict(
          "Aucun prestataire assigné à cette intervention. Attribuez un prestataire actif avant de démarrer.",
        );
      }
      if (!isSameDayAsToday(occurrence.dateDebutPrevue)) {
        throw errors.conflict(
          "Cette intervention n'est pas prévue aujourd'hui. Elle ne peut être démarrée que le jour prévu.",
        );
      }
    }

    // 7. RÈGLE CLÔTURE : la terminaison est autorisée même si des tâches sont encore ouvertes
    // (regles_metier.md §6 — "la réalité terrain le justifie")

    // 8. Mise à jour statut + gel executionId au démarrage + snapshot tâches + facturation
    const now = new Date();
    const updated = await db.transaction(async (tx) => {
      // Gel définitif de l'executionId au passage → en_cours
      // On re-résout pour couvrir le cas où la planification a changé depuis la génération
      let resolvedExecutionId = occurrence.executionId;
      if (newStatut === "en_cours") {
        resolvedExecutionId = await pickExecutionForOccurrence({
          clientServiceId: occurrence.clientServiceId,
          entrepriseId,
          siteId: occurrence.siteId,
          targetDate: now,
          tx,
        });
      }

      const [row] = await tx
        .update(clientServiceOccurrences)
        .set({
          statut: newStatut,
          ...(newStatut === "en_cours"
            ? {
                dateDebutReelle: now,
                // BUG-3 fix: L'exécutant réel est toujours l'utilisateur courant, pas l'assigné précédent.
                assigneeUserId: currentUser.id,
                // Gel définitif de l'exécution gagnante
                executionId: resolvedExecutionId,
              }
            : {}),
          ...(newStatut === "terminee" || newStatut === "non_honoree"
            ? { dateFinReelle: now }
            : {}),
          updatedById: currentUser.id,
          updatedAt: now,
        })
        .where(eq(clientServiceOccurrences.id, occurrenceId))
        .returning();

      if (!row) throw errors.internal("Échec de la mise à jour du statut.");

      // Snapshot des tâches au démarrage si pas encore fait (idempotent)
      // Priorité checklist : règle de récurrence > exécution
      if (newStatut === "en_cours" && resolvedExecutionId) {
        const [existing] = await tx
          .select({ nb: count() })
          .from(occurrenceTaches)
          .where(eq(occurrenceTaches.occurrenceId, occurrenceId));
        if ((existing?.nb ?? 0) === 0) {
          // 1. Chercher la checklist sur la règle de récurrence (override)
          let resolvedTacheListeTemplateId: string | null = null;

          if (occurrence.regleRecurrenceId) {
            const [regle] = await tx
              .select({ tacheListeTemplateId: clientServiceReglesRecurrence.tacheListeTemplateId })
              .from(clientServiceReglesRecurrence)
              .where(eq(clientServiceReglesRecurrence.id, occurrence.regleRecurrenceId))
              .limit(1);
            resolvedTacheListeTemplateId = regle?.tacheListeTemplateId ?? null;
          }

          // 2. Fallback sur la checklist de l'exécution
          if (!resolvedTacheListeTemplateId) {
            const [exec] = await tx
              .select({ tacheListeTemplateId: clientServiceExecutions.tacheListeTemplateId })
              .from(clientServiceExecutions)
              .where(eq(clientServiceExecutions.id, resolvedExecutionId))
              .limit(1);
            resolvedTacheListeTemplateId = exec?.tacheListeTemplateId ?? null;
          }

          if (resolvedTacheListeTemplateId) {
            await snapshotOccurrenceTaches({
              occurrenceId,
              tacheListeTemplateId: resolvedTacheListeTemplateId,
              tx,
            });
          }
        }
      }

      if (newStatut === "terminee") {
        await insertPrixAppliquesForOccurrence({ occurrenceId, tx });
      }

      return row;
    });

    return {
      message: `Statut mis à jour : ${occurrence.statut} → ${newStatut}.`,
      occurrence: updated,
    };
  });

// ==================== GET OCCURRENCES PAGE ====================

export const getOccurrencesPageAction = actionClient
  .metadata({ actionName: "getOccurrencesPageAction" })
  .inputSchema(getOccurrencesPageSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const {
      prestationId,
      entrepriseId,
      offset,
      limit,
      statut,
      nonAssignedOnly,
      siteId,
      sortDir,
    } = parsedInput;

    // Vérifier l'accès : plateforme OU adhésion client OU adhésion prestataire avec exécution sur cette prestation
    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    if (!platformRole?.role) {
      const posture = await getActivePosture();
      if (posture === "prestataire") {
        const prestataireAdhesion = await getUserPrestataireAdhesion({ userId: currentUser.id });
        if (!prestataireAdhesion) throw errors.forbidden("Vous n'avez pas accès.");
        const hasExecution = await prestataireHasExecutionOnPrestation({
          prestationId,
          prestataireEntrepriseId: prestataireAdhesion.entrepriseId,
        });
        if (!hasExecution) throw errors.forbidden("Vous n'avez pas d'exécution sur cette prestation.");
      } else {
        const adhesion = await getUserClientAdhesion({ userId: currentUser.id, entrepriseId });
        if (!adhesion) throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
      }
    }

    const [occurrences, filteredTotal] = await Promise.all([
      getOccurrencesByPrestationId(prestationId, {
        offset,
        limit,
        statut,
        nonAssignedOnly,
        siteId,
        sortDir,
      }),
      // Count seulement pour la première page (offset=0 = filtre/tri changé)
      offset === 0
        ? countFilteredOccurrencesByPrestationId(prestationId, {
            statut,
            nonAssignedOnly,
            siteId,
          })
        : Promise.resolve(undefined),
    ]);

    return { occurrences, filteredTotal };
  });

// ==================== GET OCCURRENCE TACHES ====================

export const getOccurrenceTachesAction = actionClient
  .metadata({ actionName: "getOccurrenceTachesAction" })
  .inputSchema(getOccurrenceTachesSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { occurrenceId, prestationId, entrepriseId } = parsedInput;

    // Vérifier l'accès : plateforme OU adhésion client OU adhésion prestataire avec exécution
    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    if (!platformRole?.role) {
      const posture = await getActivePosture();
      if (posture === "prestataire") {
        const prestataireAdhesion = await getUserPrestataireAdhesion({ userId: currentUser.id });
        if (!prestataireAdhesion) throw errors.forbidden("Vous n'avez pas accès.");
        const hasExecution = await prestataireHasExecutionOnPrestation({
          prestationId,
          prestataireEntrepriseId: prestataireAdhesion.entrepriseId,
        });
        if (!hasExecution) throw errors.forbidden("Vous n'avez pas d'exécution sur cette prestation.");
      } else {
        const adhesion = await getUserClientAdhesion({ userId: currentUser.id, entrepriseId });
        if (!adhesion) throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
      }
    }

    // Vérifier que l'occurrence appartient à la prestation
    const [occurrence] = await db
      .select({ id: clientServiceOccurrences.id })
      .from(clientServiceOccurrences)
      .where(
        and(
          eq(clientServiceOccurrences.id, occurrenceId),
          eq(clientServiceOccurrences.clientServiceId, prestationId),
        ),
      )
      .limit(1);

    if (!occurrence) throw errors.notFound("Intervention");

    const taches = await db
      .select()
      .from(occurrenceTaches)
      .where(eq(occurrenceTaches.occurrenceId, occurrenceId))
      .orderBy(asc(occurrenceTaches.ordre));

    return { taches };
  });

// ==================== UPDATE OCCURRENCE DATES ====================

export const updateOccurrenceDatesAction = actionClient
  .metadata({ actionName: "updateOccurrenceDatesAction" })
  .inputSchema(updateOccurrenceDatesSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const {
      occurrenceId,
      prestationId,
      entrepriseId,
      dateDebutPrevue,
      dateFinPrevue,
    } = parsedInput;

    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    const [occurrence] = await db
      .select({
        id: clientServiceOccurrences.id,
        statut: clientServiceOccurrences.statut,
        executionId: clientServiceOccurrences.executionId,
      })
      .from(clientServiceOccurrences)
      .where(
        and(
          eq(clientServiceOccurrences.id, occurrenceId),
          eq(clientServiceOccurrences.clientServiceId, prestationId),
        ),
      )
      .limit(1);

    if (!occurrence) throw errors.notFound("Intervention");

    const modePilotage = await getExecutionContext(occurrence.executionId);
    const canManage = await canManageOccurrence(
      currentUser.id,
      entrepriseId,
      prestation.siteId,
      modePilotage,
    );
    if (!canManage) {
      throw errors.forbidden(
        "Vous n'êtes pas autorisé à modifier les dates de cette intervention.",
      );
    }

    if (
      occurrence.statut === "terminee" ||
      occurrence.statut === "annulee" ||
      occurrence.statut === "non_honoree"
    ) {
      throw errors.conflict(
        "Impossible de modifier les dates d'une intervention terminée, annulée ou non honorée.",
      );
    }

    const [updated] = await db
      .update(clientServiceOccurrences)
      .set({
        dateDebutPrevue: dateDebutPrevue ? new Date(dateDebutPrevue) : null,
        dateFinPrevue: dateFinPrevue ? new Date(dateFinPrevue) : null,
        updatedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(clientServiceOccurrences.id, occurrenceId))
      .returning();

    if (!updated) throw errors.internal("Échec de la mise à jour des dates.");

    return {
      dateDebutPrevue: updated.dateDebutPrevue,
      dateFinPrevue: updated.dateFinPrevue,
    };
  });

// ==================== UPDATE OCCURRENCE TACHE STATUT ====================

// Transitions autorisées par statut courant pour les tâches
const TACHE_TRANSITIONS: Record<
  string,
  readonly (
    | "en_cours"
    | "terminee"
    | "non_honoree"
    | "non_applicable"
    | "annulee"
  )[]
> = {
  a_faire: ["en_cours", "non_honoree", "non_applicable", "annulee"],
  en_cours: ["terminee"], // regles_metier.md §2 — seule transition valide depuis en_cours
};

export const updateOccurrenceTacheStatutAction = actionClient
  .metadata({ actionName: "updateOccurrenceTacheStatutAction" })
  .inputSchema(updateOccurrenceTacheStatutSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const {
      tacheId,
      occurrenceId,
      prestationId,
      entrepriseId,
      statut: newStatut,
    } = parsedInput;

    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    // Charger l'occurrence pour obtenir executionId + statut
    const [occurrenceCtx] = await db
      .select({
        executionId: clientServiceOccurrences.executionId,
        statut: clientServiceOccurrences.statut,
      })
      .from(clientServiceOccurrences)
      .where(eq(clientServiceOccurrences.id, occurrenceId))
      .limit(1);

    const modePilotage = await getExecutionContext(occurrenceCtx?.executionId ?? null);

    // Charger la tâche AVANT le check de permission (nécessaire pour isAssignee sur terminee)
    const [tache] = await db
      .select()
      .from(occurrenceTaches)
      .where(
        and(
          eq(occurrenceTaches.id, tacheId),
          eq(occurrenceTaches.occurrenceId, occurrenceId),
        ),
      )
      .limit(1);

    if (!tache) throw errors.notFound("Tâche");

    // Matrice de permissions par transition :
    // annulee              → canManage (décision managériale)
    // terminee             → isAssignee OU canManage (seul l'exécutant ou un responsable)
    // non_honoree          → canExecute (tout exécutant peut signaler une impossibilité)
    // en_cours / non_appl. → canExecute (travail terrain)
    if (newStatut === "annulee") {
      const canManage = await canManageOccurrence(
        currentUser.id,
        entrepriseId,
        prestation.siteId,
        modePilotage,
      );
      if (!canManage) {
        throw errors.forbidden(
          "Vous n'êtes pas autorisé à annuler cette tâche.",
        );
      }
    } else if (newStatut === "terminee") {
      // BUG-2 fix: canExecute EST requis même si isAssignee.
      // Spec : terminee → canExecute ET (isAssignee OU canManage)
      const canExecute = await canExecuteOccurrence(
        currentUser.id,
        entrepriseId,
        prestation.siteId,
        modePilotage,
      );
      const isAssignee = tache.assigneeUserId === currentUser.id;
      if (isAssignee && !canExecute) {
        throw errors.forbidden(
          "Vous n'êtes pas autorisé à terminer cette tâche.",
        );
      }
      if (!isAssignee) {
        if (!canExecute) {
          throw errors.forbidden(
            "Seul l'intervenant assigné ou un responsable peut terminer cette tâche.",
          );
        }
        const canManage = await canManageOccurrence(
          currentUser.id,
          entrepriseId,
          prestation.siteId,
          modePilotage,
        );
        if (!canManage) {
          throw errors.forbidden(
            "Seul l'intervenant assigné ou un responsable peut terminer cette tâche.",
          );
        }
      }
    } else {
      // en_cours, non_applicable, non_honoree → canExecute
      const canExecute = await canExecuteOccurrence(
        currentUser.id,
        entrepriseId,
        prestation.siteId,
        modePilotage,
      );
      if (!canExecute) {
        throw errors.forbidden(
          "Vous n'êtes pas autorisé à modifier le statut de cette tâche.",
        );
      }
    }

    // Vérifier la transition
    const allowedTransitions = TACHE_TRANSITIONS[tache.statut] ?? [];
    if (!allowedTransitions.includes(newStatut)) {
      throw errors.conflict(
        `Transition invalide : ${tache.statut} → ${newStatut}.`,
      );
    }

    // Guard : une tâche ne peut démarrer que si l'intervention est elle-même en cours
    if (newStatut === "en_cours") {
      if (!occurrenceCtx || occurrenceCtx.statut !== "en_cours") {
        throw errors.conflict(
          "Impossible de démarrer une tâche : l'intervention n'est pas encore démarrée.",
        );
      }
    }

    const now = new Date();
    const updateData: Partial<typeof occurrenceTaches.$inferInsert> = {
      statut: newStatut,
      updatedById: currentUser.id,
      updatedAt: now,
    };

    if (newStatut === "en_cours" && !tache.startedAt) {
      updateData.startedAt = now;
    }
    // BUG-4 fix: doneAt, completeeParUserId, tempsPasseSecondes réservés à "terminee" uniquement.
    if (newStatut === "terminee") {
      updateData.doneAt = now;
      updateData.completeeParUserId = currentUser.id;
      if (tache.startedAt) {
        updateData.tempsPasseSecondes = Math.round(
          (now.getTime() - tache.startedAt.getTime()) / 1000,
        );
      }
    }

    const [updated] = await db
      .update(occurrenceTaches)
      .set(updateData)
      .where(eq(occurrenceTaches.id, tacheId))
      .returning();

    if (!updated) throw errors.internal("Échec de la mise à jour de la tâche.");

    return { tache: updated };
  });

// ==================== TACHE PIECE JOINTE — ADD ====================

export const addTachePieceJointeAction = actionClient
  .metadata({ actionName: "addTachePieceJointeAction" })
  .inputSchema(addTachePieceJointeSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const {
      tacheId,
      occurrenceId,
      prestationId,
      entrepriseId,
      storageKey,
      filename,
      mimeType,
      sizeBytes,
    } = parsedInput;

    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    const [occurrenceCtxPj] = await db
      .select({ executionId: clientServiceOccurrences.executionId })
      .from(clientServiceOccurrences)
      .where(eq(clientServiceOccurrences.id, occurrenceId))
      .limit(1);

    const modePilotage = await getExecutionContext(occurrenceCtxPj?.executionId ?? null);
    // BUG-8 fix: canManage est aussi autorisé à ajouter des PJ (spec §9).
    const canExecute = await canExecuteOccurrence(
      currentUser.id,
      entrepriseId,
      prestation.siteId,
      modePilotage,
    );
    const canManagePj = canExecute
      ? false
      : await canManageOccurrence(
          currentUser.id,
          entrepriseId,
          prestation.siteId,
          modePilotage,
        );
    if (!canExecute && !canManagePj) {
      throw errors.forbidden(
        "Vous n'êtes pas autorisé à ajouter une pièce jointe à cette intervention.",
      );
    }

    // Vérifier que la tâche existe, appartient à l'occurrence, et est en cours
    const [tache] = await db
      .select({ id: occurrenceTaches.id, statut: occurrenceTaches.statut })
      .from(occurrenceTaches)
      .where(
        and(
          eq(occurrenceTaches.id, tacheId),
          eq(occurrenceTaches.occurrenceId, occurrenceId),
        ),
      )
      .limit(1);

    if (!tache) throw errors.notFound("Tâche");

    if (tache.statut !== "en_cours") {
      throw errors.conflict(
        "Les pièces jointes ne peuvent être ajoutées que sur une tâche en cours.",
      );
    }

    // Vérifier la limite (max 2 PJs par tâche)
    const [{ nb }] = await db
      .select({ nb: count() })
      .from(documentsLinks)
      .where(eq(documentsLinks.occurrenceTacheId, tacheId));

    if (nb >= 2) {
      throw errors.conflict("Maximum 2 pièces jointes par tâche.");
    }

    // Transaction : promouvoir la clé S3 + insérer document + lien
    const pieceJointe = await db.transaction(async (tx) => {
      const promotedKey = await promoteS3Key({ tempKey: storageKey });

      const [doc] = await tx
        .insert(documents)
        .values({
          proprietaireEntrepriseId: entrepriseId,
          categorie: "tache_piece_jointe",
          storageProvider: "s3",
          storageKey: promotedKey,
          filename,
          mimeType,
          sizeBytes,
          createdById: currentUser.id,
        })
        .returning();

      const [link] = await tx
        .insert(documentsLinks)
        .values({
          documentId: doc.id,
          proprietaireEntrepriseId: entrepriseId,
          occurrenceTacheId: tacheId,
          visibilite: "public",
          createdById: currentUser.id,
          updatedById: currentUser.id,
        })
        .returning();

      return {
        linkId: link.id,
        documentId: doc.id,
        storageKey: doc.storageKey,
        filename: doc.filename,
        mimeType: doc.mimeType,
        sizeBytes: doc.sizeBytes,
      };
    });

    return { pieceJointe };
  });

// ==================== TACHE PIECE JOINTE — DELETE ====================

export const deleteTachePieceJointeAction = actionClient
  .metadata({ actionName: "deleteTachePieceJointeAction" })
  .inputSchema(deleteTachePieceJointeSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const {
      linkId,
      documentId,
      tacheId,
      occurrenceId,
      prestationId,
      entrepriseId,
    } = parsedInput;

    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    const [occurrenceCtxDel] = await db
      .select({ executionId: clientServiceOccurrences.executionId })
      .from(clientServiceOccurrences)
      .where(eq(clientServiceOccurrences.id, occurrenceId))
      .limit(1);

    const modePilotageDel = await getExecutionContext(occurrenceCtxDel?.executionId ?? null);
    // BUG-8 fix: canManage est aussi autorisé à supprimer des PJ (spec §9).
    const canExecuteDel = await canExecuteOccurrence(
      currentUser.id,
      entrepriseId,
      prestation.siteId,
      modePilotageDel,
    );
    const canManageDel = canExecuteDel
      ? false
      : await canManageOccurrence(
          currentUser.id,
          entrepriseId,
          prestation.siteId,
          modePilotageDel,
        );
    if (!canExecuteDel && !canManageDel) {
      throw errors.forbidden(
        "Vous n'êtes pas autorisé à supprimer une pièce jointe de cette intervention.",
      );
    }

    // Vérifier que la tâche existe et appartient à l'occurrence
    const [tache] = await db
      .select({ id: occurrenceTaches.id, statut: occurrenceTaches.statut })
      .from(occurrenceTaches)
      .where(
        and(
          eq(occurrenceTaches.id, tacheId),
          eq(occurrenceTaches.occurrenceId, occurrenceId),
        ),
      )
      .limit(1);

    if (!tache) throw errors.notFound("Tâche");

    if (tache.statut !== "en_cours") {
      throw errors.conflict(
        "Impossible de supprimer une pièce jointe : la tâche n'est plus en cours.",
      );
    }

    // Vérifier que le lien appartient bien à cette tâche et récupérer la clé S3
    const [link] = await db
      .select({
        id: documentsLinks.id,
        storageKey: documents.storageKey,
      })
      .from(documentsLinks)
      .innerJoin(documents, eq(documents.id, documentsLinks.documentId))
      .where(
        and(
          eq(documentsLinks.id, linkId),
          eq(documentsLinks.occurrenceTacheId, tacheId),
          eq(documentsLinks.documentId, documentId),
        ),
      )
      .limit(1);

    if (!link) throw errors.notFound("Pièce jointe");

    // Supprimer le lien + document en transaction
    await db.transaction(async (tx) => {
      await tx.delete(documentsLinks).where(eq(documentsLinks.id, linkId));
      await tx.delete(documents).where(eq(documents.id, documentId));
    });

    // Supprimer le fichier S3 (hors transaction, best-effort)
    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: S3_BUCKET,
          Key: link.storageKey,
        }),
      );
    } catch {
      // Non bloquant : le fichier orphelin sera nettoyé par un job
    }

    return { deleted: true };
  });

// ==================== INSERT TACHE AD-HOC ====================

const FINAL_OCCURRENCE_STATUTS = [
  "terminee",
  "annulee",
  "non_honoree",
] as const;

export const insertAdHocTacheAction = actionClient
  .metadata({ actionName: "insertAdHocTacheAction" })
  .inputSchema(insertAdHocTacheSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { occurrenceId, prestationId, entrepriseId, titre, description } =
      parsedInput;

    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    // Charger l'occurrence (statut + executionId pour le contexte de permission)
    const [occurrence] = await db
      .select({
        id: clientServiceOccurrences.id,
        statut: clientServiceOccurrences.statut,
        executionId: clientServiceOccurrences.executionId,
      })
      .from(clientServiceOccurrences)
      .where(
        and(
          eq(clientServiceOccurrences.id, occurrenceId),
          eq(clientServiceOccurrences.clientServiceId, prestationId),
        ),
      )
      .limit(1);

    if (!occurrence) throw errors.notFound("Intervention");

    const modePilotage = await getExecutionContext(occurrence.executionId);
    const canManageAdHocCreate = await canManageOccurrence(
      currentUser.id,
      entrepriseId,
      prestation.siteId,
      modePilotage,
    );
    if (!canManageAdHocCreate) {
      throw errors.forbidden(
        "Seuls les administrateurs et responsables de site peuvent ajouter une tâche ad-hoc.",
      );
    }

    if (
      FINAL_OCCURRENCE_STATUTS.includes(
        occurrence.statut as (typeof FINAL_OCCURRENCE_STATUTS)[number],
      )
    ) {
      throw errors.conflict(
        "Impossible d'ajouter une tâche à une intervention terminée, annulée ou non honorée.",
      );
    }

    // Calculer le prochain ordre (MAX + 1)
    const [{ maxOrdre }] = await db
      .select({ maxOrdre: max(occurrenceTaches.ordre) })
      .from(occurrenceTaches)
      .where(eq(occurrenceTaches.occurrenceId, occurrenceId));

    const ordre = (maxOrdre ?? 0) + 1;

    const [tache] = await db
      .insert(occurrenceTaches)
      .values({
        occurrenceId,
        listeItemId: null,
        ordre,
        titre: titre.trim(),
        description: description?.trim() || null,
        statut: "a_faire",
        createdById: currentUser.id,
        updatedById: currentUser.id,
      })
      .returning();

    if (!tache) throw errors.internal("Échec de la création de la tâche.");

    return { tache: { ...tache, piecesJointes: [] } };
  });

// ==================== UPDATE TACHE AD-HOC (titre/description) ====================

export const updateAdHocTacheAction = actionClient
  .metadata({ actionName: "updateAdHocTacheAction" })
  .inputSchema(updateAdHocTacheSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const {
      tacheId,
      occurrenceId,
      prestationId,
      entrepriseId,
      titre,
      description,
    } = parsedInput;

    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    const [occurrenceCtxAdh] = await db
      .select({ executionId: clientServiceOccurrences.executionId })
      .from(clientServiceOccurrences)
      .where(eq(clientServiceOccurrences.id, occurrenceId))
      .limit(1);

    const modePilotageAdh = await getExecutionContext(occurrenceCtxAdh?.executionId ?? null);
    const canManageAdHocUpdate = await canManageOccurrence(
      currentUser.id,
      entrepriseId,
      prestation.siteId,
      modePilotageAdh,
    );
    if (!canManageAdHocUpdate) {
      throw errors.forbidden(
        "Seuls les administrateurs et responsables de site peuvent modifier une tâche ad-hoc.",
      );
    }

    // Charger la tâche
    const [tache] = await db
      .select()
      .from(occurrenceTaches)
      .where(
        and(
          eq(occurrenceTaches.id, tacheId),
          eq(occurrenceTaches.occurrenceId, occurrenceId),
        ),
      )
      .limit(1);

    if (!tache) throw errors.notFound("Tâche");

    // Seulement les tâches ad-hoc (listeItemId IS NULL)
    if (tache.listeItemId !== null) {
      throw errors.conflict(
        "Seules les tâches ad-hoc peuvent avoir leur titre ou description modifiés.",
      );
    }

    // Verrouiller si statut final (terminee, annulee, non_honoree, non_applicable)
    if (tache.statut !== "a_faire" && tache.statut !== "en_cours") {
      throw errors.conflict(
        "Impossible de modifier une tâche dont le statut est final (doit être à faire ou en cours).",
      );
    }

    const [updated] = await db
      .update(occurrenceTaches)
      .set({
        titre: titre.trim(),
        description: description?.trim() || null,
        updatedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(occurrenceTaches.id, tacheId))
      .returning();

    if (!updated) throw errors.internal("Échec de la mise à jour de la tâche.");

    return { tache: updated };
  });

// ==================== DELETE TACHE AD-HOC ====================

export const deleteAdHocTacheAction = actionClient
  .metadata({ actionName: "deleteAdHocTacheAction" })
  .inputSchema(deleteAdHocTacheSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { tacheId, occurrenceId, prestationId, entrepriseId } = parsedInput;

    // 1. Vérifier que la prestation existe et appartient à l'entreprise
    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    // 2. Permission : canManageOccurrence (gestionnaire du côté pilote ou plateforme)
    const [occurrenceCtxDltTache] = await db
      .select({ executionId: clientServiceOccurrences.executionId })
      .from(clientServiceOccurrences)
      .where(eq(clientServiceOccurrences.id, occurrenceId))
      .limit(1);

    const modePilotageDltTache = await getExecutionContext(occurrenceCtxDltTache?.executionId ?? null);
    const canManageDltTache = await canManageOccurrence(
      currentUser.id,
      entrepriseId,
      prestation.siteId,
      modePilotageDltTache,
    );
    if (!canManageDltTache) {
      throw errors.forbidden(
        "Vous n'êtes pas autorisé à supprimer une tâche de cette intervention.",
      );
    }

    // 3. Vérifier que la tâche existe et appartient à l'occurrence
    const [tache] = await db
      .select({
        id: occurrenceTaches.id,
        listeItemId: occurrenceTaches.listeItemId,
        statut: occurrenceTaches.statut,
      })
      .from(occurrenceTaches)
      .where(
        and(
          eq(occurrenceTaches.id, tacheId),
          eq(occurrenceTaches.occurrenceId, occurrenceId),
        ),
      )
      .limit(1);

    if (!tache) throw errors.notFound("Tâche");

    // 4. Guard : uniquement les tâches ad-hoc
    if (tache.listeItemId !== null) {
      throw errors.conflict(
        "Seules les tâches ad-hoc peuvent être annulées. Utilisez \"non applicable\" pour les tâches de la checklist.",
      );
    }

    // 5. Guard : uniquement si la tâche est encore active (a_faire ou en_cours)
    if (tache.statut !== "a_faire" && tache.statut !== "en_cours") {
      throw errors.conflict(
        "Impossible d'annuler cette tâche : elle est déjà dans un état final.",
      );
    }

    // 6. Annulation logique — jamais de DELETE (règle doctrine)
    const [updated] = await db
      .update(occurrenceTaches)
      .set({ statut: "annulee", updatedById: currentUser.id, updatedAt: new Date() })
      .where(eq(occurrenceTaches.id, tacheId))
      .returning();

    if (!updated) throw errors.internal("Échec de l'annulation de la tâche.");

    return { tache: updated };
  });

// ==================== UPDATE TACHE ASSIGNEE ====================

export const updateTacheAssigneeAction = actionClient
  .metadata({ actionName: "updateTacheAssigneeAction" })
  .inputSchema(updateTacheAssigneeSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { tacheId, occurrenceId, entrepriseId, assigneeUserId } = parsedInput;

    // Vérifier accès entreprise
    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    if (!platformRole?.role) {
      const postureTa = await getActivePosture();
      if (postureTa === "prestataire") {
        const prestataireAdhesionTa = await getUserPrestataireAdhesion({ userId: currentUser.id });
        if (!prestataireAdhesionTa) {
          throw errors.forbidden("Vous n'avez pas accès.");
        }
      } else {
        const adhesion = await getUserClientAdhesion({
          userId: currentUser.id,
          entrepriseId,
        });
        if (!adhesion) {
          throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
        }
      }
    }

    // Charger la tâche (vérifier qu'elle appartient à l'occurrence + assignee courant)
    const [tacheData] = await db
      .select({ currentAssigneeUserId: occurrenceTaches.assigneeUserId })
      .from(occurrenceTaches)
      .where(
        and(
          eq(occurrenceTaches.id, tacheId),
          eq(occurrenceTaches.occurrenceId, occurrenceId),
        ),
      )
      .limit(1);

    if (!tacheData) throw errors.notFound("Tâche");

    // Charger l'occurrence pour siteId et executionId
    const occurrence = await getOccurrenceWithDetailsById(occurrenceId);
    if (!occurrence) throw errors.notFound("Occurrence");

    const { siteId } = occurrence;
    const { currentAssigneeUserId } = tacheData;

    const modePilotageTA = await getExecutionContext(occurrence.executionId);

    // Règles d'assignation :
    // - Self-assign / self-unassign : canExecuteOccurrence suffit
    // - Assign autre / unassign autre : canManageOccurrence requis
    const isSelfAssign = assigneeUserId === currentUser.id;
    const isSelfUnassign =
      assigneeUserId === null && currentAssigneeUserId === currentUser.id;

    if (!isSelfAssign && !isSelfUnassign) {
      const canManageTa = await canManageOccurrence(
        currentUser.id,
        entrepriseId,
        siteId,
        modePilotageTA,
      );
      if (!canManageTa) {
        throw errors.forbidden(
          "Vous n'êtes pas autorisé à assigner ou désassigner d'autres utilisateurs sur cette intervention.",
        );
      }
    } else {
      const canExecuteTa = await canExecuteOccurrence(
        currentUser.id,
        entrepriseId,
        siteId,
        modePilotageTA,
      );
      if (!canExecuteTa) {
        throw errors.forbidden(
          "Vous n'avez pas les droits pour vous assigner sur cette intervention.",
        );
      }
    }

    const [updatedTache] = await db
      .update(occurrenceTaches)
      .set({
        assigneeUserId,
        updatedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(occurrenceTaches.id, tacheId))
      .returning({
        id: occurrenceTaches.id,
        assigneeUserId: occurrenceTaches.assigneeUserId,
      });

    if (!updatedTache)
      throw errors.internal("Échec de la mise à jour de l'assigné.");

    return { assigneeUserId: updatedTache.assigneeUserId };
  });

// ==================== GET ASSIGNABLE USERS FOR OCCURRENCE ====================

export const getAssignableUsersForOccurrenceAction = actionClient
  .metadata({ actionName: "getAssignableUsersForOccurrenceAction" })
  .inputSchema(getAssignableUsersForOccurrenceSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { entrepriseId } = parsedInput;

    // En posture prestataire : retourner les utilisateurs du prestataire (pas du client)
    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    const posture = await getActivePosture();
    let targetEntrepriseId = entrepriseId;
    let isPrestatairePosture = false;

    if (!platformRole?.role) {
      if (posture === "prestataire") {
        const prestataireAdhesion = await getUserPrestataireAdhesion({ userId: currentUser.id });
        if (!prestataireAdhesion) throw errors.forbidden("Vous n'avez pas accès.");
        targetEntrepriseId = prestataireAdhesion.entrepriseId;
        isPrestatairePosture = true;
      } else {
        const adhesion = await getUserClientAdhesion({ userId: currentUser.id, entrepriseId });
        if (!adhesion) throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
      }
    }

    const usersData = isPrestatairePosture
      ? await getUsersByPrestataireEntrepriseId(targetEntrepriseId)
      : await getUsersByEntrepriseId(targetEntrepriseId);

    return {
      users: usersData.map((u) => ({
        id: u.id,
        prenom: u.prenom,
        nom: u.nom,
        email: u.email,
      })),
    };
  });

// ==================== LINK / UNLINK TICKET ↔ OCCURRENCE ====================

export const linkTicketToOccurrenceAction = actionClient
  .metadata({ actionName: "linkTicketToOccurrenceAction" })
  .inputSchema(ticketOccurrenceLinkSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { ticketId, occurrenceId, entrepriseId } = parsedInput;

    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    if (!platformRole?.role) {
      const postureLinkTicket = await getActivePosture();
      if (postureLinkTicket === "prestataire") {
        const prestataireAdhesionLink = await getUserPrestataireAdhesion({ userId: currentUser.id });
        if (!prestataireAdhesionLink) throw errors.forbidden("Vous n'avez pas accès.");
        const occ = await getOccurrenceWithDetailsById(occurrenceId);
        if (!occ) throw errors.notFound("Occurrence");
        const canAccess = await prestataireHasExecutionOnPrestation({
          prestationId: occ.clientServiceId,
          prestataireEntrepriseId: prestataireAdhesionLink.entrepriseId,
        });
        if (!canAccess) throw errors.forbidden("Vous n'avez pas accès à cette intervention.");
      } else {
        const adhesion = await getUserClientAdhesion({
          userId: currentUser.id,
          entrepriseId,
        });
        if (!adhesion) {
          throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
        }
      }
    }

    // Vérifier que le ticket appartient à l'entreprise
    const [ticket] = await db
      .select({
        id: tickets.id,
        proprietaireEntrepriseId: tickets.proprietaireEntrepriseId,
      })
      .from(tickets)
      .where(eq(tickets.id, ticketId))
      .limit(1);

    if (!ticket) throw errors.notFound("Ticket");
    if (ticket.proprietaireEntrepriseId !== entrepriseId) {
      throw errors.forbidden("Ce ticket n'appartient pas à cette entreprise.");
    }

    const [updatedTicket] = await db
      .update(tickets)
      .set({
        occurrenceId: occurrenceId,
        updatedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, ticketId))
      .returning({ id: tickets.id, occurrenceId: tickets.occurrenceId });

    if (!updatedTicket)
      throw errors.internal("Échec de la liaison ticket ↔ occurrence.");

    return { ticket: updatedTicket };
  });

export const unlinkTicketFromOccurrenceAction = actionClient
  .metadata({ actionName: "unlinkTicketFromOccurrenceAction" })
  .inputSchema(ticketOccurrenceLinkSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { ticketId, occurrenceId, entrepriseId } = parsedInput;

    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    if (!platformRole?.role) {
      const postureUnlinkTicket = await getActivePosture();
      if (postureUnlinkTicket === "prestataire") {
        const prestataireAdhesionUnlink = await getUserPrestataireAdhesion({ userId: currentUser.id });
        if (!prestataireAdhesionUnlink) throw errors.forbidden("Vous n'avez pas accès.");
        const occ = await getOccurrenceWithDetailsById(occurrenceId);
        if (!occ) throw errors.notFound("Occurrence");
        const canAccess = await prestataireHasExecutionOnPrestation({
          prestationId: occ.clientServiceId,
          prestataireEntrepriseId: prestataireAdhesionUnlink.entrepriseId,
        });
        if (!canAccess) throw errors.forbidden("Vous n'avez pas accès à cette intervention.");
      } else {
        const adhesion = await getUserClientAdhesion({
          userId: currentUser.id,
          entrepriseId,
        });
        if (!adhesion) {
          throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
        }
      }
    }

    // Vérifier que le ticket est bien lié à cette occurrence
    const [linkedTicket] = await db
      .select({ id: tickets.id })
      .from(tickets)
      .where(
        and(eq(tickets.id, ticketId), eq(tickets.occurrenceId, occurrenceId)),
      )
      .limit(1);

    if (!linkedTicket) throw errors.notFound("Ticket lié à cette occurrence");

    await db
      .update(tickets)
      .set({
        occurrenceId: null,
        updatedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, ticketId));

    return { unlinked: true };
  });

export const getAvailableTicketsForLinkingAction = actionClient
  .metadata({ actionName: "getAvailableTicketsForLinkingAction" })
  .inputSchema(occurrenceTicketsSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { occurrenceId, entrepriseId } = parsedInput;

    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    if (!platformRole?.role) {
      const postureGetAvail = await getActivePosture();
      if (postureGetAvail === "prestataire") {
        const prestataireAdhesionAvail = await getUserPrestataireAdhesion({ userId: currentUser.id });
        if (!prestataireAdhesionAvail) throw errors.forbidden("Vous n'avez pas accès.");
        const occ = await getOccurrenceWithDetailsById(occurrenceId);
        if (!occ) throw errors.notFound("Occurrence");
        const canAccess = await prestataireHasExecutionOnPrestation({
          prestationId: occ.clientServiceId,
          prestataireEntrepriseId: prestataireAdhesionAvail.entrepriseId,
        });
        if (!canAccess) throw errors.forbidden("Vous n'avez pas accès à cette intervention.");
      } else {
        const adhesion = await getUserClientAdhesion({
          userId: currentUser.id,
          entrepriseId,
        });
        if (!adhesion) {
          throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
        }
      }
    }

    // Tickets de l'entreprise qui ne sont pas liés à une AUTRE occurrence
    const availableTickets = await db
      .select({
        id: tickets.id,
        titre: tickets.titre,
        statut: tickets.statut,
        priorite: tickets.priorite,
        type: tickets.type,
        occurrenceId: tickets.occurrenceId,
        createdAt: tickets.createdAt,
      })
      .from(tickets)
      .where(
        and(
          eq(tickets.proprietaireEntrepriseId, entrepriseId),
          or(
            isNull(tickets.occurrenceId),
            eq(tickets.occurrenceId, occurrenceId),
          ),
        ),
      )
      .orderBy(tickets.createdAt);

    return { tickets: availableTickets };
  });

// ==================== GET TICKETS BY OCCURRENCE ====================

export const getTicketsByOccurrenceAction = actionClient
  .metadata({ actionName: "getTicketsByOccurrenceAction" })
  .inputSchema(occurrenceTicketsSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { occurrenceId, entrepriseId } = parsedInput;

    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    if (!platformRole?.role) {
      const postureGetTickets = await getActivePosture();
      if (postureGetTickets === "prestataire") {
        const prestataireAdhesionTickets = await getUserPrestataireAdhesion({ userId: currentUser.id });
        if (!prestataireAdhesionTickets) throw errors.forbidden("Vous n'avez pas accès.");
        const occ = await getOccurrenceWithDetailsById(occurrenceId);
        if (!occ) throw errors.notFound("Occurrence");
        const canAccess = await prestataireHasExecutionOnPrestation({
          prestationId: occ.clientServiceId,
          prestataireEntrepriseId: prestataireAdhesionTickets.entrepriseId,
        });
        if (!canAccess) throw errors.forbidden("Vous n'avez pas accès à cette intervention.");
      } else {
        const adhesion = await getUserClientAdhesion({
          userId: currentUser.id,
          entrepriseId,
        });
        if (!adhesion) {
          throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
        }
      }
    }

    const linkedTickets = await db
      .select({
        id: tickets.id,
        titre: tickets.titre,
        statut: tickets.statut,
        priorite: tickets.priorite,
        type: tickets.type,
        createdAt: tickets.createdAt,
      })
      .from(tickets)
      .where(eq(tickets.occurrenceId, occurrenceId))
      .orderBy(tickets.createdAt);

    return { tickets: linkedTickets };
  });

// ==================== UPDATE OCCURRENCE ASSIGNEE ====================

export const updateOccurrenceAssigneeAction = actionClient
  .metadata({ actionName: "updateOccurrenceAssigneeAction" })
  .inputSchema(updateOccurrenceAssigneeSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { occurrenceId, entrepriseId, assigneeUserId, applyToTaches } =
      parsedInput;

    // Charger l'occurrence
    const occurrence = await getOccurrenceWithDetailsById(occurrenceId);
    if (!occurrence) throw errors.notFound("Occurrence");

    const { siteId } = occurrence;
    const modePilotageOA = await getExecutionContext(occurrence.executionId);

    // Permission : canManageOccurrence (côté pilote selon modePilotage)
    const canManageOA = await canManageOccurrence(
      currentUser.id,
      entrepriseId,
      siteId,
      modePilotageOA,
    );
    if (!canManageOA) {
      throw errors.forbidden(
        "Vous n'êtes pas autorisé à gérer l'assignation de cette intervention.",
      );
    }

    await db.transaction(async (tx) => {
      // 1. Mettre à jour l'occurrence
      await tx
        .update(clientServiceOccurrences)
        .set({
          assigneeUserId,
          updatedById: currentUser.id,
          updatedAt: new Date(),
        })
        .where(eq(clientServiceOccurrences.id, occurrenceId));

      // 2. Si demandé, propager aux tâches non terminées
      if (applyToTaches) {
        await tx
          .update(occurrenceTaches)
          .set({
            assigneeUserId,
            updatedById: currentUser.id,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(occurrenceTaches.occurrenceId, occurrenceId),
              // Uniquement les tâches encore actives
              or(
                eq(occurrenceTaches.statut, "a_faire"),
                eq(occurrenceTaches.statut, "en_cours"),
              ),
            ),
          );
      }
    });

    // Vérifier les permissions d'accès à l'entreprise cliente pour le retour
    if (!entrepriseId) throw errors.forbidden("ID entreprise manquant.");

    return { occurrenceId, assigneeUserId };
  });

// ==================== INSERT OCCURRENCE ON-DEMAND ====================

export const insertOccurrenceOnDemandAction = actionClient
  .metadata({ actionName: "insertOccurrenceOnDemandAction" })
  .inputSchema(insertOccurrenceOnDemandFormSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { prestationId, entrepriseId, dateDebutPrevue, dateFinPrevue, notes } =
      parsedInput;

    // 1. Vérifier que la prestation existe et appartient à l'entreprise
    // getPrestationWithJoinsById inclut siteNom nécessaire pour le retour OccurrenceListItem
    const prestation = await getPrestationWithJoinsById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }
    if (prestation.statut !== "actif") {
      throw errors.conflict(
        "Impossible de créer un passage sur une prestation qui n'est pas active.",
      );
    }

    // 2. Parser les dates
    const dateDebut = new Date(dateDebutPrevue);
    const dateFin = dateFinPrevue ? new Date(dateFinPrevue) : null;

    // 3. Trouver l'exécution applicable — nécessaire avant le check de permission (pour modePilotage)
    const executionId = await pickExecutionForOccurrence({
      clientServiceId: prestationId,
      entrepriseId,
      siteId: prestation.siteId,
      targetDate: dateDebut,
    });

    if (executionId === null) {
      throw errors.conflict(
        "Aucune exécution active ne couvre cette date. Ajoutez un prestataire avant de créer une intervention.",
      );
    }

    // 4. Permissions selon modePilotage de l'exécution
    const modePilotageOD = await getExecutionContext(executionId);
    const canManageOD = await canManageOccurrence(
      currentUser.id,
      entrepriseId,
      prestation.siteId,
      modePilotageOD,
    );
    if (!canManageOD) {
      throw errors.forbidden(
        "Vous n'êtes pas autorisé à créer un passage sur cette prestation.",
      );
    }

    // 5. Vérifier le quota si la prestation est en mode quota_manuel
    if (prestation.famillePlanification === "quota_manuel") {
      const quotaInfo = await getQuotaInfoForPrestation(prestationId, dateDebut);
      if (
        quotaInfo !== null &&
        quotaInfo.usedInPeriod >= quotaInfo.nbOccurrencesParPeriode
      ) {
        throw errors.conflict(
          `Le quota d'interventions est atteint pour la période en cours (${quotaInfo.nbOccurrencesParPeriode} sur ${quotaInfo.nbOccurrencesParPeriode}). Aucune nouvelle intervention ne peut être ajoutée avant la prochaine période.`,
        );
      }
    }

    // 6. Insérer l'occurrence (+ snapshot tâches depuis la checklist) dans une transaction
    const occurrence = await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(clientServiceOccurrences)
        .values({
          clientServiceId: prestationId,
          siteId: prestation.siteId,
          dateDebutPrevue: dateDebut,
          dateFinPrevue: dateFin,
          executionId,
          statut: "planifiee",
          notes: notes ?? null,
          createdById: currentUser.id,
          updatedById: currentUser.id,
        })
        .returning();

      if (!inserted) throw errors.internal("Échec de la création du passage.");

      // Tâches NON snapshotées ici — snapshot réservé au cron J-1 ou au passage → en_cours

      return inserted;
    });

    // 6. Construire le retour au format OccurrenceListItem
    // (siteNom provient de la prestation déjà chargée — pas de query supplémentaire)
    const occurrenceListItem = {
      id: occurrence.id,
      clientServiceId: occurrence.clientServiceId,
      siteId: occurrence.siteId,
      siteNom: prestation.siteNom,
      executionId: occurrence.executionId,
      dateDebutPrevue: occurrence.dateDebutPrevue,
      dateFinPrevue: occurrence.dateFinPrevue,
      dateDebutReelle: occurrence.dateDebutReelle,
      dateFinReelle: occurrence.dateFinReelle,
      statut: occurrence.statut,
      notes: occurrence.notes,
      createdAt: occurrence.createdAt,
      assigneeUserId: occurrence.assigneeUserId,
      assigneePrenom: null as string | null,
      assigneeNom: null as string | null,
    };

    return { occurrence: occurrenceListItem };
  });

// ==================== UPDATE TACHE TEMPS PASSE ====================

export const updateTacheTempsPasseAction = actionClient
  .metadata({ actionName: "updateTacheTempsPasseAction" })
  .inputSchema(updateTacheTempsPasseSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { tacheId, occurrenceId, prestationId, entrepriseId, tempsPasseSecondes } =
      parsedInput;

    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    const [occurrenceCtxTps] = await db
      .select({ executionId: clientServiceOccurrences.executionId })
      .from(clientServiceOccurrences)
      .where(eq(clientServiceOccurrences.id, occurrenceId))
      .limit(1);

    const modePilotageTps = await getExecutionContext(occurrenceCtxTps?.executionId ?? null);
    const canManageTps = await canManageOccurrence(
      currentUser.id,
      entrepriseId,
      prestation.siteId,
      modePilotageTps,
    );
    if (!canManageTps) {
      throw errors.forbidden(
        "Seuls les administrateurs et responsables de site peuvent modifier le temps passé.",
      );
    }

    // La tâche doit être terminée
    const [tache] = await db
      .select({ id: occurrenceTaches.id, statut: occurrenceTaches.statut })
      .from(occurrenceTaches)
      .where(
        and(
          eq(occurrenceTaches.id, tacheId),
          eq(occurrenceTaches.occurrenceId, occurrenceId),
        ),
      )
      .limit(1);

    if (!tache) throw errors.notFound("Tâche");
    if (tache.statut !== "terminee") {
      throw errors.conflict(
        "Le temps passé ne peut être ajusté que sur une tâche terminée.",
      );
    }

    const [updated] = await db
      .update(occurrenceTaches)
      .set({
        tempsPasseSecondes,
        updatedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(occurrenceTaches.id, tacheId))
      .returning();

    if (!updated) throw errors.internal("Échec de la mise à jour du temps passé.");

    return { tempsPasseSecondes: updated.tempsPasseSecondes };
  });

// ==================== HELPERS (drag/resize) ====================

const UTC_DAY_CODES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"] as const;

function toWallClockDate(isoStr: string, zone: string): Date {
  const wallClock = DateTime.fromISO(isoStr)
    .setZone(zone)
    .toFormat("yyyy-MM-dd'T'HH:mm:ss");
  return new Date(wallClock);
}

function parseRruleParts(rruleStr: string): Record<string, string> {
  return Object.fromEntries(
    rruleStr.split(";").map((p) => {
      const [k, v] = p.split("=");
      return [k!, v ?? ""];
    }),
  );
}

function stripUntilCount(rruleStr: string): string {
  return rruleStr
    .replace(/;?UNTIL=[^;]+/gi, "")
    .replace(/;?COUNT=\d+/gi, "")
    .trimEnd()
    .replace(/;$/, "");
}

function addUntilLocal(rruleStr: string, exclusiveDate: Date): string {
  const until = new Date(exclusiveDate.getTime() - 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const untilStr = `${until.getUTCFullYear()}${pad(until.getUTCMonth() + 1)}${pad(until.getUTCDate())}T${pad(until.getUTCHours())}${pad(until.getUTCMinutes())}${pad(until.getUTCSeconds())}Z`;
  return stripUntilCount(rruleStr) + `;UNTIL=${untilStr}`;
}

async function canManageDragResize(
  userId: string,
  entrepriseId: string,
  siteId: string,
): Promise<boolean> {
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) return true;
  const posture = await getActivePosture();
  if (posture === "client") {
    const adhesion = await getUserClientAdhesion({ userId, entrepriseId });
    if (adhesion?.role === "admin") return true;
  } else if (posture === "prestataire") {
    const adhesion = await getUserPrestataireAdhesion({ userId });
    if (adhesion?.role === "admin") return true;
  }
  const siteRole = await resolvePostureAwareSiteRole({ userId, siteId, entrepriseId });
  return siteRole === "responsable_site";
}

// ==================== DRAG OCCURRENCE ====================

export const dragOccurrenceAction = actionClient
  .metadata({ actionName: "dragOccurrenceAction" })
  .inputSchema(dragOccurrenceSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) throw errors.unauthorized();

    const [occ] = await db
      .select({
        id: clientServiceOccurrences.id,
        clientServiceId: clientServiceOccurrences.clientServiceId,
        siteId: clientServiceOccurrences.siteId,
        statut: clientServiceOccurrences.statut,
        regleRecurrenceId: clientServiceOccurrences.regleRecurrenceId,
        dateDebutOriginale: clientServiceOccurrences.dateDebutOriginale,
        dateDebutPrevue: clientServiceOccurrences.dateDebutPrevue,
        dateFinPrevue: clientServiceOccurrences.dateFinPrevue,
      })
      .from(clientServiceOccurrences)
      .where(eq(clientServiceOccurrences.id, parsedInput.occurrenceId))
      .limit(1);

    if (!occ) throw errors.notFound("Occurrence introuvable.");
    if (occ.statut !== "planifiee")
      throw errors.conflict("Seules les occurrences planifiées peuvent être déplacées.");

    const canManage = await canManageDragResize(
      session.user.id,
      parsedInput.entrepriseId,
      occ.siteId,
    );
    if (!canManage) throw errors.forbidden("Droits insuffisants pour modifier cette occurrence.");

    const fuseauHoraire = "Europe/Paris";
    const newStartDate = toWallClockDate(parsedInput.newStart, fuseauHoraire);
    const newEndDate = parsedInput.newEnd
      ? toWallClockDate(parsedInput.newEnd, fuseauHoraire)
      : null;

    // ── Scope "occurrence" ──────────────────────────────────────────────────
    if (parsedInput.scope === "occurrence" || !occ.regleRecurrenceId) {
      await db
        .update(clientServiceOccurrences)
        .set({
          dateDebutPrevue: newStartDate,
          ...(newEndDate ? { dateFinPrevue: newEndDate } : {}),
          updatedAt: new Date(),
        })
        .where(eq(clientServiceOccurrences.id, occ.id));

      return { success: true };
    }

    // ── Scope "suivantes" ───────────────────────────────────────────────────
    const [rule] = await db
      .select()
      .from(clientServiceReglesRecurrence)
      .where(eq(clientServiceReglesRecurrence.id, occ.regleRecurrenceId!))
      .limit(1);

    if (!rule) throw errors.notFound("Règle de récurrence introuvable.");

    const dateOrigUTC = occ.dateDebutOriginale ?? occ.dateDebutPrevue;
    if (!dateOrigUTC) throw errors.internal("Date d'origine manquante.");

    const parts = parseRruleParts(rule.regleRrule);
    const freq = parts["FREQ"] ?? "WEEKLY";
    const intervalN = parseInt(parts["INTERVAL"] ?? "1", 10);
    const intervalPart = intervalN > 1 ? `;INTERVAL=${intervalN}` : "";
    const bydayList = (parts["BYDAY"] ?? "").split(",").filter(Boolean);
    const draggedDay = UTC_DAY_CODES[dateOrigUTC.getUTCDay()] ?? "MO";

    await db.transaction(async (tx) => {
      // 1. Tronquer la règle originale
      await tx
        .update(clientServiceReglesRecurrence)
        .set({ regleRrule: addUntilLocal(rule.regleRrule, dateOrigUTC) })
        .where(eq(clientServiceReglesRecurrence.id, rule.id));

      // 2. Supprimer les occurrences futures planifiées depuis cette date
      await deleteFuturePlanifieeOccurrences({
        clientServiceId: occ.clientServiceId,
        now: dateOrigUTC,
        tx,
      });

      // 3. Créer Règle B : jour déplacé, nouvelle heure
      const ruleBRrule =
        freq === "WEEKLY" && bydayList.length > 0
          ? `FREQ=WEEKLY${intervalPart};BYDAY=${draggedDay}`
          : stripUntilCount(rule.regleRrule);

      await tx.insert(clientServiceReglesRecurrence).values({
        clientServiceId: rule.clientServiceId,
        libelle: rule.libelle,
        dtstartLocal: newStartDate,
        fuseauHoraire: rule.fuseauHoraire,
        regleRrule: ruleBRrule,
        dureePrevueMinutes: newEndDate
          ? Math.round((newEndDate.getTime() - newStartDate.getTime()) / 60000)
          : rule.dureePrevueMinutes,
        actif: true,
        ordre: rule.ordre,
        createdById: session.user.id,
        updatedById: session.user.id,
      });

      // 4. Créer Règle A : autres jours, heure originale (si WEEKLY multi-jours)
      const otherDays = bydayList.filter((d) => d !== draggedDay);
      if (freq === "WEEKLY" && otherDays.length > 0) {
        const ruleADtstart = new Date(
          Date.UTC(
            dateOrigUTC.getUTCFullYear(),
            dateOrigUTC.getUTCMonth(),
            dateOrigUTC.getUTCDate(),
            rule.dtstartLocal.getUTCHours(),
            rule.dtstartLocal.getUTCMinutes(),
            0,
            0,
          ),
        );

        await tx.insert(clientServiceReglesRecurrence).values({
          clientServiceId: rule.clientServiceId,
          libelle: rule.libelle,
          dtstartLocal: ruleADtstart,
          fuseauHoraire: rule.fuseauHoraire,
          regleRrule: `FREQ=WEEKLY${intervalPart};BYDAY=${otherDays.join(",")}`,
          dureePrevueMinutes: rule.dureePrevueMinutes,
          actif: true,
          ordre: rule.ordre,
          createdById: session.user.id,
          updatedById: session.user.id,
        });
      }
    });

    // 5. Régénérer les occurrences
    const { created } = await ensureOccurrencesWindow({
      clientServiceId: occ.clientServiceId,
      now: dateOrigUTC,
      daysAhead: 90,
    });

    return { success: true, warningNoExecution: created === 0 };
  });

// ==================== RESIZE OCCURRENCE ====================

export const resizeOccurrenceAction = actionClient
  .metadata({ actionName: "resizeOccurrenceAction" })
  .inputSchema(resizeOccurrenceSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) throw errors.unauthorized();

    const [occ] = await db
      .select({
        id: clientServiceOccurrences.id,
        clientServiceId: clientServiceOccurrences.clientServiceId,
        siteId: clientServiceOccurrences.siteId,
        statut: clientServiceOccurrences.statut,
        regleRecurrenceId: clientServiceOccurrences.regleRecurrenceId,
        dateDebutOriginale: clientServiceOccurrences.dateDebutOriginale,
        dateDebutPrevue: clientServiceOccurrences.dateDebutPrevue,
      })
      .from(clientServiceOccurrences)
      .where(eq(clientServiceOccurrences.id, parsedInput.occurrenceId))
      .limit(1);

    if (!occ) throw errors.notFound("Occurrence introuvable.");
    if (occ.statut !== "planifiee")
      throw errors.conflict("Seules les occurrences planifiées peuvent être redimensionnées.");

    const canManage = await canManageDragResize(
      session.user.id,
      parsedInput.entrepriseId,
      occ.siteId,
    );
    if (!canManage) throw errors.forbidden("Droits insuffisants pour modifier cette occurrence.");

    const fuseauHoraire = "Europe/Paris";
    const newEndDate = toWallClockDate(parsedInput.newEnd, fuseauHoraire);
    const startDate = occ.dateDebutPrevue!;
    const newDurationMinutes = Math.round(
      (newEndDate.getTime() - startDate.getTime()) / 60000,
    );
    if (newDurationMinutes <= 0) throw errors.conflict("La durée doit être positive.");

    // ── Scope "occurrence" ──────────────────────────────────────────────────
    if (parsedInput.scope === "occurrence" || !occ.regleRecurrenceId) {
      await db
        .update(clientServiceOccurrences)
        .set({ dateFinPrevue: newEndDate, updatedAt: new Date() })
        .where(eq(clientServiceOccurrences.id, occ.id));

      return { success: true };
    }

    // ── Scope "suivantes" ───────────────────────────────────────────────────
    const [rule] = await db
      .select()
      .from(clientServiceReglesRecurrence)
      .where(eq(clientServiceReglesRecurrence.id, occ.regleRecurrenceId!))
      .limit(1);

    if (!rule) throw errors.notFound("Règle de récurrence introuvable.");

    const dateOrigUTC = occ.dateDebutOriginale ?? occ.dateDebutPrevue;
    if (!dateOrigUTC) throw errors.internal("Date d'origine manquante.");

    const parts = parseRruleParts(rule.regleRrule);
    const freq = parts["FREQ"] ?? "WEEKLY";
    const intervalN = parseInt(parts["INTERVAL"] ?? "1", 10);
    const intervalPart = intervalN > 1 ? `;INTERVAL=${intervalN}` : "";
    const bydayList = (parts["BYDAY"] ?? "").split(",").filter(Boolean);
    const resizedDay = UTC_DAY_CODES[dateOrigUTC.getUTCDay()] ?? "MO";

    await db.transaction(async (tx) => {
      // 1. Tronquer la règle originale
      await tx
        .update(clientServiceReglesRecurrence)
        .set({ regleRrule: addUntilLocal(rule.regleRrule, dateOrigUTC) })
        .where(eq(clientServiceReglesRecurrence.id, rule.id));

      // 2. Supprimer les occurrences futures planifiées
      await deleteFuturePlanifieeOccurrences({
        clientServiceId: occ.clientServiceId,
        now: dateOrigUTC,
        tx,
      });

      // 3. Créer Règle B : jour redimensionné, nouvelle durée, même heure
      const ruleBRrule =
        freq === "WEEKLY" && bydayList.length > 0
          ? `FREQ=WEEKLY${intervalPart};BYDAY=${resizedDay}`
          : stripUntilCount(rule.regleRrule);

      await tx.insert(clientServiceReglesRecurrence).values({
        clientServiceId: rule.clientServiceId,
        libelle: rule.libelle,
        dtstartLocal: dateOrigUTC,
        fuseauHoraire: rule.fuseauHoraire,
        regleRrule: ruleBRrule,
        dureePrevueMinutes: newDurationMinutes,
        actif: true,
        ordre: rule.ordre,
        createdById: session.user.id,
        updatedById: session.user.id,
      });

      // 4. Créer Règle A : autres jours, durée originale (si WEEKLY multi-jours)
      const otherDays = bydayList.filter((d) => d !== resizedDay);
      if (freq === "WEEKLY" && otherDays.length > 0) {
        const ruleADtstart = new Date(
          Date.UTC(
            dateOrigUTC.getUTCFullYear(),
            dateOrigUTC.getUTCMonth(),
            dateOrigUTC.getUTCDate(),
            rule.dtstartLocal.getUTCHours(),
            rule.dtstartLocal.getUTCMinutes(),
            0,
            0,
          ),
        );

        await tx.insert(clientServiceReglesRecurrence).values({
          clientServiceId: rule.clientServiceId,
          libelle: rule.libelle,
          dtstartLocal: ruleADtstart,
          fuseauHoraire: rule.fuseauHoraire,
          regleRrule: `FREQ=WEEKLY${intervalPart};BYDAY=${otherDays.join(",")}`,
          dureePrevueMinutes: rule.dureePrevueMinutes,
          actif: true,
          ordre: rule.ordre,
          createdById: session.user.id,
          updatedById: session.user.id,
        });
      }
    });

    // 5. Régénérer
    const { created: createdResize } = await ensureOccurrencesWindow({
      clientServiceId: occ.clientServiceId,
      now: dateOrigUTC,
      daysAhead: 90,
    });

    return { success: true, warningNoExecution: createdResize === 0 };
  });
