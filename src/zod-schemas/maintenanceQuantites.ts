import { maintenanceQuantites } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectMaintenanceQuantitesSchema = createSelectSchema(
  maintenanceQuantites,
  {
    surface: (schema) => schema.min(1, "La surface est obligatoire"),
    freqAnnuelle: (schema) =>
      schema.min(1, "La fréquence annuelle est obligatoire"),
  },
);

export type SelectMaintenanceQuantitesType =
  z.infer<typeof selectMaintenanceQuantitesSchema>;
