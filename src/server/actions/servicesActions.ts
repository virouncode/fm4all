"use server";

import { db } from "@/db";
import { services } from "@/db/schema/services";
import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import { getServicesWithStats } from "@/server/queries/services.query";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import { normalizeForSubmit } from "@/zod-helpers/normalize";
import {
  insertServiceFormSchema,
  serviceSelectSchema,
  updateServiceFormSchema,
} from "@/zod-schemas/service.schema";
import { eq } from "drizzle-orm";
import { getAllServices } from "@/server/queries/services.query";

/**
 * Récupère la liste de tous les services du catalogue
 * Utilisé pour alimenter les selects dans les formulaires
 */
export const getServicesAction = actionClient
  .metadata({ actionName: "getServicesAction" })
  .action(async () => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    const data = await getAllServices();
    return { services: data };
  });

/**
 * Get all services with client/prestataire stats — plateforme only
 */
export const getServicesWithStatsAction = actionClient
  .metadata({ actionName: "getServicesWithStatsAction" })
  .action(async () => {
    const session = await getSession();
    if (!session?.user) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const plateformeRole = await getUserPlateformeAdhesion(session.user.id);
    if (!plateformeRole)
      throw errors.forbidden("Réservé aux membres de la plateforme FM4ALL.");

    const data = await getServicesWithStats();
    return { services: data };
  });

/**
 * Create a new service — plateforme only
 */
export const insertServiceAction = actionClient
  .metadata({ actionName: "insertServiceAction" })
  .schema(insertServiceFormSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const plateformeRole = await getUserPlateformeAdhesion(session.user.id);
    if (!plateformeRole)
      throw errors.forbidden("Réservé aux membres de la plateforme FM4ALL.");

    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: ["description"] as const,
    });

    const [inserted] = await db
      .insert(services)
      .values({
        nom: normalized.nom,
        description: normalized.description,
        createdById: session.user.id,
        updatedById: session.user.id,
      })
      .returning();

    const service = serviceSelectSchema.parse(inserted);
    return { service };
  });

/**
 * Update a service description — plateforme only
 */
export const updateServiceAction = actionClient
  .metadata({ actionName: "updateServiceAction" })
  .schema(updateServiceFormSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const plateformeRole = await getUserPlateformeAdhesion(session.user.id);
    if (!plateformeRole)
      throw errors.forbidden("Réservé aux membres de la plateforme FM4ALL.");

    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: ["description"] as const,
    });

    const [updated] = await db
      .update(services)
      .set({
        nom: normalized.nom,
        description: normalized.description,
        updatedById: session.user.id,
      })
      .where(eq(services.id, normalized.id))
      .returning();

    const service = serviceSelectSchema.parse(updated);
    return { service };
  });
