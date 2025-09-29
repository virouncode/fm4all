import { nettoyageOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectNettoyageOffreSchema = createSelectSchema(nettoyageOffres, {
  tauxHoraire: (schema) => schema.min(1, "Le taux horaire est obligatoire"),
});

export type SelectNettoyageOffreType = typeof selectNettoyageOffreSchema._type;
