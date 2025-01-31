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
      (value) => !value || /^\d{3} \d{3} \d{3} \d{4}$/.test(value),
      {
        message: "Siret invalide, format attendu : XXX XXX XXX XXXX",
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
      (value) => !value || /^\d{3} \d{3} \d{3} \d{4}$/.test(value),
      {
        message: "Siret invalide, format attendu : XXX XXX XXX XXXX",
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
      (value) => !value || /^\d{3} \d{3} \d{3} \d{4}$/.test(value),
      {
        message: "Siret invalide, format attendu : XXX XXX XXX XXXX",
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

export const mesLocauxSchema = z.object({
  surface: z
    .string()
    .refine(
      (value) =>
        /^\d+$/.test(value) &&
        parseInt(value, 10) >= 50 &&
        parseInt(value, 10) <= 3000,
      "La surface doit être un nombre compris entre 50 et 3000 m²"
    ),
  effectif: z
    .string()
    .refine(
      (value) =>
        /^\d+$/.test(value) &&
        parseInt(value, 10) >= 1 &&
        parseInt(value, 10) <= 300,
      "Le nombre de personnes doit être compris entre 1 et 300"
    ),
  typeBatiment: z.enum(
    ["bureaux", "localCommercial", "entrepot", "cabinetMedical"],
    { message: "Type de batiment invalide" }
  ),
  typeOccupation: z.enum(["partieEtage", "plateauComplet", "batimentEntier"], {
    message: "Type d'occupation invalide",
  }),
  codePostal: z.string().refine((value) => /^\d{5}$/.test(value), {
    message: "Code postal invalide, entrez 5 chiffres",
  }),
});

export type MesLocauxType = z.infer<typeof mesLocauxSchema>;
