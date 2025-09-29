import { q18Produits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectQ18ProduitSchema = createSelectSchema(q18Produits, {
  surface: (schema) => schema.min(1, "La surface est obligatoire"),
});

export type SelectQ18ProduitType = typeof selectQ18ProduitSchema._type;
