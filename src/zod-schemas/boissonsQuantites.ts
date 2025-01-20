import { boissonsQuantites } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectBoissonsQuantitesSchema = createSelectSchema(
  boissonsQuantites,
  {
    consosParSemaineParPersonne: (schema) =>
      schema.min(
        1,
        "Le nombre de consommations par semaine par personne est obligatoire"
      ),
    minConsosParSemaine: (schema) =>
      schema.min(
        1,
        "Le nombre minimum de consommations par semaine est obligatoire"
      ),
  }
);

export type SelectBoissonsQuantitesType =
  typeof selectBoissonsQuantitesSchema._type;
