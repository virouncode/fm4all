import { boissonsTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectBoissonsTarifsSchema = createSelectSchema(boissonsTarifs, {
  effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
  prixUnitaire: (schema) => schema.min(0, "Le prix unitaire est obligatoire"),
}).extend({
  nomEntreprise: z.string().nonempty("Le nom du fournisseur est obligatoire"),
  slogan: z.string().nullable(),
});

export type SelectBoissonsTarifsType = typeof selectBoissonsTarifsSchema._type;
