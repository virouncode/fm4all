import { nettoyageRepasseOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectNettoyageRepasseOffreSchema = createSelectSchema(
  nettoyageRepasseOffres,
  {
    tauxHoraire: (schema) => schema.min(1, "Le taux horaire est obligatoire"),
  },
);

export type SelectNettoyageRepasseOffreType =
  typeof selectNettoyageRepasseOffreSchema._type;
