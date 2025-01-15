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
    schema.regex(
      /^\d{3} \d{3} \d{3} \d{4}$/,
      "Siret invalide, format attendu : XXX XXX XXX XXXX"
    ),
  prenomContact: (schema) => schema.min(1, "Prénom du contact obligatoire"),
  nomContact: (schema) => schema.min(1, "Nom du contact obligatoire"),
  emailContact: (schema) => schema.email("Adresse email invalide"),
  phoneContact: (schema) =>
    schema.regex(
      /^\d{2} \d{2} \d{2} \d{2} \d{2}$/,
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
  adresseLigne1: (schema) => schema.min(1, "Adresse ligne 1 obligatoire"),
  codePostal: (schema) =>
    schema.regex(/^\d{5}$/, "Code postal invalide, entrez 5 chiffres"),
  ville: (schema) => schema.min(1, "Ville obligatoire"),
});

export type SelectClientType = z.infer<typeof selectClientSchema>;

export const insertClientSchema = createInsertSchema(clients, {
  nomEntreprise: (schema) => schema.min(1, "Nom de l'entreprise obligatoire"),
  siret: (schema) =>
    schema.regex(
      /^\d{3} \d{3} \d{3} \d{4}$/,
      "Siret invalide, format attendu : XXX XXX XXX XXXX"
    ),
  prenomContact: (schema) => schema.min(1, "Prénom du contact obligatoire"),
  nomContact: (schema) => schema.min(1, "Nom du contact obligatoire"),
  emailContact: (schema) => schema.email("Adresse email invalide"),
  phoneContact: (schema) =>
    schema.regex(
      /^\d{2} \d{2} \d{2} \d{2} \d{2}$/,
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
  adresseLigne1: (schema) => schema.min(1, "Adresse ligne 1 obligatoire"),
  codePostal: (schema) =>
    schema.regex(/^\d{5}$/, "Code postal invalide, entrez 5 chiffres"),
  ville: (schema) => schema.min(1, "Ville obligatoire"),
});

export type InsertClientType = z.infer<typeof insertClientSchema>;
export type InsertClientFormType = Omit<
  InsertClientType,
  "surface" | "effectif"
> & {
  surface: string;
  effectif: string;
};

export const updateClientSchema = createUpdateSchema(clients, {
  nomEntreprise: (schema) => schema.min(1, "Nom de l'entreprise obligatoire"),
  siret: (schema) =>
    schema.regex(
      /^\d{3} \d{3} \d{3} \d{4}$/,
      "Siret invalide, format attendu : XXX XXX XXX XXXX"
    ),
  prenomContact: (schema) => schema.min(1, "Prénom du contact obligatoire"),
  nomContact: (schema) => schema.min(1, "Nom du contact obligatoire"),
  emailContact: (schema) => schema.email("Adresse email invalide"),
  phoneContact: (schema) =>
    schema.regex(
      /^\d{2} \d{2} \d{2} \d{2} \d{2}$/,
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
  adresseLigne1: (schema) => schema.min(1, "Adresse ligne 1 obligatoire"),
  codePostal: (schema) =>
    schema.regex(/^\d{5}$/, "Code postal invalide, entrez 5 chiffres"),
  ville: (schema) => schema.min(1, "Ville obligatoire"),
});

export type UpdateClientType = z.infer<typeof updateClientSchema>;
