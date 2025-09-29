import { exutoiresOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectExutoireOffreSchema = createSelectSchema(exutoiresOffres, {
  prixUnitaire: (schema) => schema.min(1, "Le prix unitaire est obligatoire"),
});

export type SelectExutoireOffreType = typeof selectExutoireOffreSchema._type;
