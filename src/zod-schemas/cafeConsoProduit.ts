import { cafeConsoProduits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectCafeConsoProduitSchema = createSelectSchema(
  cafeConsoProduits,
  {
    effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
  },
);

export type SelectCafeConsoProduitType =
  typeof selectCafeConsoProduitSchema._type;
