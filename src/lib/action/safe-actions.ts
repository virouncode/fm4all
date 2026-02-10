import { errors } from "@/lib/action/errors"; // du fichier errors.ts que je t'ai donné
import type { ApiError } from "@/lib/action/result";
import { createSafeActionClient } from "next-safe-action";
import { z, ZodError } from "zod";

function isDbError(e: Error) {
  const name = e.constructor?.name;
  const msg = e.message ?? "";
  return (
    name === "NeonDbError" ||
    name === "DrizzleError" ||
    msg.startsWith("Failed query:")
  );
}

/**
 * ⚠️ Ce que handleServerError doit représenter :
 * - uniquement les "crash" inattendus (exceptions non gérées)
 * - jamais les erreurs métier attendues (forbidden, notFound, conflict, etc.)
 */
export const actionClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
      requestId: z.string().optional(), // utile si tu veux le passer depuis le client/SSR
    });
  },

  handleServerError(error, utils): ApiError {
    const { clientInput, metadata } = utils;

    // Log complet côté serveur
    console.error("[Server action error]", {
      actionName: metadata?.actionName,
      requestId: metadata?.requestId,
      name: error.constructor?.name,
      message: error.message,
      cause: error.cause,
      clientInput,
    });

    // 1) Erreurs DB / infra
    if (isDbError(error)) {
      return errors.dependency(
        "Erreur de base de données : impossible de sauvegarder vos données.",
        { actionName: metadata?.actionName, requestId: metadata?.requestId },
      );
    }

    // 2) ZodError: en théorie rare ici (next-safe-action sort validationErrors)
    if (error instanceof ZodError) {
      return errors.validation("Données invalides fournies.", undefined, {
        actionName: metadata?.actionName,
        requestId: metadata?.requestId,
      });
    }

    // 3) Défaut : erreur interne générique
    return errors.internal(
      "Une erreur inattendue est survenue. Merci de réessayer.",
      {
        actionName: metadata?.actionName,
        requestId: metadata?.requestId,
      },
    );
  },
});
