import { boissonsTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectFruitsTarifsSchema = createSelectSchema(boissonsTarifs, {
  effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
  prixUnitaire: (schema) => schema.min(0, "Le prix unitaire est obligatoire"),
});

export type SelectFruitsTarifsType = typeof selectFruitsTarifsSchema._type;
