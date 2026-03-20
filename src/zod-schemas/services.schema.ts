import { z } from "zod";

export const servicesSchema = z.object({
  currentServiceId: z.number(),
});

export type ServicesType = z.infer<typeof servicesSchema>;
