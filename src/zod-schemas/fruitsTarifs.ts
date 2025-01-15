import { fruitsTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectFruitsTarifsSchema = createSelectSchema(fruitsTarifs, {
  effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
  prixKg: (schema) => schema.min(0, "Le prix au kilo est obligatoire"),
}).extend({
  nomEntreprise: z.string().nonempty("Le nom du fournisseur est obligatoire"),
  slogan: z.string().nullable(),
});

export type SelectFruitsTarifsType = typeof selectFruitsTarifsSchema._type;
