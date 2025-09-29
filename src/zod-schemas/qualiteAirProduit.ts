import { qualiteAirProduits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectQualiteAirProduitSchema = createSelectSchema(
  qualiteAirProduits,
  {
    surface: (schema) => schema.min(1, "La surface est obligatoire"),
  },
);

export type SelectQualiteAirProduitType =
  typeof selectQualiteAirProduitSchema._type;
