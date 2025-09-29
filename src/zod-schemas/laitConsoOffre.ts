import { laitConsoOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectLaitConsoOffreSchema = createSelectSchema(laitConsoOffres, {
  prixUnitaire: (schema) => schema.min(1, "Le prix unitaire est obligatoire"),
});

export type SelectLaitConsoOffreType = typeof selectLaitConsoOffreSchema._type;
