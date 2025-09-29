import { laitConsoProduits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectLaitConsoProduitSchema = createSelectSchema(
  laitConsoProduits,
  {
    effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
  },
);

export type SelectLaitConsoProduitType =
  typeof selectLaitConsoProduitSchema._type;
