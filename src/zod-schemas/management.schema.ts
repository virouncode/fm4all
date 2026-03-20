import { z } from "zod";

export const managementSchema = z.object({
  currentManagementId: z.number(),
});

export type ManagementType = z.infer<typeof managementSchema>;
