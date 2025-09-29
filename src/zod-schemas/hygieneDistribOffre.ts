import { hygieneDistribOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { selectHygieneDistribProduitSchema } from "./hygieneDistribProduit";

export const selectHygieneDistribOffreSchema =
  createSelectSchema(hygieneDistribOffres);

export type SelectHygieneDistribProduitType =
  typeof selectHygieneDistribProduitSchema._type;
