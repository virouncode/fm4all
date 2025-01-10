import { z } from "zod";

export const maintenanceSchema = z.object({
  fournisseurId: z.number().nullable(),
  propositionId: z.number().nullable(),
});

export type MaintenanceType = z.infer<typeof maintenanceSchema>;
