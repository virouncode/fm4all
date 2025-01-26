import { z } from "zod";

export const nettoyageSchema = z.object({
  infos: z.object({
    fournisseurId: z.number().nullable(),
    nomFournisseur: z.string().nullable(),
    sloganFournisseur: z.string().nullable(),
    gammeSelected: z.enum(["essentiel", "confort", "excellence"]).nullable(),
    repasseSelected: z.boolean().default(false),
    samediSelected: z.boolean().default(false),
    dimancheSelected: z.boolean().default(false),
    vitrerieSelected: z.boolean().default(false),
  }),
  quantites: z.object({
    freqAnnuelle: z.number().nullable(),
    hParPassage: z.number().nullable(),
    hParPassageRepasse: z.number().nullable(),
    surfaceCloisons: z.number().nullable(),
    surfaceVitres: z.number().nullable(),
    cadenceCloisons: z.number().nullable(),
    cadenceVitres: z.number().nullable(),
    nbPassagesVitrerie: z.number().default(2),
  }),
  prix: z.object({
    tauxHoraire: z.number().nullable(),
    tauxHoraireRepasse: z.number().nullable(),
    tauxHoraireVitrerie: z.number().nullable(),
    minFacturationVitrerie: z.number().nullable(),
  }),
});

export type NettoyageType = z.infer<typeof nettoyageSchema>;
