import { incendieQuantites } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectIncendieQuantitesSchema = createSelectSchema(
  incendieQuantites,
  {
    surface: (schema) => schema.min(1, "La surface est obligatoire"),
    nbExtincteurs: (schema) =>
      schema.min(1, "Le nombre d'extincteurs est obligatoire"),
  }
);

export type SelectIncendieQuantitesType =
  typeof selectIncendieQuantitesSchema._type;
