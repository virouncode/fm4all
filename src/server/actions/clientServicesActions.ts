"use server";

import { db } from "@/db";
import { userAdhesions } from "@/db/schema/users";
import {
  clientServiceExecutions,
  clientServiceOccurrences,
  clientServicePerimetre,
  clientServices,
} from "@/db/schema/services";
import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import {
  getPrestationById,
  getPrestationsByEntreprise,
  getPrestationWithJoinsById,
  prestationBelongsToEntreprise,
} from "@/server/queries/clientServices.query";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import { resolveUserEffectiveRoleOnSite } from "@/server/utils/userSiteAttributions.utils";
import {
  getPrestationsQuerySchema,
  insertClientServiceToDbSchema,
  insertPrestationFormSchema,
  selectClientServiceSchema,
  updateClientServiceToDbSchema,
  updatePrestationFormSchema,
  updatePrestationStatutSchema,
} from "@/zod-schemas/clientServices.schema";
import { normalizeForSubmit } from "@/zod-helpers/normalize";
import { and, count, eq, gte, or } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { z } from "zod";

// ==================== HELPERS ====================

/**
 * Vérifie si l'utilisateur peut gérer une prestation sur un site donné.
 * Règle : rôle plateforme (any) OU responsable_site sur le site.
 * L'admin d'entreprise sert à configurer les utilisateurs, pas à gérer les prestations.
 */
async function canManagePrestation(
  userId: string,
  entrepriseId: string,
  siteId: string,
): Promise<boolean> {
  const platformRole = await getUserPlateformeAdhesion(userId);
  if (platformRole?.role) return true;

  const siteRole = await resolveUserEffectiveRoleOnSite({
    userId,
    siteId,
    entrepriseId,
  });
  return siteRole === "responsable_site";
}

/**
 * Vérifie que l'utilisateur a accès à l'entreprise (adhésion ou plateforme)
 */
async function hasAccessToEntreprise(
  userId: string,
  entrepriseId: string,
): Promise<boolean> {
  const platformRole = await getUserPlateformeAdhesion(userId);
  if (platformRole?.role) return true;

  const adhesion = await db.query.userAdhesions.findFirst({
    where: and(
      eq(userAdhesions.userId, userId),
      eq(userAdhesions.entrepriseId, entrepriseId),
    ),
  });

  return !!adhesion;
}

/**
 * Vérifie si une prestation est "mise en exécution" (au moins une exécution, un tarif ou une occurrence future).
 * Dans ce cas, le modeCommercial est verrouillé.
 */
async function isPrestationMiseEnExecution(
  prestationId: string,
): Promise<boolean> {
  const now = new Date();

  const [executionRow] = await db
    .select({ n: count() })
    .from(clientServiceExecutions)
    .where(eq(clientServiceExecutions.clientServiceId, prestationId));

  if ((executionRow?.n ?? 0) > 0) return true;

  const [occurrenceRow] = await db
    .select({ n: count() })
    .from(clientServiceOccurrences)
    .where(
      and(
        eq(clientServiceOccurrences.clientServiceId, prestationId),
        or(
          gte(clientServiceOccurrences.dateDebutPrevue, now),
          gte(clientServiceOccurrences.dateDebutReelle, now),
        ),
      ),
    );

  return (occurrenceRow?.n ?? 0) > 0;
}

// ==================== GET PRESTATIONS ====================

export const getPrestationsAction = actionClient
  .metadata({ actionName: "getPrestationsAction" })
  .inputSchema(getPrestationsQuerySchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    const { entrepriseId, statut, serviceId, siteId } = parsedInput;

    // Vérifier l'accès à l'entreprise
    const hasAccess = await hasAccessToEntreprise(currentUser.id, entrepriseId);
    if (!hasAccess) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    const prestations = await getPrestationsByEntreprise(entrepriseId, {
      statut,
      serviceId,
      siteId,
    });

    return { prestations };
  });

// ==================== GET PRESTATION BY ID ====================

export const getPrestationByIdAction = actionClient
  .metadata({ actionName: "getPrestationByIdAction" })
  .inputSchema(
    z.object({
      prestationId: z.uuid("ID de la prestation invalide"),
      entrepriseId: z.uuid("ID de l'entreprise invalide"),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    const { prestationId, entrepriseId } = parsedInput;

    // Vérifier l'accès
    const hasAccess = await hasAccessToEntreprise(currentUser.id, entrepriseId);
    if (!hasAccess) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Vérifier que la prestation appartient à l'entreprise
    const belongs = await prestationBelongsToEntreprise({
      prestationId,
      entrepriseId,
    });
    if (!belongs) {
      throw errors.notFound("Prestation");
    }

    const prestation = await getPrestationWithJoinsById(prestationId);
    if (!prestation) {
      throw errors.notFound("Prestation");
    }

    return { prestation };
  });

// ==================== INSERT PRESTATION ====================

// Schéma pour une entrée de périmètre (inclure/exclure un site)
const perimetreEntrySchema = z.object({
  siteId: z.string().uuid("ID de site invalide"),
  mode: z.enum(["inclure", "exclure"]),
  scope: z.enum(["self", "subtree"]),
});

export const insertPrestationAction = actionClient
  .metadata({ actionName: "insertPrestationAction" })
  .inputSchema(
    insertPrestationFormSchema.extend({
      // Périmètre obligatoire : au moins l'entrée inclure du site d'ancrage
      perimetre: z
        .array(perimetreEntrySchema)
        .min(1, "Au moins une entrée de périmètre est requise"),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    const { entrepriseId, siteId } = parsedInput;

    // Vérifier les permissions : plateforme OU responsable_site sur le site d'ancrage
    const canCreate = await canManagePrestation(currentUser.id, entrepriseId, siteId);
    if (!canCreate) {
      throw errors.forbidden(
        "Vous devez être responsable de ce site pour créer une prestation.",
      );
    }

    // Règle métier : seule la plateforme peut créer en mode intermediaire_fm4all
    const platformRole = await getUserPlateformeAdhesion(currentUser.id);
    const modeCommercial =
      platformRole?.role && parsedInput.modeCommercial === "intermediaire_fm4all"
        ? "intermediaire_fm4all"
        : "direct";

    // Normaliser les données (strings → types corrects, "" → null)
    const normalized = normalizeForSubmit(parsedInput, {
      optionalNumbers: [
        "frequenceParPeriode",
        "intervalleJours",
        "dureeEstimeeMinutes",
      ] as const,
      optionalDates: ["dateDebut", "dateFin"] as const,
      optionalStrings: ["heureDebutPreference", "notes"] as const,
    });

    // Préparer le payload DB
    const payload = insertClientServiceToDbSchema.parse({
      entrepriseId: normalized.entrepriseId,
      siteId: normalized.siteId,
      serviceId: normalized.serviceId,
      frequence: normalized.frequence,
      frequenceParPeriode: normalized.frequenceParPeriode,
      intervalleJours: normalized.intervalleJours,
      dateDebut: normalized.dateDebut,
      dateFin: normalized.dateFin,
      joursPreference: normalized.joursPreference ?? null,
      heureDebutPreference: normalized.heureDebutPreference,
      dureeEstimeeMinutes: normalized.dureeEstimeeMinutes,
      statut: "brouillon", // toujours brouillon à la création
      modePlanning: normalized.modePlanning ?? "planifie",
      modeCommercial,
      notes: normalized.notes,
      createdById: currentUser.id,
      updatedById: currentUser.id,
    });

    // Transaction : créer la prestation + son périmètre atomiquement
    const parsedPrestation = await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(clientServices)
        .values(payload)
        .returning();

      if (!inserted) {
        throw errors.internal("Échec de la création de la prestation.");
      }

      // Insérer les entrées de périmètre
      await tx.insert(clientServicePerimetre).values(
        parsedInput.perimetre.map((entry, idx) => ({
          clientServiceId: inserted.id,
          siteId: entry.siteId,
          mode: entry.mode,
          scope: entry.scope,
          ordreAffichage: idx,
          createdById: currentUser.id,
          updatedById: currentUser.id,
        })),
      );

      return selectClientServiceSchema.parse(inserted);
    });

    // Si la prestation est directement créée en statut "actif" + mode "planifie",
    // déclencher la génération des occurrences
    if (
      parsedPrestation.statut === "actif" &&
      parsedPrestation.modePlanning === "planifie"
    ) {
      const { onClientServiceChanged } = await import(
        "@/server/utils/clientServiceOccurrences.utils"
      );
      await onClientServiceChanged({
        clientServiceId: parsedPrestation.id,
        now: new Date(),
      });
    }

    return {
      message: "Prestation créée avec succès.",
      prestation: parsedPrestation,
    };
  });

// ==================== UPDATE PRESTATION ====================

export const updatePrestationAction = actionClient
  .metadata({ actionName: "updatePrestationAction" })
  .inputSchema(
    updatePrestationFormSchema.extend({
      entrepriseId: z.uuid("ID de l'entreprise invalide"),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    const { id: prestationId, entrepriseId } = parsedInput;

    // Vérifier que la prestation appartient à l'entreprise
    const belongs = await prestationBelongsToEntreprise({
      prestationId,
      entrepriseId,
    });
    if (!belongs) {
      throw errors.notFound("Prestation");
    }

    // Récupérer la prestation pour avoir le siteId avant la vérification des permissions
    const current = await getPrestationById(prestationId);
    if (!current) {
      throw errors.notFound("Prestation");
    }

    // Vérifier les permissions : plateforme OU responsable_site sur le site
    const canEdit = await canManagePrestation(currentUser.id, entrepriseId, current.siteId);
    if (!canEdit) {
      throw errors.forbidden(
        "Vous devez être responsable de ce site pour modifier une prestation.",
      );
    }

    // Interdire la modification si la prestation est terminée
    if (current.statut === "termine") {
      throw errors.conflict(
        "Impossible de modifier une prestation terminée.",
      );
    }

    // Règle modeCommercial : seule la plateforme peut le modifier, et seulement avant exécution
    if (parsedInput.modeCommercial !== undefined && parsedInput.modeCommercial !== current.modeCommercial) {
      const platformRole = await getUserPlateformeAdhesion(currentUser.id);
      if (!platformRole?.role) {
        throw errors.forbidden(
          "Seule la plateforme FM4ALL peut modifier le mode commercial.",
        );
      }
      const isLocked = await isPrestationMiseEnExecution(prestationId);
      if (isLocked) {
        throw errors.conflict(
          "Le mode commercial ne peut plus être modifié : des exécutions, tarifs ou interventions existent déjà.",
        );
      }
    }

    // Normaliser les données
    const normalized = normalizeForSubmit(parsedInput, {
      optionalNumbers: [
        "frequenceParPeriode",
        "intervalleJours",
        "dureeEstimeeMinutes",
      ] as const,
      optionalDates: ["dateDebut", "dateFin"] as const,
      optionalStrings: ["heureDebutPreference", "notes"] as const,
    });

    // Construire l'objet de mise à jour avec seulement les champs fournis
    const updateFields: Record<string, unknown> = {};
    if (normalized.frequence !== undefined)
      updateFields.frequence = normalized.frequence;
    if (normalized.frequenceParPeriode !== undefined)
      updateFields.frequenceParPeriode = normalized.frequenceParPeriode;
    if (normalized.intervalleJours !== undefined)
      updateFields.intervalleJours = normalized.intervalleJours;
    if (normalized.dateDebut !== undefined)
      updateFields.dateDebut = normalized.dateDebut;
    if (normalized.dateFin !== undefined)
      updateFields.dateFin = normalized.dateFin;
    if (normalized.joursPreference !== undefined)
      updateFields.joursPreference = normalized.joursPreference ?? null;
    if (normalized.heureDebutPreference !== undefined)
      updateFields.heureDebutPreference = normalized.heureDebutPreference;
    if (normalized.dureeEstimeeMinutes !== undefined)
      updateFields.dureeEstimeeMinutes = normalized.dureeEstimeeMinutes;
    if (normalized.modePlanning !== undefined)
      updateFields.modePlanning = normalized.modePlanning;
    if (parsedInput.modeCommercial !== undefined)
      updateFields.modeCommercial = parsedInput.modeCommercial;
    if (normalized.notes !== undefined) updateFields.notes = normalized.notes;

    const payload = updateClientServiceToDbSchema.parse({
      ...updateFields,
      updatedById: currentUser.id,
    });

    const [updated] = await db
      .update(clientServices)
      .set(payload)
      .where(eq(clientServices.id, prestationId))
      .returning();

    if (!updated) {
      throw errors.internal("Échec de la mise à jour de la prestation.");
    }

    const parsedPrestation = selectClientServiceSchema.parse(updated);

    // Si la prestation est active + planifiée, re-générer les occurrences
    if (
      parsedPrestation.statut === "actif" &&
      parsedPrestation.modePlanning === "planifie"
    ) {
      const { onClientServiceChanged } = await import(
        "@/server/utils/clientServiceOccurrences.utils"
      );
      await onClientServiceChanged({ clientServiceId: parsedPrestation.id, now: new Date() });
    }

    return {
      message: "Prestation mise à jour avec succès.",
      prestation: parsedPrestation,
    };
  });

// ==================== UPDATE PRESTATION STATUT (CYCLE DE VIE) ====================

/**
 * Transitions autorisées:
 * - brouillon → actif
 * - actif → en_pause
 * - actif → termine
 * - en_pause → actif
 * - en_pause → termine
 * - termine → [aucune transition autorisée]
 */
const TRANSITIONS_AUTORISEES: Record<
  string,
  readonly string[]
> = {
  brouillon: ["actif"],
  actif: ["en_pause", "termine"],
  en_pause: ["actif", "termine"],
  termine: [],
};

export const updatePrestationStatutAction = actionClient
  .metadata({ actionName: "updatePrestationStatutAction" })
  .inputSchema(updatePrestationStatutSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    const { prestationId, entrepriseId, statut: newStatut } = parsedInput;

    // Vérifier que la prestation appartient à l'entreprise
    const belongs = await prestationBelongsToEntreprise({
      prestationId,
      entrepriseId,
    });
    if (!belongs) {
      throw errors.notFound("Prestation");
    }

    // Récupérer la prestation pour avoir le siteId avant la vérification des permissions
    const current = await getPrestationById(prestationId);
    if (!current) {
      throw errors.notFound("Prestation");
    }

    // Vérifier les permissions : plateforme OU responsable_site sur le site
    const canEdit = await canManagePrestation(currentUser.id, entrepriseId, current.siteId);
    if (!canEdit) {
      throw errors.forbidden(
        "Vous devez être responsable de ce site pour modifier le statut d'une prestation.",
      );
    }

    const currentStatut = current.statut;

    // Vérifier la transition
    const allowed = TRANSITIONS_AUTORISEES[currentStatut] ?? [];
    if (!allowed.includes(newStatut)) {
      throw errors.conflict(
        `Transition invalide : ${currentStatut} → ${newStatut}. Transitions autorisées : ${allowed.length > 0 ? allowed.join(", ") : "aucune"}.`,
      );
    }

    // Effectuer la mise à jour
    const [updated] = await db
      .update(clientServices)
      .set({
        statut: newStatut,
        updatedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(clientServices.id, prestationId))
      .returning();

    if (!updated) {
      throw errors.internal("Échec de la mise à jour du statut.");
    }

    const parsedPrestation = selectClientServiceSchema.parse(updated);

    // Effets de bord sur les occurrences selon la transition (mode planifie uniquement)
    if (parsedPrestation.modePlanning === "planifie") {
      const now = new Date();

      if (newStatut === "actif") {
        // Régénère la fenêtre glissante (supprime les planifiées futures + recrée)
        const { onClientServiceChanged } = await import(
          "@/server/utils/clientServiceOccurrences.utils"
        );
        await onClientServiceChanged({ clientServiceId: parsedPrestation.id, now });
      } else if (newStatut === "en_pause") {
        // Supprime les planifiées futures : seront régénérées au retour à actif
        const { deleteFuturePlanifieeOccurrences } = await import(
          "@/server/utils/clientServiceOccurrences.utils"
        );
        await deleteFuturePlanifieeOccurrences({ clientServiceId: parsedPrestation.id, now });
      } else if (newStatut === "termine") {
        // Annule les planifiées futures : conserve l'historique pour audit
        const { cancelFuturePlanifieeOccurrences } = await import(
          "@/server/utils/clientServiceOccurrences.utils"
        );
        await cancelFuturePlanifieeOccurrences({ clientServiceId: parsedPrestation.id, now });
      }
    }

    return {
      message: `Statut mis à jour : ${currentStatut} → ${newStatut}.`,
      prestation: parsedPrestation,
    };
  });

// ==================== DELETE PRESTATION ====================

export const deletePrestationAction = actionClient
  .metadata({ actionName: "deletePrestationAction" })
  .inputSchema(
    z.object({
      prestationId: z.uuid("ID de la prestation invalide"),
      entrepriseId: z.uuid("ID de l'entreprise invalide"),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    const { prestationId, entrepriseId } = parsedInput;

    // Vérifier que la prestation appartient à l'entreprise
    const belongs = await prestationBelongsToEntreprise({
      prestationId,
      entrepriseId,
    });
    if (!belongs) {
      throw errors.notFound("Prestation");
    }

    // Récupérer la prestation pour avoir le siteId avant la vérification des permissions
    const current = await getPrestationById(prestationId);
    if (!current) {
      throw errors.notFound("Prestation");
    }

    // Vérifier les permissions : plateforme OU responsable_site sur le site
    const canDelete = await canManagePrestation(currentUser.id, entrepriseId, current.siteId);
    if (!canDelete) {
      throw errors.forbidden(
        "Vous devez être responsable de ce site pour supprimer une prestation.",
      );
    }

    // Seules les prestations en "brouillon" peuvent être supprimées
    if (current.statut !== "brouillon") {
      throw errors.conflict(
        "Seules les prestations en brouillon peuvent être supprimées. Terminez la prestation d'abord.",
      );
    }

    await db
      .delete(clientServices)
      .where(eq(clientServices.id, prestationId));

    return {
      message: "Prestation supprimée avec succès.",
      prestationId,
    };
  });
