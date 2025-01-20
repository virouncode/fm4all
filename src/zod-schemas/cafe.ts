import { z } from "zod";

export const cafeSchema = z.object({
  infos: z.object({
    fournisseurId: z.number().nullable(),
    nomFournisseur: z.string().nullable(),
    sloganFournisseur: z.string().nullable(),
    currentLotId: z.number().nullable(),
    dureeLocation: z
      .enum(["pa12M", "pa24M", "pa36M", "pa48M", "pa60M", "oneShot"])
      .default("pa12M"),
  }),
  nbLotsMachines: z.number().default(0),
  lotsMachines: z.array(
    z.object({
      infos: z.object({
        lotId: z.number(),
        typeBoissons: z.enum(["cafe", "lait", "chocolat"]),
        gammeCafeSelected: z
          .enum(["essentiel", "confort", "excellence"])
          .nullable(),
        marque: z.string().nullable(),
        modele: z.string().nullable(),
        reconditionne: z.boolean().default(false),
      }),
      quantites: z.object({
        nbPersonnes: z.number(),
        nbMachines: z.number().nullable(),
      }),
      prix: z.object({
        prixUnitaireLoc: z.number().nullable(),
        prixUnitaireInstal: z.number().nullable(),
        prixUnitaireMaintenance: z.number().nullable(),
        prixUnitaireConsoCafe: z.number().nullable(),
        prixUnitaireConsoLait: z.number().nullable(),
        prixUnitaireConsoChocolat: z.number().nullable(),
      }),
    })
  ),
});

export const cafeLotSchema = z.object({
  ...cafeSchema.shape.lotsMachines.element.shape, // Use `.shape` to spread properties
});

export const cafeLotFormSchema = z.object({
  machineId: z.number(),
  typeBoissons: z.enum(["cafe", "lait", "chocolat"]),
  nbPersonnes: z
    .string()
    .refine(
      (value) =>
        /^\d+$/.test(value) &&
        parseInt(value, 10) >= 1 &&
        parseInt(value, 10) <= 300,
      "Le nombre de personnes doit être compris entre 1 et 300"
    ),
  nbMachines: z.number(),
});

export type CafeType = z.infer<typeof cafeSchema>;
export type CafeLotType = z.infer<typeof cafeLotSchema>;
export type CafeLotFormType = z.infer<typeof cafeLotFormSchema>;
