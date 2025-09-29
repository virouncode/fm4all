import { theConsoOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectTheConsoOffreSchema = createSelectSchema(theConsoOffres, {
  prixUnitaire: (schema) => schema.min(1, "Le prix unitaire est obligatoire"),
});

export type SelectTheConsoOffreType = typeof selectTheConsoOffreSchema._type;
