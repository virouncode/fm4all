import { snacksOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectSnacksOffreSchema = createSelectSchema(snacksOffres, {
  prixUnitaire: (schema) => schema.min(1, "Le prix unitaire est obligatoire"),
});

export type SelectSnacksOffreType = typeof selectSnacksOffreSchema._type;
