import { nettoyageVitrerieOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
export const selectNettoyageVitrerieOffreSchema = createSelectSchema(
  nettoyageVitrerieOffres,
  {
    tauxHoraire: (schema) => schema.min(1, "Le taux horaire est obligatoire"),
  },
);

export type SelectNettoyageVitrerieOffreType =
  typeof selectNettoyageVitrerieOffreSchema._type;
