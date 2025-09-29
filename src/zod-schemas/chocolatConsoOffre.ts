import { chocolatConsoOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectChocolatConsoOffreSchema = createSelectSchema(
  chocolatConsoOffres,
  {
    prixUnitaire: (schema) => schema.min(1, "Le prix unitaire est obligatoire"),
  },
);

export type SelectChocolatConsoOffreType =
  typeof selectChocolatConsoOffreSchema._type;
