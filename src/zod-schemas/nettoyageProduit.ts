import { nettoyageProduits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectNettoyageProduitSchema = createSelectSchema(
  nettoyageProduits,
  {
    hParPassage: (schema) =>
      schema.min(1, "Le nombre d'heures moyen par passage est obligatoire"),
    surface: (schema) => schema.min(1, "La surface est obligatoire"),
  },
);

export type SelectNettoyageProduitType =
  typeof selectNettoyageProduitSchema._type;
