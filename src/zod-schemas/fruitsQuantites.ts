import { fruitsQuantites } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectFruitsQuantitesSchema = createSelectSchema(fruitsQuantites, {
  effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
  kilosParSemaine: (schema) =>
    schema.min(1, "Le nombre de kilos par semaine est obligatoires"),
});

export type SelectFruitsQuantitesType =
  typeof selectFruitsQuantitesSchema._type;
