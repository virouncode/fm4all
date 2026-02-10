"use server";
import { db } from "@/db";
import { interventions } from "@/db/schema/interventions";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import { getInterventions } from "@/server/queries_a_classer/interventions/getInterventions";
import {
  insertInterventionSchema,
  insertInterventionToDbSchema,
  interventionsQueryBackendSchema,
  selectInterventionSchema,
  updateInterventionInDbSchema,
  updateInterventionSchema,
} from "@/zod-schemas/intervention";
import { and, eq } from "drizzle-orm";
import { getLocale } from "next-intl/server";
import { flattenValidationErrors } from "next-safe-action";

export const getInterventionsAction = actionClient
  .metadata({ actionName: "getInterventionsAction" })
  .inputSchema(interventionsQueryBackendSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    const locale = await getLocale();
    if (!currentUser) {
      throw new Error(
        locale === "fr"
          ? "Vous n'êtes pas authentifié."
          : "You are not authenticated.",
      );
    }
    if (!currentUser.clientId) {
      throw new Error(
        locale === "fr"
          ? "Utilisateur non rattaché à une entreprise cliente"
          : "User not associated with a client company",
      );
    }
    const clientId = currentUser.clientId;
    const interventions = await getInterventions({
      clientId,
      query: parsedInput,
    });
    return interventions;
  });

export const insertInterventionAction = actionClient
  .metadata({ actionName: "insertInterventionAction" })
  .inputSchema(insertInterventionSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    const locale = await getLocale();
    if (!currentUser) {
      throw new Error(
        locale === "fr"
          ? "Vous n'êtes pas authentifié."
          : "You are not authenticated.",
      );
    }
    const createdById = currentUser.id;
    const updatedById = currentUser.id;

    const payload = insertInterventionToDbSchema.parse({
      ...parsedInput,
      createdById,
      updatedById,
      confirmeeClient: currentUser.role.startsWith("client"),
      confirmeeFournisseur: currentUser.role.startsWith("fournisseur"),
      clientConfirmedAt: currentUser.role.startsWith("client")
        ? new Date()
        : null,
      fournisseurConfirmedAt: currentUser.role.startsWith("fournisseur")
        ? new Date()
        : null,
    });

    const result = await db.transaction(async (tx) => {
      const [insertedIntervention] = await tx
        .insert(interventions)
        .values(payload)
        .returning();
      if (!insertedIntervention) {
        throw new Error(
          locale === "fr"
            ? "Échec de la programmation de l'intervention."
            : "Failed to schedule intervention.",
        );
      }
      return selectInterventionSchema.parse(insertedIntervention);
    });

    return {
      message:
        locale === "fr"
          ? "Intervention programmée avec succès. Veuillez attendre la confirmation du prestaire."
          : "Intervention scheduled successfully. Please wait for provider confirmation.",
      intervention: result,
    };
  });

export const updateInterventionAction = actionClient
  .metadata({ actionName: "updateInterventionAction" })
  .inputSchema(updateInterventionSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    const locale = await getLocale();
    if (!currentUser) {
      throw new Error(
        locale === "fr"
          ? "Vous n'êtes pas authentifié."
          : "You are not authenticated.",
      );
    }
    const clientId = currentUser.clientId; //l'utilisateur est un client
    const fournisseurId = currentUser.fournisseurId; //l'utilisateur est un fournisseur
    const userRole = currentUser.role;
    const isClient = userRole.startsWith("client");
    const isFournisseur = userRole.startsWith("fournisseur");
    // if (!clientId) {
    //   throw new Error(
    //     locale === "fr"
    //       ? "Utilisateur non rattaché à une entreprise cliente"
    //       : "User not associated with a client company",
    //   );
    // }

    const interventionId = parsedInput.id;

    if (!interventionId) {
      throw new Error(
        locale === "fr"
          ? "ID de l'intervention obligatoire pour la mise à jour."
          : "Intervention ID required for update.",
      );
    }
    const updatedById = currentUser.id;
    const [existingIntervention] = await db
      .select()
      .from(interventions)
      .where(
        and(
          eq(interventions.id, interventionId),
          clientId
            ? eq(interventions.clientId, clientId)
            : fournisseurId
              ? eq(interventions.fournisseurId, fournisseurId)
              : undefined,
        ),
      )
      .limit(1);

    if (!existingIntervention) {
      throw new Error(
        locale === "fr"
          ? "Intervention introuvable ou non accessible."
          : "Intervention not found or not accessible.",
      );
    }

    const oldDebutDate = existingIntervention.dateDebutPrevue;
    const newDebutDate = parsedInput.dateDebutPrevue;
    const oldFinDate = existingIntervention.dateFinPrevue;
    const newFinDate = parsedInput.dateFinPrevue;

    const debutHasChanged =
      oldDebutDate !== newDebutDate &&
      !(oldDebutDate == null && newDebutDate == null);

    const finHasChanged =
      oldFinDate !== newFinDate && !(oldFinDate == null && newFinDate == null);

    const datesHaveChanged = debutHasChanged || finHasChanged;

    const wasPlanifiee = existingIntervention.status === "planifiee";
    let confirmeeClient: boolean = existingIntervention.confirmeeClient;
    let confirmeeFournisseur: boolean =
      existingIntervention.confirmeeFournisseur;
    let clientConfirmedAt: Date | null = existingIntervention.clientConfirmedAt;
    let fournisseurConfirmedAt: Date | null =
      existingIntervention.fournisseurConfirmedAt;

    // On travaille sur parsedInput, mais on NE met que ce qu’on veut vraiment changer
    if (datesHaveChanged) {
      if (wasPlanifiee) {
        // ----- Cas 1 : date changée et intervention planifiée -----
        parsedInput.status = "en_attente_confirmation";

        // reset des confirmations
        confirmeeClient = false;
        confirmeeFournisseur = false;
        clientConfirmedAt = null;
        fournisseurConfirmedAt = null;
        // puis on marque l'initiateur comme confirmé
        if (isClient) {
          confirmeeClient = true;
          clientConfirmedAt = new Date();
        } else if (isFournisseur) {
          confirmeeFournisseur = true;
          fournisseurConfirmedAt = new Date();
        }
      } else {
        // ----- Cas 2 : date changée mais pas encore planifiée -----
        if (isClient) {
          confirmeeClient = true;
          clientConfirmedAt = new Date();
          confirmeeFournisseur = false;
          fournisseurConfirmedAt = null;
        } else if (isFournisseur) {
          confirmeeFournisseur = true;
          fournisseurConfirmedAt = new Date();
          confirmeeClient = false;
          clientConfirmedAt = null;
        }
        // status reste par ex. "en_attente_confirmation"
      }
    } else {
      // ----- Cas 3 : pas de changement de date -----
      if (isClient) {
        if (!existingIntervention.confirmeeClient) {
          confirmeeClient = true;
          clientConfirmedAt = new Date();
        }
      } else if (isFournisseur) {
        if (!existingIntervention.confirmeeFournisseur) {
          confirmeeFournisseur = true;
          fournisseurConfirmedAt = new Date();
        }
      }

      // Si les deux sont confirmés (après cette éventuelle maj), on planifie
      const clientConfirmed = confirmeeClient;
      const fournisseurConfirmed = confirmeeFournisseur;

      if (clientConfirmed && fournisseurConfirmed) {
        parsedInput.status = "planifiee";
      }
    }

    const payload = updateInterventionInDbSchema.parse({
      ...parsedInput,
      confirmeeClient,
      confirmeeFournisseur,
      clientConfirmedAt,
      fournisseurConfirmedAt,
      updatedById,
    });

    const [updatedIntervention] = await db
      .update(interventions)
      .set(payload)
      .where(
        and(
          eq(interventions.id, interventionId),
          clientId
            ? eq(interventions.clientId, clientId)
            : fournisseurId
              ? eq(interventions.fournisseurId, fournisseurId)
              : undefined,
        ),
      )
      .returning();

    if (!updatedIntervention) {
      throw new Error(
        locale === "fr"
          ? "Échec de la mise à jour de l'intervention."
          : "Failed to update intervention.",
      );
    }

    return {
      message:
        locale === "fr"
          ? "Intervention mise à jour avec succès."
          : "Intervention updated successfully.",
      intervention: selectInterventionSchema.parse(updatedIntervention),
    };
  });

// ======================= ADMIN: getAllInterventionsAction ==========================//
import { getAllInterventions } from "@/server/queries_a_classer/interventions/getInterventions";
import { adminInterventionsQueryBackendSchema } from "@/zod-schemas/intervention";

export const getAllInterventionsAction = actionClient
  .metadata({ actionName: "getAllInterventionsAction" })
  .inputSchema(adminInterventionsQueryBackendSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    const locale = await getLocale();

    if (!currentUser) {
      throw new Error(
        locale === "fr"
          ? "Vous n'êtes pas authentifié."
          : "You are not authenticated.",
      );
    }

    if (currentUser.role !== "admin") {
      throw new Error(
        locale === "fr"
          ? "Vous n'avez pas les droits pour effectuer cette action."
          : "You do not have permission to perform this action.",
      );
    }

    const interventions = await getAllInterventions({
      query: parsedInput,
    });

    return interventions;
  });
