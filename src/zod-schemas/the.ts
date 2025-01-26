import { z } from "zod";

export const theSchema = z.object({
  infos: z.object({
    gammeSelected: z.enum(["essentiel", "confort", "excellence"]).nullable(),
  }),
  quantites: z.object({
    nbPersonnes: z.number().nullable(),
  }),
  prix: z.object({
    prixUnitaire: z.number().nullable(),
  }),
});

export type TheType = z.infer<typeof theSchema>;
