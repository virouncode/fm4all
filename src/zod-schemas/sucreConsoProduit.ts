import { sucreConsoProduits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectSucreConsoProduitSchema = createSelectSchema(
  sucreConsoProduits,
  {
    effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
  },
);

export type SelectSucreConsoProduitType =
  typeof selectSucreConsoProduitSchema._type;
