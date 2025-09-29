import { fruitsOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectFruitsOffreSchema = createSelectSchema(fruitsOffres, {
  prixKg: (schema) => schema.min(1, "Le prix par kg est obligatoire"),
});

export type SelectFruitsOffreType = typeof selectFruitsOffreSchema._type;
