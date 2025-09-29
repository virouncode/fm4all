import { portesCoupeFeuOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectPorteCoupeFeuOffreSchema = createSelectSchema(
  portesCoupeFeuOffres,
  {
    prixUnitaire: (schema) => schema.min(1, "Le prix unitaire est obligatoire"),
  },
);

export type SelectPorteCoupeFeuOffreType =
  typeof selectPorteCoupeFeuOffreSchema._type;
