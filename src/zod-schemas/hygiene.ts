import { z } from "zod";

export const hygieneSchema = z.object({
  infos: z.object({
    fournisseurId: z.number().nullable(),
    nomFournisseur: z.string().nullable(),
    sloganFournisseur: z.string().nullable(),
    logoUrl: z.string().nullable(),
    dureeLocation: z.enum(["pa12M", "pa24M", "pa36M", "oneShot"]),
    trilogieGammeSelected: z
      .enum(["essentiel", "confort", "excellence"])
      .nullable()
      .default("essentiel"),
    desinfectantGammeSelected: z
      .enum(["essentiel", "confort", "excellence"])
      .nullable(),
    parfumGammeSelected: z
      .enum(["essentiel", "confort", "excellence"])
      .nullable(),
    balaiGammeSelected: z
      .enum(["essentiel", "confort", "excellence"])
      .nullable(),
    poubelleGammeSelected: z
      .enum(["essentiel", "confort", "excellence"])
      .nullable(),
    commentaires: z.string().nullable(),
  }),
  quantites: z.object({
    nbDistribEmp: z.number().nullable(),
    nbDistribEmpPoubelle: z.number().nullable(),
    nbDistribSavon: z.number().nullable(),
    nbDistribPh: z.number().nullable(),
    nbDistribDesinfectant: z.number().nullable(),
    nbDistribParfum: z.number().nullable(),
    nbDistribBalai: z.number().nullable(),
    nbDistribPoubelle: z.number().nullable(),
  }),
  prix: z.object({
    prixDistribEmp: z.number().nullable(),
    prixDistribEmpPoubelle: z.number().nullable(),
    prixDistribSavon: z.number().nullable(),
    prixDistribPh: z.number().nullable(),
    prixDistribDesinfectant: z.number().nullable(),
    prixDistribParfum: z.number().nullable(),
    prixDistribBalai: z.number().nullable(),
    prixDistribPoubelle: z.number().nullable(),
    prixInstalDistrib: z.number().nullable(),
    paParPersonneEmp: z.number().nullable(),
    paParPersonneSavon: z.number().nullable(),
    paParPersonnePh: z.number().nullable(),
    paParPersonneDesinfectant: z.number().nullable(),
  }),
});

export type HygieneType = z.infer<typeof hygieneSchema>;
