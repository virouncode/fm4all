import { z } from "zod";

export const nettoyageSchema = z.object({
  fournisseurId: z.number().nullable(),
  propositionId: z.number().nullable(),
  gammeSelected: z.enum(["essentiel", "confort", "excellence"]).nullable(),
  repassePropositionId: z.number().nullable(),
  samediPropositionId: z.number().nullable(),
  dimanchePropositionId: z.number().nullable(),
  vitreriePropositionId: z.number().nullable(),
  nbPassageVitrerie: z.number().default(2),
});

export type NettoyageType = z.infer<typeof nettoyageSchema>;
