import { colonnesSechesOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectColonneSecheOffreSchema = createSelectSchema(
  colonnesSechesOffres,
  {
    prixUnitaire: (schema) => schema.min(1, "Le prix unitaire est obligatoire"),
  },
);

export type SelectColonneSecheOffreType =
  typeof selectColonneSecheOffreSchema._type;
