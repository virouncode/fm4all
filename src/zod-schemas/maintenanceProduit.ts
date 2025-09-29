import { maintenanceProduits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectMaintenanceProduitSchema = createSelectSchema(
  maintenanceProduits,
  {
    surface: (schema) => schema.min(1, "La surface est obligatoire"),
    hParPassage: (schema) =>
      schema.min(0.1, "Le nombre d'heures par passage est obligatoire"),
  },
);

export type SelectMaintenanceProduitType =
  typeof selectMaintenanceProduitSchema._type;
