import { theConsoProduits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectTheConsoProduitSchema = createSelectSchema(
  theConsoProduits,
  {
    effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
  },
);

export type SelectTheConsoProduitType =
  typeof selectTheConsoProduitSchema._type;
