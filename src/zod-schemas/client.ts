import { clients } from "@/db/schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { isValidSIRET } from "../lib/utils/isValideSIRET";

//SELECT
export const selectClientSchema = createSelectSchema(clients, {
  nomEntreprise: (schema) => schema.min(1, "Nom de l'entreprise obligatoire"),
  siret: (schema) =>
    schema.refine((value) => !value || isValidSIRET(value), {
      message: "Siret invalide",
    }),
  prenomContact: (schema) => schema.min(1, "Prénom du contact obligatoire"),
  nomContact: (schema) => schema.min(1, "Nom du contact obligatoire"),
  posteContact: (schema) => schema.min(1, "Poste du contact obligatoire"),
  emailContact: (schema) => schema.email("Adresse email invalide"),
  phoneContact: (schema) =>
    schema.regex(
      /^(?:\+|00)?\d{1,4}[-.\s]?(?:\(?\d{1,4}\)?[-.\s]?)?\d{2,4}([-.\s]?\d{2,4}){2,3}$/,
      "Numéro de téléphone invalide"
    ),
  emailSignataire: (schema) =>
    schema.email("Adresse email invalide").or(z.literal("")).nullable(),
  surface: (schema) =>
    schema.min(1, "Surface obligatoire").max(3000, "Surface maximum 3000 m²"),
  effectif: (schema) =>
    schema
      .min(1, "Effectif obligatoire")
      .max(300, "Effectif maximum 300 personnes"),
  typeBatiment: z.enum(
    ["bureaux", "localCommercial", "entrepot", "cabinetMedical"],
    { message: "Type de batiment invalide" }
  ),
  typeOccupation: z.enum(["partieEtage", "plateauComplet", "batimentEntier"], {
    message: "Type d'occupation invalide",
  }),
  codePostal: (schema) =>
    schema.refine((value) => /^\d{5}$/.test(value), {
      message: "Code postal invalide, entrez 5 chiffres",
    }),
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
  typeBatiment: string;
  typeOccupation: string;
  codePostal: string;
  ville: string;
}) => {
  return createInsertSchema(clients, {
    nomEntreprise: (schema) => schema.min(1, messages.nomEntreprise),
    siret: (schema) =>
      schema.refine((value) => !value || isValidSIRET(value), {
        message: messages.siret,
      }),
    prenomContact: (schema) => schema.min(1, messages.prenomContact),
    nomContact: (schema) => schema.min(1, messages.nomContact),
    posteContact: (schema) => schema.min(1, messages.posteContact),
    emailContact: (schema) => schema.email(messages.emailContact),
    phoneContact: (schema) =>
      schema.regex(
        /^(?:\+|00)?\d{1,4}[-.\s]?(?:\(?\d{1,4}\)?[-.\s]?)?\d{2,4}([-.\s]?\d{2,4}){2,3}$/,
        messages.phoneContact
      ),
    emailSignataire: (schema) =>
      schema.email(messages.emailContact).or(z.literal("")).nullable(),
    surface: (schema) =>
      schema.min(1, messages.surface).max(3000, messages.surfaceMax),
    effectif: (schema) =>
      schema.min(1, messages.effectif).max(300, messages.effectifMax),
    typeBatiment: z.enum(
      ["bureaux", "localCommercial", "entrepot", "cabinetMedical"],
      { message: messages.typeBatiment }
    ),
    typeOccupation: z.enum(
      ["partieEtage", "plateauComplet", "batimentEntier"],
      {
        message: messages.typeOccupation,
      }
    ),
    codePostal: (schema) =>
      schema.refine((value) => /^\d{5}$/.test(value), {
        message: messages.codePostal,
      }),
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
  typeBatiment: "Type de batiment invalide",
  typeOccupation: "Type d'occupation invalide",
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
  typeBatiment: string;
  typeOccupation: string;
  codePostal: string;
  ville: string;
}) => {
  return createUpdateSchema(clients, {
    nomEntreprise: (schema) => schema.min(1, messages.nomEntreprise),
    siret: (schema) =>
      schema.refine((value) => !value || isValidSIRET(value), {
        message: messages.siret,
      }),
    prenomContact: (schema) => schema.min(1, messages.prenomContact),
    nomContact: (schema) => schema.min(1, messages.nomContact),
    posteContact: (schema) => schema.min(1, messages.posteContact),
    emailContact: (schema) => schema.email(messages.emailContact),
    phoneContact: (schema) =>
      schema.regex(
        /^(?:\+|00)?\d{1,4}[-.\s]?(?:\(?\d{1,4}\)?[-.\s]?)?\d{2,4}([-.\s]?\d{2,4}){2,3}$/,
        messages.phoneContact
      ),
    emailSignataire: (schema) =>
      schema.email(messages.emailContact).or(z.literal("")),
    surface: (schema) =>
      schema.min(1, messages.surface).max(3000, messages.surfaceMax),
    effectif: (schema) =>
      schema.min(1, messages.effectif).max(300, messages.effectifMax),
    typeBatiment: z.enum(
      ["bureaux", "localCommercial", "entrepot", "cabinetMedical"],
      { message: messages.typeBatiment }
    ),
    typeOccupation: z.enum(
      ["partieEtage", "plateauComplet", "batimentEntier"],
      {
        message: messages.typeOccupation,
      }
    ),
    codePostal: (schema) =>
      schema.refine((value) => /^\d{5}$/.test(value), {
        message: messages.codePostal,
      }),
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
  typeBatiment: "Type de batiment invalide",
  typeOccupation: "Type d'occupation invalide",
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
    surface: z
      .string()
      .refine(
        (value) =>
          /^\d+$/.test(value) &&
          parseInt(value, 10) >= 50 &&
          parseInt(value, 10) <= 3000,
        messages.surface
      ),
    effectif: z
      .string()
      .refine(
        (value) =>
          /^\d+$/.test(value) &&
          parseInt(value, 10) >= 1 &&
          parseInt(value, 10) <= 300,
        messages.effectif
      ),
    typeBatiment: z.enum(
      ["bureaux", "localCommercial", "entrepot", "cabinetMedical"],
      { message: messages.batiment }
    ),
    typeOccupation: z.enum(
      ["partieEtage", "plateauComplet", "batimentEntier"],
      { message: messages.occupation }
    ),
    codePostal: z.string().refine((value) => /^\d{5}$/.test(value), {
      message: messages.codePostal,
    }),
  });
};

export const mesLocauxSchema = createMesLocauxSchema({
  surface: "La surface doit être un nombre compris entre 50 et 3000 m²",
  effectif: "Le nombre de personnes doit être compris entre 1 et 300",
  batiment: "Type de batiment invalide",
  occupation: "Type d'occupation invalide",
  codePostal: "Code postal invalide, entrez 5 chiffres",
});

export type MesLocauxType = z.infer<typeof mesLocauxSchema>;
