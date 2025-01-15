import { z } from "zod";

export const hygieneSchema = z.object({
  fournisseurId: z.number().nullable(),
  nbDistribEmp: z.number(),
  nbDistribSavon: z.number(),
  nbDistribPh: z.number(),
  nbDistribDesinfectant: z.number(),
  nbDistribParfum: z.number(),
  nbDistribBalai: z.number(),
  nbDistribPoubelle: z.number(),
  dureeLocation: z.enum(["pa12M", "pa24M", "pa36M", "oneShot"], {
    message: "La durée de location doit être pa12M, pa24M, pa36M ou oneShot",
  }),
  trilogieGammeSelected: z
    .enum(["essentiel", "confort", "excellence"])
    .default("essentiel")
    .nullable(),
  desinfectantGammeSelected: z
    .enum(["essentiel", "confort", "excellence"])
    .nullable(),
  parfumGammeSelected: z
    .enum(["essentiel", "confort", "excellence"])
    .nullable(),
  balaiGammeSelected: z.enum(["essentiel", "confort", "excellence"]).nullable(),
  poubelleGammeSelected: z
    .enum(["essentiel", "confort", "excellence"])
    .nullable(),
});

export type HygieneType = z.infer<typeof hygieneSchema>;
