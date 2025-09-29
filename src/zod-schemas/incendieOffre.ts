import { incendieOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectIncendieOffreSchema = createSelectSchema(incendieOffres, {
  prixUnitaire: (schema) => schema.min(1, "Le prix unitaire est obligatoire"),
});
export type SelectIncendieOffreType = typeof selectIncendieOffreSchema._type;
