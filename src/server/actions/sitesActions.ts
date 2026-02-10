"use server";
import { db } from "@/db";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import { getClientSites } from "@/server/queries_a_classer/clients/getClients";
import {
  insertSiteSchema,
  insertSiteToDbSchema,
  sitesQueryBackendSchema,
  updateSiteInDbSchema,
  updateSiteSchema,
} from "@/zod-schemas/site";
import { eq } from "drizzle-orm";
import { getLocale } from "next-intl/server";
import { flattenValidationErrors } from "next-safe-action";
import { z } from "zod";
import { sites } from "../db/schema";

export const getSitesAction = actionClient
  .metadata({ actionName: "getTicketsAction" })
  .inputSchema(sitesQueryBackendSchema, {
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
    const sites = await getClientSites({ clientId, query: parsedInput });
    return sites;
  });

export const insertSiteAction = actionClient
  .metadata({ actionName: "insertSiteAction" })
  .inputSchema(insertSiteSchema, {
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
          ? "Utilisateur non rattaché à une entreprise cliente."
          : "User not associated with a client company.",
      );
    }

    const createdById = currentUser.id;
    const updatedById = currentUser.id;

    const payload = insertSiteToDbSchema.parse({
      ...parsedInput,
      clientId,
      createdById,
      updatedById,
    });

    const [insertedSite] = await db.insert(sites).values(payload).returning();
    if (!insertedSite) {
      throw new Error(
        locale === "fr"
          ? "Échec de la création du site. Veuillez réessayer."
          : "Failed to create site. Please try again.",
      );
    }

    return {
      message:
        locale === "fr"
          ? "Site créé avec succès."
          : "Site created successfully.",
      site: insertedSite,
    };
  });

export const updateSiteAction = actionClient
  .metadata({ actionName: "updateSiteAction" })
  .inputSchema(updateSiteSchema, {
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
          ? "Utilisateur non rattaché à une entreprise cliente."
          : "User not associated with a client company.",
      );
    }

    const updatedById = currentUser.id;

    const [existingSite] = await db
      .select()
      .from(sites)
      .where(eq(sites.id, parsedInput.id));

    if (!existingSite) {
      throw new Error(
        locale === "fr"
          ? "Site introuvable ou inaccessible."
          : "Site not found or not accessible.",
      );
    }

    const payload = updateSiteInDbSchema.parse({
      ...parsedInput,
      updatedById,
    });

    const [updatedSite] = await db
      .update(sites)
      .set(payload)
      .where(eq(sites.id, parsedInput.id))
      .returning();

    if (!updatedSite) {
      throw new Error(
        locale === "fr"
          ? "Échec de la mise à jour du site. Veuillez réessayer."
          : "Failed to update site. Please try again.",
      );
    }

    return {
      message:
        locale === "fr"
          ? "Site mis à jour avec succès."
          : "Site updated successfully.",
      site: updatedSite,
    };
  });

// Schema pour l'action admin avec clientId
const getClientSitesForAdminSchema = sitesQueryBackendSchema.extend({
  clientId: z.number().int().positive("ID du client invalide"),
});

// Action pour récupérer les sites d'un client spécifique (admin uniquement)
export const getClientSitesForAdminAction = actionClient
  .metadata({ actionName: "getClientSitesForAdminAction" })
  .inputSchema(getClientSitesForAdminSchema, {
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

    const { clientId, ...query } = parsedInput;
    const sites = await getClientSites({ clientId, query });
    return sites;
  });

// ======================= ADMIN: getAllSitesAction ==========================//

import { getAllSitesWithPagination } from "@/server/queries_a_classer/sites/getSites";
import { adminSitesQueryBackendSchema } from "@/zod-schemas/site";

export const getAllSitesAction = actionClient
  .metadata({ actionName: "getAllSitesAction" })
  .inputSchema(adminSitesQueryBackendSchema, {
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

    const sites = await getAllSitesWithPagination({
      query: parsedInput,
    });

    return sites;
  });
