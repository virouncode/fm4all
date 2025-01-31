import { z } from "zod";

export const cafeSchema = z.object({
  infos: z.object({
    fournisseurId: z.number().nullable(),
    nomFournisseur: z.string().nullable(),
    sloganFournisseur: z.string().nullable(),
    currentEspaceId: z.number().nullable(),
    dureeLocation: z
      .enum(["pa12M", "pa24M", "pa36M", "pa48M", "oneShot"])
      .default("pa12M"),
    commentaires: z.string().nullable(),
  }),
  nbEspaces: z.number().nullable(),
  espaces: z.array(
    z.object({
      infos: z.object({
        espaceId: z.number(),
        typeBoissons: z.enum(["cafe", "lait", "chocolat"]),
        typeLait: z.enum(["dosettes", "frais", "poudre"]).nullable(),
        typeChocolat: z.enum(["sachets", "poudre"]).nullable(),
        gammeCafeSelected: z
          .enum(["essentiel", "confort", "excellence"])
          .nullable(),
        marque: z.string().nullable(),
        modele: z.string().nullable(),
        reconditionne: z.boolean().nullable(),
      }),
      quantites: z.object({
        nbPersonnes: z.number().nullable(),
        nbMachines: z.number().nullable(),
        nbPassagesParAn: z.number().nullable(),
      }),
      prix: z.object({
        prixLoc: z.number().nullable(),
        prixInstal: z.number().nullable(),
        prixMaintenance: z.number().nullable(),
        prixUnitaireConsoCafe: z.number().nullable(),
        prixUnitaireConsoLait: z.number().nullable(),
        prixUnitaireConsoChocolat: z.number().nullable(),
        prixUnitaireConsoSucre: z.number().nullable(),
      }),
    })
  ),
});

export const cafeEspaceSchema = z.object({
  ...cafeSchema.shape.espaces.element.shape, // Use `.shape` to spread properties
});

export const cafeEspaceFormSchema = z.object({
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
export type CafeEspaceType = z.infer<typeof cafeEspaceSchema>;
export type CafeEspaceFormType = z.infer<typeof cafeEspaceFormSchema>;
