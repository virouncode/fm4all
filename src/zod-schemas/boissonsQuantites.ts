import { boissonsQuantites } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectBoissonsQuantitesSchema = createSelectSchema(
  boissonsQuantites,
  {
    effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
    consosParSemaine: (schema) =>
      schema.min(1, "Le nombre de consommations par semaine est obligatoire"),
  }
);

export type SelectBoissonsQuantitesType =
  typeof selectBoissonsQuantitesSchema._type;
