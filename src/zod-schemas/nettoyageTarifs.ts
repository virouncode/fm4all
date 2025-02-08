import { nettoyageTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectNettoyageTarifsSchema = createSelectSchema(nettoyageTarifs, {
  hParPassage: (schema) =>
    schema.min(1, "Le nombre d'heures moyen par passage est obligatoire"),
  tauxHoraire: (schema) => schema.min(1, "Le taux horaire est obligatoire"),
  surface: (schema) => schema.min(1, "La surface est obligatoire"),
}).extend({
  nomFournisseur: z.string().nonempty("Nom de fournisseur invalide"),
  slogan: z.string().nullable(),
});

export type SelectNettoyageTarifsType =
  typeof selectNettoyageTarifsSchema._type;
