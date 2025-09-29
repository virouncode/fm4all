import { cafeConsoOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectCafeConsoOffreSchema = createSelectSchema(cafeConsoOffres, {
  prixUnitaire: (schema) => schema.min(1, "Le prix unitaire est obligatoire"),
});

export type SelectCafeConsoOffreType = typeof selectCafeConsoOffreSchema._type;
