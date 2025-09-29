import { hygieneDistribProduits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectHygieneDistribProduitSchema = createSelectSchema(
  hygieneDistribProduits,
);

export type SelectHygieneDistribProduitType =
  typeof selectHygieneDistribProduitSchema._type;
