import { z } from "zod";

export const officeManagerSchema = z.object({
  infos: z.object({
    fournisseurId: z.number().nullable(),
    nomFournisseur: z.string().nullable(),
    sloganFournisseur: z.string().nullable(),
    logoUrl: z.string().nullable(),
    gammeSelected: z.enum(["essentiel", "confort", "excellence"]).nullable(),
    remplace: z.boolean(),
    commentaires: z.string().nullable(),
    premium: z.boolean().default(false),
  }),
  quantites: z.object({
    demiJParSemaine: z.number().nullable(),
  }),
  prix: z.object({
    demiTjm: z.number().nullable(),
    demiTjmPremium: z.number().nullable(),
  }),
});

export type OfficeManagerType = z.infer<typeof officeManagerSchema>;
