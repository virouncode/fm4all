"use server";

import { db } from "@/db";
import { userAdhesions } from "@/db/schema/users";
import { clientServices } from "@/db/schema/services";
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
import { and, eq } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { z } from "zod";

// ==================== HELPERS ====================

/**
 * Vérifie si l'utilisateur est admin de l'entreprise OU super_admin_plateforme
 */
async function isAdminOrPlateforme(
  userId: string,
  entrepriseId: string,
): Promise<boolean> {
  const adhesion = await db.query.userAdhesions.findFirst({
    where: and(
      eq(userAdhesions.userId, userId),
      eq(userAdhesions.entrepriseId, entrepriseId),
    ),
  });

  const platformRole = await getUserPlateformeAdhesion(userId);

  return (
    adhesion?.role === "admin" ||
    platformRole?.role === "super_admin_plateforme"
  );
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

export const insertPrestationAction = actionClient
  .metadata({ actionName: "insertPrestationAction" })
  .inputSchema(insertPrestationFormSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    const { entrepriseId } = parsedInput;

    // Seuls admin ou plateforme peuvent créer une prestation
    const canCreate = await isAdminOrPlateforme(currentUser.id, entrepriseId);
    if (!canCreate) {
      throw errors.forbidden(
        "Seuls les administrateurs peuvent créer des prestations.",
      );
    }

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
      statut: normalized.statut ?? "brouillon",
      modePlanning: normalized.modePlanning ?? "planifie",
      notes: normalized.notes,
      createdById: currentUser.id,
      updatedById: currentUser.id,
    });

    const [inserted] = await db
      .insert(clientServices)
      .values(payload)
      .returning();

    if (!inserted) {
      throw errors.internal("Échec de la création de la prestation.");
    }

    const parsedPrestation = selectClientServiceSchema.parse(inserted);

    // Si la prestation est directement créée en statut "actif" + mode "planifie",
    // déclencher la génération des occurrences
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

    // Vérifier les permissions
    const canEdit = await isAdminOrPlateforme(currentUser.id, entrepriseId);
    if (!canEdit) {
      throw errors.forbidden(
        "Seuls les administrateurs peuvent modifier des prestations.",
      );
    }

    // Récupérer la prestation actuelle pour vérifier le statut
    const current = await getPrestationById(prestationId);
    if (!current) {
      throw errors.notFound("Prestation");
    }

    // Interdire la modification si la prestation est terminée
    if (current.statut === "termine") {
      throw errors.conflict(
        "Impossible de modifier une prestation terminée.",
      );
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

    // Vérifier les permissions
    const canEdit = await isAdminOrPlateforme(currentUser.id, entrepriseId);
    if (!canEdit) {
      throw errors.forbidden(
        "Seuls les administrateurs peuvent modifier le statut d'une prestation.",
      );
    }

    // Récupérer le statut actuel
    const current = await getPrestationById(prestationId);
    if (!current) {
      throw errors.notFound("Prestation");
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

    // Déclencher la génération d'occurrences si passage à "actif" + mode "planifie"
    if (
      newStatut === "actif" &&
      parsedPrestation.modePlanning === "planifie"
    ) {
      const { onClientServiceChanged } = await import(
        "@/server/utils/clientServiceOccurrences.utils"
      );
      await onClientServiceChanged({ clientServiceId: parsedPrestation.id, now: new Date() });
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

    // Vérifier les permissions
    const canDelete = await isAdminOrPlateforme(currentUser.id, entrepriseId);
    if (!canDelete) {
      throw errors.forbidden(
        "Seuls les administrateurs peuvent supprimer des prestations.",
      );
    }

    // Récupérer la prestation pour vérifier le statut
    const current = await getPrestationById(prestationId);
    if (!current) {
      throw errors.notFound("Prestation");
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
