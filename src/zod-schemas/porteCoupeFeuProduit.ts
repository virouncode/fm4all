import { portesCoupeFeuProduits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectPorteCoupeFeuProduitSchema = createSelectSchema(
  portesCoupeFeuProduits,
);

export type SelectPorteCoupeFeuProduitType =
  typeof selectPorteCoupeFeuProduitSchema._type;
