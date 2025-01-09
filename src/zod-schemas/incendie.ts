import { z } from "zod";

export const incendieSchema = z.object({
  fournisseurId: z.number().nullable(),
  propositionId: z.number().nullable(),
  nbExtincteurs: z.number(),
  nbBaes: z.number(),
  nbTelBaes: z.number(),
});

export type IncendieType = z.infer<typeof incendieSchema>;
