import { officeManagerQuantites } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectOfficeManagerQuantitesSchema = createSelectSchema(
  officeManagerQuantites,
  {
    effectif: (schema) =>
      schema
        .min(1, "L'effectif soit être compris en tre 1 et 300")
        .max(300, "L'effectif soit être compris entre 1 et 300"),
    surface: (schema) =>
      schema
        .min(50, "La surface doit comprise entre 50 et 3000")
        .max(3000, "La surface doit comprise entre 50 et 3000"),
    demiJParSemaine: (schema) =>
      schema.min(
        1,
        "Le nombre de demi-journées par semaine doit être au moins de 1"
      ),
  }
);

export type SelectOfficeManagerQuantitesType =
  typeof selectOfficeManagerQuantitesSchema._type;
