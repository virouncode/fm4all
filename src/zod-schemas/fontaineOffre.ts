import { fontainesOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectFontaineOffreSchema = createSelectSchema(fontainesOffres, {
  prixUnitaire: (schema) => schema.min(1, "Le prix unitaire est obligatoire"),
});

export type SelectFontaineOffreType = typeof selectFontaineOffreSchema._type;
