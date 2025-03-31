import { clients } from "@/db/schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const selectClientSchema = createSelectSchema(clients, {
  nomEntreprise: (schema) => schema.min(1, "Nom de l'entreprise obligatoire"),
  siret: (schema) =>
    schema.refine(
      (value) => !value || /^\d{3} \d{3} \d{3} \d{5}$/.test(value),
      {
        message: "Siret invalide, format attendu : XXX XXX XXX XXXXX",
      }
    ),
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

export const insertClientSchema = createInsertSchema(clients, {
  nomEntreprise: (schema) => schema.min(1, "Nom de l'entreprise obligatoire"),
  siret: (schema) =>
    schema.refine(
      (value) => !value || /^\d{3} \d{3} \d{3} \d{5}$/.test(value),
      {
        message: "Siret invalide, format attendu : XXX XXX XXX XXXXX",
      }
    ),
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

export type InsertClientType = z.infer<typeof insertClientSchema>;

export const updateClientSchema = createUpdateSchema(clients, {
  nomEntreprise: (schema) => schema.min(1, "Nom de l'entreprise obligatoire"),
  siret: (schema) =>
    schema.refine(
      (value) => !value || /^\d{3} \d{3} \d{3} \d{5}$/.test(value),
      {
        message: "Siret invalide, format attendu : XXX XXX XXX XXXXX",
      }
    ),
  prenomContact: (schema) => schema.min(1, "Prénom du contact obligatoire"),
  nomContact: (schema) => schema.min(1, "Nom du contact obligatoire"),
  posteContact: (schema) => schema.min(1, "Poste du contact obligatoire"),
  emailContact: (schema) => schema.email("Adresse email invalide"),
  phoneContact: (schema) =>
    schema.regex(
      /^(?:\+|00)?\d{1,4}[-.\s]?(?:\(?\d{1,4}\)?[-.\s]?)?\d{2,4}([-.\s]?\d{2,4}){2,3}$/,
      "Numéro de téléphone invalide, format attendu : XX XX XX XX XX"
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

export type UpdateClientType = z.infer<typeof updateClientSchema>;

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
