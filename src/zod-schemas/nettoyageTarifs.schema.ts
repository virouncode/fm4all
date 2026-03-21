import { nettoyageTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectNettoyageTarifsSchema = createSelectSchema(nettoyageTarifs, {
  hParPassage: (schema) =>
    schema.min(1, "Le nombre d'heures moyen par passage est obligatoire"),
  tauxHoraire: (schema) => schema.min(1, "Le taux horaire est obligatoire"),
  surface: (schema) => schema.min(1, "La surface est obligatoire"),
}).extend({
  nomPrestataire: z.string().nonempty("Nom du prestataire invalide"),
  slogan: z.string().nullable(),
  logoStorageKey: z.string().nullable(),
  anneeCreation: z.number().nullable(),
  ca: z.string().nullable(),
  effectifPrestataire: z.string().nullable(),
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
  },
);

export type SelectNettoyageTarifsType =
  z.infer<typeof selectNettoyageTarifsSchema>;

export type SelectNettoyageTarifFournisseurType =
  z.infer<typeof selectNettoyageTarifsFournisseurSchema>;
