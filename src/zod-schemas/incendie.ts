import { z } from "zod";

export const incendieSchema = z.object({
  infos: z.object({
    fournisseurId: z.number().nullable(),
    nomFournisseur: z.string().nullable(),
    sloganFournisseur: z.string().nullable(),
  }),
  quantites: z.object({
    nbExtincteurs: z.number().nullable(),
    nbBaes: z.number().nullable(),
    nbTelBaes: z.number().nullable(),
  }),
  prix: z.object({
    prixParExtincteur: z.number().default(0),
    prixParBaes: z.number().default(0),
    prixParTelBaes: z.number().default(0),
    fraisDeplacement: z.number().default(0),
  }),
});

export type IncendieType = z.infer<typeof incendieSchema>;
