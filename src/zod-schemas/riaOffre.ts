import { riaOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectRiaOffreSchema = createSelectSchema(riaOffres, {
  prixUnitaire: (schema) => schema.min(1, "Le prix unitaire est obligatoire"),
});

export type SelectRiaOffreType = typeof selectRiaOffreSchema._type;
