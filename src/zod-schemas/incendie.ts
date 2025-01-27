import { z } from "zod";

export const incendieSchema = z.object({
  infos: z.object({
    fournisseurId: z.number().nullable(),
    nomFournisseur: z.string().nullable(),
    sloganFournisseur: z.string().nullable(),
    commentaires: z.string().nullable(),
  }),
  quantites: z.object({
    nbExtincteurs: z.number().nullable(),
    nbBaes: z.number().nullable(),
    nbTelBaes: z.number().nullable(),
    nbExutoires: z.number().nullable(),
    nbAlarmesT4SSI: z.number().nullable(),
    nbPortesCoupFeu: z.number().nullable(),
    nbRIA: z.number().nullable(),
    nbColonnesSeches: z.number().nullable(),
  }),
  prix: z.object({
    prixParExtincteur: z.number().nullable(),
    prixParBaes: z.number().nullable(),
    prixParTelBaes: z.number().nullable(),
    fraisDeplacement: z.number().nullable(),
  }),
});

export type IncendieType = z.infer<typeof incendieSchema>;
