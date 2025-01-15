import { fruitsTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectFruitsTarifsSchema = createSelectSchema(fruitsTarifs, {
  effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
  prixKg: (schema) => schema.min(0, "Le prix au kilo est obligatoire"),
});

export type SelectFruitsTarifsType = typeof selectFruitsTarifsSchema._type;
