import { hygieneInstalDistribProduits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectHygieneInstalDistribProduitSchema = createSelectSchema(
  hygieneInstalDistribProduits,
  {
    effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
  },
);

export type SelectHygieneInstalDistribProduitType =
  typeof selectHygieneInstalDistribProduitSchema._type;
