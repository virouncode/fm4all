import { z } from "zod";

export const personnalisationSchema = z.object({
  currentPersonnalisationId: z.number(),
  personnalisationIds: z.array(z.number()),
});

export type PersonnalisationType = z.infer<typeof personnalisationSchema>;
