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
    nbExutoiresParking: z.number().nullable(),
    nbAlarmes: z.number().nullable(),
    nbPortesCoupeFeuBattantes: z.number().nullable(),
    nbPortesCoupeFeuCoulissantes: z.number().nullable(),
    nbRIA: z.number().nullable(),
    nbColonnesSechesStatiques: z.number().nullable(),
    nbColonnesSechesDynamiques: z.number().nullable(),
  }),
  prix: z.object({
    prixParExtincteur: z.number().nullable(),
    prixParBaes: z.number().nullable(),
    prixParTelBaes: z.number().nullable(),
    prixParExutoire: z.number().nullable(),
    prixParExutoireParking: z.number().nullable(),
    prixParAlarme: z.number().nullable(),
    prixParPorteCoupeFeuBattante: z.number().nullable(),
    prixParProteCoupeFeuCoulissante: z.number().nullable(),
    prixParRIA: z.number().nullable(),
    prixParColonneSecheStatique: z.number().nullable(),
    prixParColonneSecheDynamique: z.number().nullable(),
    fraisDeplacementTrilogie: z.number().nullable(),
    fraisDeplacementExutoires: z.number().nullable(),
    fraisDeplacementExutoiresParking: z.number().nullable(),
  }),
});

export type IncendieType = z.infer<typeof incendieSchema>;
