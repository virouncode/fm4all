import { fruitsQuantites } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectFruitsQuantitesSchema = createSelectSchema(fruitsQuantites, {
  gParSemaineParPersonne: (schema) =>
    schema.min(1, "Le nombre de g par semaine par personne obligatoire"),
  minKgParSemaine: (schema) =>
    schema.min(1, "Le nombre minimum de kg par semaine obligatoire"),
});

export type SelectFruitsQuantitesType =
  typeof selectFruitsQuantitesSchema._type;
