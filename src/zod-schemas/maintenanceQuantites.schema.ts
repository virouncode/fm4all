import { maintenanceQuantites } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectMaintenanceQuantitesSchema =
  createSelectSchema(maintenanceQuantites);

export type SelectMaintenanceQuantitesType =
  z.infer<typeof selectMaintenanceQuantitesSchema>;
