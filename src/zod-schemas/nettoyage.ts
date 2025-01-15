import { z } from "zod";

export const nettoyageSchema = z.object({
  fournisseurId: z.number().nullable(),
  gammeSelected: z.enum(["essentiel", "confort", "excellence"]).nullable(),
  repasseSelected: z.boolean().default(false),
  samediSelected: z.boolean().default(false),
  dimancheSelected: z.boolean().default(false),
  vitrerieSelected: z.boolean().default(false),
  nbPassageVitrerie: z.number().default(2),
});

export type NettoyageType = z.infer<typeof nettoyageSchema>;
