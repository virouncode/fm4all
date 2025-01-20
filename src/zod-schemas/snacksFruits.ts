import { z } from "zod";

export const snacksFruitsSchema = z.object({
  infos: z.object({
    fournisseurId: z.number().nullable(),
    nomFournisseur: z.string().nullable(),
    sloganFournisseur: z.string().nullable(),
    isSameFournisseur: z.boolean().nullable(),
    gammeSelected: z.enum(["essentiel", "confort", "excellence"]).nullable(),
    choix: z.array(z.enum(["fruits", "snacks", "boissons"])),
  }),
  quantites: z.object({
    nbPersonnes: z.number(),
    fruitsKgParSemaine: z.number(),
    snacksPortionsParSemaine: z.number(),
    boissonsConsosParSemaine: z.number(),
  }),
  prix: z.object({
    prixKgFruits: z.number().nullable(),
    prixUnitaireSnacks: z.number().nullable(),
    prixUnitaireBoissons: z.number().nullable(),
    prixUnitaireLivraisonSiCafe: z.number().nullable(),
    prixUnitaireLivraison: z.number().nullable(),
    seuilFranco: z.number().nullable(),
    panierMin: z.number().nullable(),
  }),
});

export type SnacksFruitsType = z.infer<typeof snacksFruitsSchema>;
