import { exutoiresParkingOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectExutoireParkingOffreSchema = createSelectSchema(
  exutoiresParkingOffres,
  {
    prixUnitaire: (schema) => schema.min(1, "Le prix unitaire est obligatoire"),
  },
);

export type SelectExutoireParkingOffreType =
  typeof selectExutoireParkingOffreSchema._type;
