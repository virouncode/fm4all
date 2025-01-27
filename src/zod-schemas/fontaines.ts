import { z } from "zod";

export const fontainesSchema = z.object({
  infos: z.object({
    fournisseurId: z.number().nullable(),
    nomFournisseur: z.string().nullable(),
    sloganFournisseur: z.string().nullable(),
    currentLotId: z.number().nullable(),
    dureeLocation: z
      .enum(["pa12M", "pa24M", "pa36M", "pa48M", "pa60M", "oneShot"])
      .default("pa12M"),
    commentaires: z.string().nullable(),
  }),
  nbLotsFontaines: z.number().nullable(),
  lotsFontaines: z.array(
    z.object({
      infos: z.object({
        lotId: z.number(),
        typeEau: z.enum(["EF", "EFC", "EFG", "EFCG"]),
        typePose: z.enum(["aposer", "colonne", "comptoir"]),
        marque: z.string().nullable(),
        modele: z.string().nullable(),
        reconditionne: z.boolean().nullable(),
      }),
      quantites: z.object({
        nbPersonnes: z.number().nullable(),
        nbFontaines: z.number().nullable(),
      }),
      prix: z.object({
        prixUnitaireLoc: z.number().nullable(),
        prixUnitaireInstal: z.number().nullable(),
        prixUnitaireMaintenance: z.number().nullable(),
        prixUnitaireConsoFiltres: z.number().nullable(),
        prixUnitaireConsoCO2: z.number().nullable(),
        prixUnitaireConsoEauChaude: z.number().nullable(),
      }),
    })
  ),
});

export const fontainesLotSchema = z.object({
  ...fontainesSchema.shape.lotsFontaines.element.shape, // Use `.shape` to spread properties
});

export const fontainesLotFormSchema = z.object({
  machineId: z.number(),
  typeEau: z.enum(["EF", "EFC", "EFG", "EFCG"]),
  typePose: z.enum(["aposer", "colonne", "comptoir"]),
  nbPersonnes: z
    .string()
    .refine(
      (value) =>
        /^\d+$/.test(value) &&
        parseInt(value, 10) >= 1 &&
        parseInt(value, 10) <= 300,
      "Le nombre de personnes doit être compris entre 1 et 300"
    ),
  nbFontaines: z.number(),
});

export type FontainesType = z.infer<typeof fontainesSchema>;
export type FontainesLotType = z.infer<typeof fontainesLotSchema>;
export type FontainesLotFormType = z.infer<typeof fontainesLotFormSchema>;
