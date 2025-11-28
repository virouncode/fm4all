"use server";
import { db } from "@/db";
import { interventions } from "@/db/schema/interventions";
import { getSession } from "@/lib/auth-session";
import { getInterventions } from "@/lib/queries/interventions/getInterventions";
import { actionClient } from "@/lib/safe-actions";
import {
  insertInterventionSchema,
  interventionsQueryBackendSchema,
  selectInterventionSchema,
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

    const result = await db.transaction(async (tx) => {
      const [insertedIntervention] = await tx
        .insert(interventions)
        .values({
          ...parsedInput,
          createdById,
          updatedById,
          ...(currentUser.role === "client"
            ? { clientConfirmedAt: new Date() }
            : {}),
          ...(currentUser.role === "fournisseur"
            ? { fournisseurConfirmedAt: new Date() }
            : {}),
        })
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
    const clientId = currentUser.clientId;
    if (!clientId) {
      throw new Error(
        locale === "fr"
          ? "Utilisateur non rattaché à une entreprise cliente"
          : "User not associated with a client company",
      );
    }

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
          eq(interventions.clientId, clientId),
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

    const userRole = currentUser.role;
    const isClient = userRole === "client";
    const isFournisseur = userRole === "fournisseur";

    const oldDebutDate = existingIntervention.dateDebutPrevue;
    const newDebutDate = parsedInput.dateDebutPrevue;
    const oldFinDate = existingIntervention.dateFinPrevue;
    const newFinDate = parsedInput.dateFinPrevue;

    const debutHasChanged =
      newDebutDate &&
      oldDebutDate &&
      new Date(newDebutDate).getTime() !== new Date(oldDebutDate).getTime();

    const finHasChanged =
      newFinDate &&
      oldFinDate &&
      new Date(newFinDate).getTime() !== new Date(oldFinDate).getTime();

    const datesHaveChanged = debutHasChanged || finHasChanged;

    const wasPlanifiee = existingIntervention.status === "planifiee";

    // On travaille sur parsedInput, mais on NE met que ce qu’on veut vraiment changer
    if (datesHaveChanged) {
      if (wasPlanifiee) {
        // ----- Cas 1 : date changée et intervention planifiée -----
        parsedInput.status = "en_attente_confirmation";

        // reset des confirmations
        parsedInput.confirmeeClient = false;
        parsedInput.confirmeeFournisseur = false;
        parsedInput.clientConfirmedAt = null;
        parsedInput.fournisseurConfirmedAt = null;

        // puis on marque l'initiateur comme confirmé
        if (isClient) {
          parsedInput.confirmeeClient = true;
          parsedInput.clientConfirmedAt = new Date();
        } else if (isFournisseur) {
          parsedInput.confirmeeFournisseur = true;
          parsedInput.fournisseurConfirmedAt = new Date();
        }
      } else {
        // ----- Cas 2 : date changée mais pas encore planifiée -----
        if (isClient) {
          parsedInput.confirmeeClient = true;
          parsedInput.clientConfirmedAt = new Date();
          parsedInput.confirmeeFournisseur = false;
          parsedInput.fournisseurConfirmedAt = null;
        } else if (isFournisseur) {
          parsedInput.confirmeeFournisseur = true;
          parsedInput.fournisseurConfirmedAt = new Date();
          parsedInput.confirmeeClient = false;
          parsedInput.clientConfirmedAt = null;
        }
        // status reste par ex. "en_attente_confirmation"
      }
    } else {
      // ----- Cas 3 : pas de changement de date -----
      if (isClient) {
        if (!existingIntervention.confirmeeClient) {
          parsedInput.confirmeeClient = true;
          parsedInput.clientConfirmedAt = new Date();
        }
      } else if (isFournisseur) {
        if (!existingIntervention.confirmeeFournisseur) {
          parsedInput.confirmeeFournisseur = true;
          parsedInput.fournisseurConfirmedAt = new Date();
        }
      }

      // Si les deux sont confirmés (après cette éventuelle maj), on planifie
      const clientConfirmed =
        parsedInput.confirmeeClient ?? existingIntervention.confirmeeClient;
      const fournisseurConfirmed =
        parsedInput.confirmeeFournisseur ??
        existingIntervention.confirmeeFournisseur;

      if (clientConfirmed && fournisseurConfirmed) {
        parsedInput.status = "planifiee";
      }
    }

    const [updatedIntervention] = await db
      .update(interventions)
      .set({
        ...parsedInput,
        updatedById,
      })
      .where(
        and(
          eq(interventions.id, interventionId),
          eq(interventions.clientId, clientId),
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
