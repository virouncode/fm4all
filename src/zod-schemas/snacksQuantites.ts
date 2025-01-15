import { snacksQuantites } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectSnacksQuantitesSchema = createSelectSchema(snacksQuantites, {
  effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
  portionsParSemaine: (schema) =>
    schema.min(1, "Le nombre de portions par semaine est obligatoire"),
});

export type SelectSnacksQuantitesType =
  typeof selectSnacksQuantitesSchema._type;
