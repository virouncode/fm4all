import { z } from "zod";

export const theSchema = z.object({
  propositionId: z.number().nullable(),
  nbPersonnes: z.number().nullable(),
});

export type TheType = z.infer<typeof theSchema>;
