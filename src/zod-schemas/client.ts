import { clients, typeBatimentEnum, typeOccupationEnum } from "@/db/schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { codePostalSchema } from "./codePostal";
import { phoneNumberSchema } from "./phone";
import { siretSchema } from "./siret";

export const typeBatimentSchema = z.enum(typeBatimentEnum.enumValues);
export type TypeBatimentType = z.infer<typeof typeBatimentSchema>;

export const typeOccupationSchema = z.enum(typeOccupationEnum.enumValues);
export type TypeOccupationType = z.infer<typeof typeOccupationSchema>;

//SELECT
export const selectClientSchema = createSelectSchema(clients, {
  nomEntreprise: (schema) => schema.min(1, "Nom de l'entreprise obligatoire"),
  siret: siretSchema("Siret invalide").nullable(),
  prenomContact: (schema) => schema.min(1, "Prénom du contact obligatoire"),
  nomContact: (schema) => schema.min(1, "Nom du contact obligatoire"),
  posteContact: (schema) => schema.min(1, "Poste du contact obligatoire"),
  emailContact: (schema) => schema.email("Adresse email invalide"),
  phoneContact: phoneNumberSchema("Numéro de téléphone invalide"),
  emailSignataire: (schema) =>
    schema.email("Adresse email invalide").nullable(),
  surface: (schema) =>
    schema.min(1, "Surface obligatoire").max(3000, "Surface maximum 3000 m²"),
  effectif: (schema) =>
    schema
      .min(1, "Effectif obligatoire")
      .max(300, "Effectif maximum 300 personnes"),
  typeBatiment: typeBatimentSchema,
  typeOccupation: typeOccupationSchema,
  codePostal: codePostalSchema,
  ville: (schema) => schema.min(1, "Ville obligatoire"),
});

export type SelectClientType = z.infer<typeof selectClientSchema>;

//INSERT
export const createInsertClientSchema = (messages: {
  nomEntreprise: string;
  siret: string;
  prenomContact: string;
  nomContact: string;
  posteContact: string;
  emailContact: string;
  phoneContact: string;
  emailSignataire: string;
  surface: string;
  surfaceMax: string;
  effectif: string;
  effectifMax: string;
  codePostal: string;
  ville: string;
}) => {
  return createInsertSchema(clients, {
    nomEntreprise: (schema) => schema.min(1, messages.nomEntreprise),
    siret: siretSchema(messages.siret).nullable(),
    prenomContact: (schema) => schema.min(1, messages.prenomContact),
    nomContact: (schema) => schema.min(1, messages.nomContact),
    posteContact: (schema) => schema.min(1, messages.posteContact),
    emailContact: (schema) => schema.email(messages.emailContact),
    phoneContact: phoneNumberSchema(messages.phoneContact),
    emailSignataire: (schema) =>
      schema.email(messages.emailSignataire).nullable(),
    surface: (schema) =>
      schema.min(1, messages.surface).max(3000, messages.surfaceMax),
    effectif: (schema) =>
      schema.min(1, messages.effectif).max(300, messages.effectifMax),
    typeBatiment: typeBatimentSchema,
    typeOccupation: typeOccupationSchema,
    codePostal: codePostalSchema,
    ville: (schema) => schema.min(1, messages.ville),
  });
};

export const insertClientSchema = createInsertClientSchema({
  nomEntreprise: "Nom de l'entreprise obligatoire",
  siret: "Siret invalide, entrez 14 chiffres avec ou sans espaces",
  prenomContact: "Prénom du contact obligatoire",
  nomContact: "Nom du contact obligatoire",
  posteContact: "Poste du contact obligatoire",
  emailContact: "Adresse email invalide",
  phoneContact: "Numéro de téléphone invalide",
  emailSignataire: "Adresse email du signataire invalide",
  surface: "Surface obligatoire",
  surfaceMax: "Surface maximum 3000 m²",
  effectif: "Effectif obligatoire",
  effectifMax: "Effectif maximum 300 personnes",
  codePostal: "Code postal invalide, entrez 5 chiffres",
  ville: "Ville obligatoire",
});

export type InsertClientType = z.infer<typeof insertClientSchema>;

//UPDATE
export const createUpdateClientSchema = (messages: {
  nomEntreprise: string;
  siret: string;
  prenomContact: string;
  nomContact: string;
  posteContact: string;
  emailContact: string;
  phoneContact: string;
  emailSignataire: string;
  surface: string;
  surfaceMax: string;
  effectif: string;
  effectifMax: string;
  codePostal: string;
  ville: string;
}) => {
  return createUpdateSchema(clients, {
    nomEntreprise: (schema) => schema.min(1, messages.nomEntreprise),
    siret: siretSchema(messages.siret).nullable(),
    prenomContact: (schema) => schema.min(1, messages.prenomContact),
    nomContact: (schema) => schema.min(1, messages.nomContact),
    posteContact: (schema) => schema.min(1, messages.posteContact),
    emailContact: (schema) => schema.email(messages.emailContact),
    phoneContact: phoneNumberSchema(messages.phoneContact),
    emailSignataire: (schema) =>
      schema.email(messages.emailSignataire).nullable(),
    surface: (schema) =>
      schema.min(1, messages.surface).max(3000, messages.surfaceMax),
    effectif: (schema) =>
      schema.min(1, messages.effectif).max(300, messages.effectifMax),
    typeBatiment: typeBatimentSchema,
    typeOccupation: typeOccupationSchema,
    codePostal: codePostalSchema,
    ville: (schema) => schema.min(1, messages.ville),
  });
};

export const updateClientSchema = createUpdateClientSchema({
  nomEntreprise: "Nom de l'entreprise obligatoire",
  siret: "Siret invalide, entrez 14 chiffres avec ou sans espaces",
  prenomContact: "Prénom du contact obligatoire",
  nomContact: "Nom du contact obligatoire",
  posteContact: "Poste du contact obligatoire",
  emailContact: "Adresse email invalide",
  phoneContact: "Numéro de téléphone invalide",
  emailSignataire: "Adresse email du signataire invalide",
  surface: "Surface obligatoire",
  surfaceMax: "Surface maximum 3000 m²",
  effectif: "Effectif obligatoire",
  effectifMax: "Effectif maximum 300 personnes",
  codePostal: "Code postal invalide, entrez 5 chiffres",
  ville: "Ville obligatoire",
});

export type UpdateClientType = z.infer<typeof updateClientSchema>;

//MES LOCAUX
export const createMesLocauxSchema = (messages: {
  surface: string;
  effectif: string;
  batiment: string;
  occupation: string;
  codePostal: string;
}) => {
  return z.object({
    surface: z.coerce
      .number()
      .min(50, messages.surface)
      .max(3000, messages.surface),
    effectif: z.coerce
      .number()
      .min(1, messages.effectif)
      .max(300, messages.effectif),
    typeBatiment: typeBatimentSchema,
    typeOccupation: typeOccupationSchema,
    codePostal: codePostalSchema,
  });
};

export const mesLocauxSchema = createMesLocauxSchema({
  surface: "La surface doit être un nombre compris entre 50 et 3000 m²",
  effectif: "Le nombre de personnes doit être compris entre 1 et 300",
  batiment: "Type de batiment invalide",
  occupation: "Type d'occupation invalide",
  codePostal: "Code postal invalide, entrez 5 chiffres",
});

export type MesLocauxType = z.input<typeof mesLocauxSchema>;
