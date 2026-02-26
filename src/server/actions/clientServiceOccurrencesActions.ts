"use server";

import { db } from "@/db";
import { clientServiceOccurrences } from "@/db/schema/services";
import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import { getPrestationById } from "@/server/queries/clientServices.query";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import { resolveUserEffectiveRoleOnSite } from "@/server/utils/userSiteAttributions.utils";
import {
  countFilteredOccurrencesByPrestationId,
  getOccurrencesByPrestationId,
} from "@/server/queries/clientServiceExecutions.query";
import { getUserAdhesion } from "@/server/queries/userAdhesions.query";
import { and, eq } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { z } from "zod";

// ==================== HELPERS ====================

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

// Transitions autorisées par statut courant
const OCCURRENCE_TRANSITIONS: Record<
  string,
  readonly ("en_cours" | "terminee" | "non_honoree" | "annulee")[]
> = {
  planifiee: ["en_cours", "annulee"],
  en_cours: ["terminee", "non_honoree", "annulee"],
};

// ==================== UPDATE OCCURRENCE STATUT ====================

export const updateOccurrenceStatutAction = actionClient
  .metadata({ actionName: "updateOccurrenceStatutAction" })
  .inputSchema(
    z.object({
      occurrenceId: z.string().uuid("ID de l'occurrence invalide"),
      prestationId: z.string().uuid("ID de la prestation invalide"),
      entrepriseId: z.string().uuid("ID de l'entreprise invalide"),
      statut: z.enum(["en_cours", "terminee", "non_honoree", "annulee"]),
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

    const { occurrenceId, prestationId, entrepriseId, statut: newStatut } =
      parsedInput;

    // Charger la prestation pour obtenir le siteId + vérifier appartenance
    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    // Vérifier les permissions
    const canManage = await canManagePrestation(
      currentUser.id,
      entrepriseId,
      prestation.siteId,
    );
    if (!canManage) {
      throw errors.forbidden(
        "Vous devez être responsable de ce site pour modifier le statut d'une intervention.",
      );
    }

    // Charger l'occurrence
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

    if (!occurrence) {
      throw errors.notFound("Intervention");
    }

    // Vérifier la transition
    const allowedTransitions = OCCURRENCE_TRANSITIONS[occurrence.statut] ?? [];
    if (!allowedTransitions.includes(newStatut)) {
      throw errors.conflict(
        `Transition invalide : ${occurrence.statut} → ${newStatut}.`,
      );
    }

    // RÈGLE CRITIQUE : bloquer le démarrage si aucune exécution assignée
    if (newStatut === "en_cours" && !occurrence.executionId) {
      throw errors.conflict(
        "Aucun prestataire assigné à cette intervention. Attribuez un prestataire actif avant de démarrer.",
      );
    }

    // Mettre à jour le statut
    const [updated] = await db
      .update(clientServiceOccurrences)
      .set({
        statut: newStatut,
        updatedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(clientServiceOccurrences.id, occurrenceId))
      .returning();

    if (!updated) {
      throw errors.internal("Échec de la mise à jour du statut.");
    }

    return {
      message: `Statut mis à jour : ${occurrence.statut} → ${newStatut}.`,
      occurrence: updated,
    };
  });

// ==================== GET OCCURRENCES PAGE ====================

export const getOccurrencesPageAction = actionClient
  .metadata({ actionName: "getOccurrencesPageAction" })
  .inputSchema(
    z.object({
      prestationId: z.string().uuid(),
      entrepriseId: z.string().uuid(),
      offset: z.number().int().min(0),
      limit: z.number().int().min(1).max(100).default(50),
      statut: z
        .enum(["planifiee", "en_cours", "terminee", "non_honoree", "annulee"])
        .optional(),
      nonAssignedOnly: z.boolean().optional(),
      siteId: z.string().uuid().optional(),
      sortDir: z.enum(["asc", "desc"]).optional(),
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

    const { prestationId, entrepriseId, offset, limit, statut, nonAssignedOnly, siteId, sortDir } =
      parsedInput;

    // Vérifier l'accès à l'entreprise (plateforme OU adhésion)
    const platformRole = await getUserPlateformeAdhesion(currentUser.id);
    if (!platformRole?.role) {
      const adhesion = await getUserAdhesion({
        userId: currentUser.id,
        entrepriseId,
      });
      if (!adhesion) {
        throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
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
