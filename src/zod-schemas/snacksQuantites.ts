import { snacksQuantites } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectSnacksQuantitesSchema = createSelectSchema(snacksQuantites, {
  portionsParSemaineParPersonne: (schema) =>
    schema.min(
      1,
      "Le nombre de portions par semaine par personne est obligatoire"
    ),
  minPortionsParSemaine: (schema) =>
    schema.min(1, "Le nombre minimum de portions par semaine est obligatoire"),
});

export type SelectSnacksQuantitesType =
  typeof selectSnacksQuantitesSchema._type;
