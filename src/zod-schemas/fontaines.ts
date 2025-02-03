import { z } from "zod";

export const fontainesSchema = z.object({
  infos: z.object({
    fournisseurId: z.number().nullable(),
    nomFournisseur: z.string().nullable(),
    sloganFournisseur: z.string().nullable(),
    currentEspaceId: z.number().nullable(),
    dureeLocation: z
      .enum(["pa12M", "pa24M", "pa36M", "pa48M", "pa60M", "oneShot"])
      .default("pa12M"),
    commentaires: z.string().nullable(),
  }),
  nbEspaces: z.number().nullable(),
  espaces: z.array(
    z.object({
      infos: z.object({
        espaceId: z.number(),
        typeBoissons: z.enum(["EF", "EC", "EG", "ECG"]).default("EF"),
        typePose: z.enum(["aposer", "colonne", "comptoir"]),
        marque: z.string().nullable(),
        modele: z.string().nullable(),
        reconditionne: z.boolean().nullable(),
        selected: z.boolean().nullable(),
      }),
      quantites: z.object({
        nbPersonnes: z.number().nullable(),
      }),
      prix: z.object({
        prixLoc: z.number().nullable(),
        prixInstal: z.number().nullable(),
        prixMaintenance: z.number().nullable(),
        prixUnitaireConsoFiltres: z.number().nullable(),
        prixUnitaireConsoCO2: z.number().nullable(),
        prixUnitaireConsoEauChaude: z.number().nullable(),
      }),
    })
  ),
});

export const fontainesEspaceSchema = z.object({
  ...fontainesSchema.shape.espaces.element.shape, // Use `.shape` to spread properties
});

export const fontainesEspaceFormSchema = z.object({
  machineId: z.number(),
  typeBoissons: z.enum(["EF", "EC", "EG", "ECG"]).default("EF"),
  nbPersonnes: z
    .string()
    .refine(
      (value) =>
        /^\d+$/.test(value) &&
        parseInt(value, 10) >= 1 &&
        parseInt(value, 10) <= 110,
      "Le nombre de personnes doit être compris entre 1 et 110"
    ),
  nbMachines: z.number(),
});

export type FontainesType = z.infer<typeof fontainesSchema>;
export type FontaineEspaceType = z.infer<typeof fontainesEspaceSchema>;
export type FontainesEspaceFormType = z.infer<typeof fontainesEspaceFormSchema>;
