import { legioProduits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectLegioProduitSchema = createSelectSchema(legioProduits, {
  surface: (schema) => schema.min(1, "La surface est obligatoire"),
});

export type SelectLegioProduitType = typeof selectLegioProduitSchema._type;
