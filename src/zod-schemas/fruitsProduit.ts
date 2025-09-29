import { fruitsProduits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectFruitsProduitSchema = createSelectSchema(fruitsProduits, {
  effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
});

export type SelectFruitsProduitType = typeof selectFruitsProduitSchema._type;
