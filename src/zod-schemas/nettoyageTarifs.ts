import { nettoyageTarifs } from "@/db/schema";
import { createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const selectNettoyageTarifsSchema = createSelectSchema(nettoyageTarifs, {
  hParPassage: (schema) =>
    schema.min(1, "Le nombre d'heures moyen par passage est obligatoire"),
  tauxHoraire: (schema) => schema.min(1, "Le taux horaire est obligatoire"),
  surface: (schema) => schema.min(1, "La surface est obligatoire"),
}).extend({
  nomFournisseur: z.string().nonempty("Nom de fournisseur invalide"),
  slogan: z.string().nullable(),
  logoUrl: z.string().nullable(),
  locationUrl: z.string().nullable(),
  anneeCreation: z.number().nullable(),
  ca: z.string().nullable(),
  effectif: z.string().nullable(),
  nbClients: z.number().nullable(),
  noteGoogle: z.string().nullable(),
  nbAvis: z.number().nullable(),
});

export const selectNettoyageTarifsFournisseurSchema = createSelectSchema(
  nettoyageTarifs,
  {
    hParPassage: (schema) =>
      schema.min(1, "Le nombre d'heures moyen par passage est obligatoire"),
    tauxHoraire: (schema) => schema.min(1, "Le taux horaire est obligatoire"),
    surface: (schema) => schema.min(1, "La surface est obligatoire"),
  }
);

export type SelectNettoyageTarifsType =
  typeof selectNettoyageTarifsSchema._type;

export type SelectNettoyageTarifFournisseurType =
  typeof selectNettoyageTarifsFournisseurSchema._type;

//UPDATE
export const updateNettoyageTarifsSchema = createUpdateSchema(nettoyageTarifs, {
  hParPassage: (schema) =>
    schema.min(1, "Le nombre d'heures moyen par passage est obligatoire"),
  tauxHoraire: (schema) => schema.min(1, "Le taux horaire est obligatoire"),
  surface: (schema) => schema.min(1, "La surface est obligatoire"),
});

export type UpdateNettoyageTarifsType =
  typeof updateNettoyageTarifsSchema._type;
