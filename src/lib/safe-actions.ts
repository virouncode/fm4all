import { createSafeActionClient } from "next-safe-action";
import { z, ZodError } from "zod";
//client d'actions global avec config commune
export const actionClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
    });
  },
  //Intercepte tous les throws des server actions et les filtre/loggue/modifie avant de renvoyer au client dans serverError
  handleServerError(error, utils) {
    const { clientInput, metadata } = utils;

    // Log complet côté serveur
    console.error("[Server action error]", {
      name: error.constructor.name,
      message: error.message,
      cause: (error as any).cause,
      clientInput,
      metadata,
    });

    // 1) Erreurs DB
    const isDbError =
      error.constructor.name === "NeonDbError" ||
      error.constructor.name === "DrizzleError" ||
      error.message.startsWith("Failed query:");

    if (isDbError) {
      return "Erreur de base de données : impossible de sauvegarder vos données.";
    }
    // 2) Erreurs de validation
    if (error instanceof ZodError) {
      return "Données invalides fournies.";
    }
    // 3) Par défaut : message générique, pas error.message
    return "Une erreur inattendue est survenue. Merci de réessayer.";
  },
});
