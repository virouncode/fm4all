import { boissonsProduits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectBoissonsProduitSchema = createSelectSchema(
  boissonsProduits,
  {
    effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
  },
);

export type SelectBoissonsProduitType =
  typeof selectBoissonsProduitSchema._type;
