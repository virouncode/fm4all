import z from "zod";
import { typeBatimentSchema, typeOccupationSchema } from "./client";
import { codePostalSchema } from "./codePostal";

//MES LOCAUX
export const createMesLocauxFormSchema = (messages: {
  surface: string;
  effectif: string;
  batiment: string;
  occupation: string;
  codePostal: string;
}) => {
  return z.object({
    surface: z
      .string()
      .refine(
        (v) => !Number.isNaN(Number(v)) && Number(v) >= 50 && Number(v) <= 3000,
        {
          message: messages.surface,
        },
      ),
    effectif: z
      .string()
      .refine(
        (v) => !Number.isNaN(Number(v)) && Number(v) >= 1 && Number(v) <= 300,
        {
          message: messages.effectif,
        },
      ),
    typeBatiment: typeBatimentSchema,
    typeOccupation: typeOccupationSchema,
    codePostal: codePostalSchema(messages.codePostal),
  });
};

export const mesLocauxFormSchema = createMesLocauxFormSchema({
  surface: "La surface doit être un nombre compris entre 50 et 3000 m²",
  effectif: "Le nombre de personnes doit être compris entre 1 et 300",
  batiment: "Type de batiment invalide",
  occupation: "Type d'occupation invalide",
  codePostal: "Code postal invalide, entrez 5 chiffres",
});

export type MesLocauxFormType = z.infer<typeof mesLocauxFormSchema>;
