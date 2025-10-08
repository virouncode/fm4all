import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
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
    console.log("Server error", error.message, clientInput, metadata); //log interne
    //plus tard on pourra logger dans un service externe (sentry, logrocket, etc)
    if (error.constructor.name === "NeonDbError") {
      //si c'est une erreur de la base de données, on renvoie un message générique pour ne pas exposer de détails
      return "Erreur de base de données : impossible de sauvegarder vos données.";
    }
    return error.message; //sinon on renvoie le message d'erreur tel quel
  },
});
