import { maintenanceOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectMaintenanceOffreSchema = createSelectSchema(
  maintenanceOffres,
  {
    tauxHoraire: (schema) => schema.min(1, "Le taux horaire est obligatoire"),
  },
);

export type SelectMaintenanceOffreType =
  typeof selectMaintenanceOffreSchema._type;
