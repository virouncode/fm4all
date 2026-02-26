"use server";

import { db } from "@/db";
import {
  clientServiceExecutionPrix,
  clientServiceExecutions,
  clientServices,
} from "@/db/schema/services";
import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import {
  getExecutionsWithPrixByPrestationId,
  getPrestatairesForService,
} from "@/server/queries/clientServiceExecutions.query";
import { getPrestationById } from "@/server/queries/clientServices.query";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import { resolveUserEffectiveRoleOnSite } from "@/server/utils/userSiteAttributions.utils";
import { insertExecutionFormSchema } from "@/zod-schemas/clientServiceExecutions.schema";
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

// ==================== GET PRESTATAIRES FOR SERVICE ====================

export const getPrestatairesForServiceAction = actionClient
  .metadata({ actionName: "getPrestatairesForServiceAction" })
  .inputSchema(
    z.object({
      serviceId: z.string().uuid("ID du service invalide"),
      entrepriseId: z.string().uuid("ID de l'entreprise invalide"),
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

    const prestataires = await getPrestatairesForService(parsedInput.serviceId);
    return { prestataires };
  });

// ==================== INSERT EXECUTION WITH PRIX ====================

export const insertExecutionWithPrixAction = actionClient
  .metadata({ actionName: "insertExecutionWithPrixAction" })
  .inputSchema(insertExecutionFormSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { prestationId, entrepriseId, siteId } = parsedInput;

    // Vérifier les permissions
    const canManage = await canManagePrestation(
      currentUser.id,
      entrepriseId,
      siteId,
    );
    if (!canManage) {
      throw errors.forbidden(
        "Vous devez être responsable de ce site pour gérer les prestataires.",
      );
    }

    // Vérifier que la prestation appartient bien à l'entreprise
    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    // Déterminer si l'utilisateur est plateforme pour la logique des marges
    const platformRole = await getUserPlateformeAdhesion(currentUser.id);
    const isIntermedaire =
      prestation.modeCommercial === "intermediaire_fm4all" &&
      !!platformRole?.role;

    // Transaction : créer l'exécution + les prix
    await db.transaction(async (tx) => {
      const [execution] = await tx
        .insert(clientServiceExecutions)
        .values({
          clientServiceId: prestationId,
          siteId,
          serviceEntrepriseId: parsedInput.serviceEntrepriseId,
          dateDebutValidite: new Date(parsedInput.dateDebutValidite),
          dateFinValidite: parsedInput.dateFinValidite
            ? new Date(parsedInput.dateFinValidite)
            : null,
          priorite: Number(parsedInput.priorite),
          actif: true,
          createdById: currentUser.id,
          updatedById: currentUser.id,
        })
        .returning();

      if (!execution) {
        throw errors.internal("Échec de la création de l'exécution.");
      }

      // Insérer les lignes de prix
      await tx.insert(clientServiceExecutionPrix).values(
        parsedInput.prix.map((p) => {
          if (isIntermedaire) {
            // Mode intermédiaire FM4ALL : stocker coût, marge, et recalculer montant côté serveur
            const cout =
              p.coutPrestataireHt && p.coutPrestataireHt !== ""
                ? Number(p.coutPrestataireHt)
                : 0;
            const marge =
              p.margePourcent && p.margePourcent !== ""
                ? Math.round(Number(p.margePourcent))
                : 0;
            const montant = cout * (1 + marge / 100);
            return {
              executionId: execution.id,
              typePrix: p.typePrix,
              montantHt: Math.round(montant * 100),
              coutPrestataireHt: Math.round(cout * 100),
              margePourcent: marge,
              periodeFacturation: p.periodeFacturation ?? null,
              nbOccurrencesIncluses:
                p.nbOccurrencesIncluses && p.nbOccurrencesIncluses !== ""
                  ? Number(p.nbOccurrencesIncluses)
                  : null,
              actif: true,
              createdById: currentUser.id,
              updatedById: currentUser.id,
            };
          }
          // Mode direct (ou non-plateforme sur intermédiaire) : stocker uniquement montantHt
          return {
            executionId: execution.id,
            typePrix: p.typePrix,
            montantHt: Math.round(Number(p.montantHt) * 100),
            coutPrestataireHt: null,
            margePourcent: null,
            periodeFacturation: p.periodeFacturation ?? null,
            nbOccurrencesIncluses:
              p.nbOccurrencesIncluses && p.nbOccurrencesIncluses !== ""
                ? Number(p.nbOccurrencesIncluses)
                : null,
            actif: true,
            createdById: currentUser.id,
            updatedById: currentUser.id,
          };
        }),
      );
    });

    // Backfill : assigner l'exécution aux occurrences non assignées si prestation active + planifiée
    if (prestation.statut === "actif" && prestation.modePlanning === "planifie") {
      const { backfillOccurrencesWithExecution } = await import(
        "@/server/utils/clientServiceOccurrences.utils"
      );
      await backfillOccurrencesWithExecution({ clientServiceId: prestationId, now: new Date() });
    }

    // Recharger les exécutions mises à jour
    const updatedExecutions =
      await getExecutionsWithPrixByPrestationId(prestationId);
    return { message: "Prestataire ajouté avec succès.", executions: updatedExecutions };
  });

// ==================== TOGGLE EXECUTION ACTIF ====================

export const toggleExecutionActifAction = actionClient
  .metadata({ actionName: "toggleExecutionActifAction" })
  .inputSchema(
    z.object({
      executionId: z.string().uuid("ID de l'exécution invalide"),
      prestationId: z.string().uuid("ID de la prestation invalide"),
      entrepriseId: z.string().uuid("ID de l'entreprise invalide"),
      actif: z.boolean(),
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

    const { executionId, prestationId, entrepriseId } = parsedInput;

    // Charger la prestation pour obtenir le siteId
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
        "Vous devez être responsable de ce site pour gérer les prestataires.",
      );
    }

    // Vérifier que l'exécution appartient à la prestation
    const [execution] = await db
      .select({ id: clientServiceExecutions.id })
      .from(clientServiceExecutions)
      .where(
        and(
          eq(clientServiceExecutions.id, executionId),
          eq(clientServiceExecutions.clientServiceId, prestationId),
        ),
      )
      .limit(1);

    if (!execution) {
      throw errors.notFound("Exécution");
    }

    await db
      .update(clientServiceExecutions)
      .set({ actif: parsedInput.actif, updatedById: currentUser.id })
      .where(eq(clientServiceExecutions.id, executionId));

    // Backfill : si on active une exécution sur une prestation active + planifiée
    if (parsedInput.actif && prestation.statut === "actif" && prestation.modePlanning === "planifie") {
      const { backfillOccurrencesWithExecution } = await import(
        "@/server/utils/clientServiceOccurrences.utils"
      );
      await backfillOccurrencesWithExecution({ clientServiceId: prestationId, now: new Date() });
    }

    const updatedExecutions =
      await getExecutionsWithPrixByPrestationId(prestationId);
    return {
      message: parsedInput.actif ? "Exécution activée." : "Exécution désactivée.",
      executions: updatedExecutions,
    };
  });

// ==================== DELETE EXECUTION ====================

export const deleteExecutionAction = actionClient
  .metadata({ actionName: "deleteExecutionAction" })
  .inputSchema(
    z.object({
      executionId: z.string().uuid("ID de l'exécution invalide"),
      prestationId: z.string().uuid("ID de la prestation invalide"),
      entrepriseId: z.string().uuid("ID de l'entreprise invalide"),
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

    const { executionId, prestationId, entrepriseId } = parsedInput;

    // Charger la prestation pour obtenir le siteId
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
        "Vous devez être responsable de ce site pour gérer les prestataires.",
      );
    }

    // Vérifier que l'exécution appartient à la prestation
    const [execution] = await db
      .select({ id: clientServiceExecutions.id })
      .from(clientServiceExecutions)
      .where(
        and(
          eq(clientServiceExecutions.id, executionId),
          eq(clientServiceExecutions.clientServiceId, prestationId),
        ),
      )
      .limit(1);

    if (!execution) {
      throw errors.notFound("Exécution");
    }

    // Supprimer (cascade sur les prix via FK)
    await db
      .delete(clientServiceExecutions)
      .where(eq(clientServiceExecutions.id, executionId));

    const updatedExecutions =
      await getExecutionsWithPrixByPrestationId(prestationId);
    return { message: "Prestataire retiré avec succès.", executions: updatedExecutions };
  });

// ==================== GET EXECUTIONS ====================

export const getExecutionsAction = actionClient
  .metadata({ actionName: "getExecutionsAction" })
  .inputSchema(
    z.object({
      prestationId: z.string().uuid("ID de la prestation invalide"),
      entrepriseId: z.string().uuid("ID de l'entreprise invalide"),
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

    const prestation = await getPrestationById(parsedInput.prestationId);
    if (!prestation || prestation.entrepriseId !== parsedInput.entrepriseId) {
      throw errors.notFound("Prestation");
    }

    const executions = await getExecutionsWithPrixByPrestationId(
      parsedInput.prestationId,
    );
    return { executions };
  });
