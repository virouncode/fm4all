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
    freqAnnuelle: z.number().default(0),
    hParPassage: z.number().default(0),
    hParPassageRepasse: z.number().default(0),
    surfaceCloisons: z.number().default(0),
    surfaceVitres: z.number().default(0),
    cadenceCloisons: z.number().default(0),
    cadenceVitres: z.number().default(0),
    nbPassagesVitrerie: z.number().default(2),
  }),
  prix: z.object({
    tauxHoraire: z.number().default(0),
    tauxHoraireRepasse: z.number().default(0),
    tauxHoraireVitrerie: z.number().default(0),
    minFacturationVitrerie: z.number().default(0),
  }),
});

export type NettoyageType = z.infer<typeof nettoyageSchema>;
