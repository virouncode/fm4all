import { colonnesSechesProduits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectColonneSecheProduitSchema = createSelectSchema(
  colonnesSechesProduits,
);

export type SelectColonneSecheProduitType =
  typeof selectColonneSecheProduitSchema._type;
