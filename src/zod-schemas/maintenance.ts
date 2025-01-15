import { z } from "zod";

export const maintenanceSchema = z.object({
  fournisseurId: z.number().nullable(),
  gammeSelected: z.enum(["essentiel", "confort", "excellence"]).nullable(),
});

export type MaintenanceType = z.infer<typeof maintenanceSchema>;
