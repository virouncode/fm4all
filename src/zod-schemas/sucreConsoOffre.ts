import { sucreConsoOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectSucreConsoOffreSchema = createSelectSchema(
  sucreConsoOffres,
  {
    prixUnitaire: (schema) => schema.min(1, "Le prix unitaire est obligatoire"),
  },
);

export type SelectSucreConsoOffreType =
  typeof selectSucreConsoOffreSchema._type;
