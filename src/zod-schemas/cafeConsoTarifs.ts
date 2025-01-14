import { cafeConsoTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectCafeConsoTarifsSchema = createSelectSchema(cafeConsoTarifs, {
  effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
  prixUnitaire: (schema) => schema.min(1, "Le prix unitaire est obligatoire"),
}).extend({
  nomEntreprise: z.string().nonempty("Le nom du fournisseur est obligatoire"),
  slogan: z.string().nullable(),
});

export type SelectCafeConsoTarifsType =
  typeof selectCafeConsoTarifsSchema._type;
