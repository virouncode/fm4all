import { boissonsQuantites } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectBoissonsQuantitesSchema = createSelectSchema(
  boissonsQuantites,
  {
    consosParSemaineParPersonne: (schema) =>
      schema.min(
        1,
        "Le nombre de consommations par semaine par personne est obligatoire",
      ),
    minConsosParSemaine: (schema) =>
      schema.min(
        1,
        "Le nombre minimum de consommations par semaine est obligatoire",
      ),
  },
);

export type SelectBoissonsQuantitesType =
  z.infer<typeof selectBoissonsQuantitesSchema>;
