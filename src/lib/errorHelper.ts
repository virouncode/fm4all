import { z } from "zod";

export const errorHelper = (err: unknown) => {
  if (err instanceof z.ZodError) {
    const messages = err.issues
      .map((issue) => `${issue.path[0]} : ${issue.message}`)
      .join(", ");
    console.error(`Erreurs de validation du schéma : ${messages}`);
    throw new Error(
      "Échec de la récupération des données : le schéma est invalide."
    );
  } else if (err instanceof Error) {
    console.error(`Erreur : ${err.message}`);
    throw new Error(`Échec de la récupération des données : ${err.message}`);
  } else {
    console.error("Erreur inconnue:", err);
    throw new Error("Échec de la récupération des données : erreur inconnue.");
  }
};
