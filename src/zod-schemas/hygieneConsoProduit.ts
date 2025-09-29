import { hygieneConsoProduits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectHygieneConsoProduitSchema = createSelectSchema(
  hygieneConsoProduits,
  {
    effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
  },
);

export type SelectHygieneConsoProduitType =
  typeof selectHygieneConsoProduitSchema._type;
