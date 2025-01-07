import { z } from "zod";

export const servicesSchema = z.object({
  selectedServicesIds: z.array(z.number()),
  currentServiceId: z.number().nullable(),
});

export type ServicesType = z.infer<typeof servicesSchema>;
