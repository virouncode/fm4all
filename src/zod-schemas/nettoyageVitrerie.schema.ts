import { RATIO } from "@/constants/constants";
import { nettoyageVitrerieTarifs } from "@/db/schema";
import { createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const selectVitrerieTarifsSchema = createSelectSchema(
  nettoyageVitrerieTarifs,
  {
    cadenceVitres: (schema) =>
      schema.min(1, "La cadence vitres est obligatoire"),
    cadenceCloisons: (schema) =>
      schema.min(1, "La cadence cloisons est obligatoire"),
    tauxHoraire: (schema) => schema.min(1, "Le taux horaire est obligatoire"),
  },
).extend({
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

export const selectVitrerieTarifsFournisseurSchema = createSelectSchema(
  nettoyageVitrerieTarifs,
  {
    cadenceVitres: (schema) =>
      schema.min(1, "La cadence vitres est obligatoire"),
    cadenceCloisons: (schema) =>
      schema.min(1, "La cadence cloisons est obligatoire"),
    tauxHoraire: (schema) => schema.min(1, "Le taux horaire est obligatoire"),
  },
);

export type SelectVitrerieTarifsType = z.infer<
  typeof selectVitrerieTarifsSchema
>;
export type SelectVitrerieTarifFournisseurType = z.infer<
  typeof selectVitrerieTarifsFournisseurSchema
>;

export const createVitrerieTarifsUpdateSchema = (messages: {
  cadenceVitres: string;
  cadenceCloisons: string;
  tauxHoraire: string;
  minFacturation: string;
  fraisDeplacement: string;
}) =>
  createUpdateSchema(nettoyageVitrerieTarifs, {
    cadenceVitres: (schema) =>
      z.preprocess(
        (val) => (val === "" ? 0 : Number(val)),
        schema.min(1, messages.cadenceVitres),
      ),
    cadenceCloisons: (schema) =>
      z.preprocess(
        (val) => (val === "" ? 0 : Number(val)),
        schema.min(1, messages.cadenceCloisons),
      ),
    tauxHoraire: (schema) =>
      z.preprocess(
        (val) => (val === "" ? 0 : Number((Number(val) * RATIO).toFixed(0))),
        schema.refine((val) => val > 0, messages.tauxHoraire),
      ),
    minFacturation: (schema) =>
      z.preprocess(
        (val) => (val === "" ? 0 : Number((Number(val) * RATIO).toFixed(0))),
        schema.refine((val) => !val || val > 0, messages.minFacturation),
      ),
    fraisDeplacement: (schema) =>
      z.preprocess(
        (val) => (val === "" ? 0 : Number((Number(val) * RATIO).toFixed(0))),
        schema.refine((val) => !val || val > 0, messages.fraisDeplacement),
      ),
  });

export const updateVitrerieTarifsSchema = createVitrerieTarifsUpdateSchema({
  cadenceVitres: "La cadence vitres est obligatoire",
  cadenceCloisons: "La cadence cloisons est obligatoire",
  tauxHoraire: "Le taux horaire est obligatoire",
  minFacturation: "Le minimum de facturation doit être supérieur à 0",
  fraisDeplacement: "Les frais de déplacement doivent être supérieurs à 0",
});
export type UpdateVitrerieTarifsType = z.input<
  typeof updateVitrerieTarifsSchema
>;

export const createUpdateVitrerieTarifsServerSchema = (messages: {
  cadenceVitres: string;
  cadenceCloisons: string;
  tauxHoraire: string;
  minFacturation: string;
  fraisDeplacement: string;
}) =>
  createUpdateSchema(nettoyageVitrerieTarifs, {
    cadenceVitres: (schema) => schema.min(1, messages.cadenceVitres),
    cadenceCloisons: (schema) => schema.min(1, messages.cadenceCloisons),
    tauxHoraire: (schema) => schema.min(1, messages.tauxHoraire),
    minFacturation: (schema) =>
      schema.refine((val) => !val || val > 0, messages.minFacturation),
    fraisDeplacement: (schema) =>
      schema.refine((val) => !val || val > 0, messages.fraisDeplacement),
  });

export const updateVitrerieTarifsServerSchema =
  createUpdateVitrerieTarifsServerSchema({
    cadenceVitres: "La cadence vitres est obligatoire",
    cadenceCloisons: "La cadence cloisons est obligatoire",
    tauxHoraire: "Le taux horaire est obligatoire",
    minFacturation: "Le minimum de facturation doit être supérieur à 0",
    fraisDeplacement: "Les frais de déplacement doivent être supérieurs à 0",
  });
export type UpdateVitrerieTarifsServerType = z.infer<
  typeof updateVitrerieTarifsServerSchema
>;
