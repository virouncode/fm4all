import { clients } from "@/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectClientSchema = createSelectSchema(clients, {
  nomEntreprise: (schema) => schema.min(1, "Nom de l'entreprise obligatoire"),
  siret: (schema) =>
    schema.regex(/^\d{3} \d{3} \d{3} \d{5}$/, "Siret invalide"),
  prenomContact: (schema) =>
    schema.min(1, "Prénom du contact client obligatoire"),
  nomContact: (schema) => schema.min(1, "Nom du contact client obligatoire"),
  emailContact: (schema) => schema.email("Email du contact client invalide"),
  phoneContact: (schema) =>
    schema.regex(
      /^\d{2} \d{2} \d{2} \d{2} \d{2}$/,
      "Numéro de téléphone du contact client invalide"
    ),
  surface: (schema) => schema.min(1, "Surface obligatoire"),
  effectif: (schema) => schema.min(1, "Effectif obligatoire"),
  typeBatiment: z.string().nonempty("Type de bâtiment du client obligatoire"),
  adresseLigne1: (schema) =>
    schema.min(1, "Adresse ligne 1 du client obligatoire"),
  codePostal: (schema) =>
    schema.regex(/^\d{5}$/, "Code postal du client invalide"),
  ville: (schema) => schema.min(1, "Ville du client obligatoire"),
});

export type SelectClientType = typeof selectClientSchema._type;

export const insertClientSchema = createInsertSchema(clients, {
  nomEntreprise: (schema) => schema.min(1, "Nom de l'entreprise obligatoire"),
  siret: (schema) =>
    schema.regex(
      /^\d{3} \d{3} \d{3} \d{5}$/,
      "Siret invalide, format attendu: 123 456 789 12345"
    ),
  prenomContact: (schema) => schema.min(1, "Prénom du contact obligatoire"),
  nomContact: (schema) => schema.min(1, "Nom du contact obligatoire"),
  emailContact: (schema) => schema.email("Email du contact invalide"),
  phoneContact: (schema) =>
    schema.regex(
      /^\d{2} \d{2} \d{2} \d{2} \d{2}$/,
      "Numéro de téléphone du contact invalide, format attendu: 01 23 45 67 89"
    ),
  surface: (schema) => schema.min(1, "Surface obligatoire"),
  effectif: (schema) => schema.min(1, "Effectif obligatoire"),
  typeBatiment: z.string().nonempty("Type de bâtiment obligatoire"),
  adresseLigne1: (schema) => schema.min(1, "Adresse ligne 1 obligatoire"),
  codePostal: (schema) =>
    schema.regex(/^\d{5}$/, "Code postal invalide, entrez 5 chiffres"),
  ville: (schema) => schema.min(1, "Ville obligatoire"),
});

export type InsertClientType = typeof insertClientSchema._type;

export const updateClientSchema = createInsertSchema(clients, {
  nomEntreprise: (schema) => schema.min(1, "Nom de l'entreprise obligatoire"),
  siret: (schema) =>
    schema.regex(
      /^\d{3} \d{3} \d{3} \d{5}$/,
      "Siret invalide, format attendu: 123 456 789 12345"
    ),
  prenomContact: (schema) => schema.min(1, "Prénom du contact obligatoire"),
  nomContact: (schema) => schema.min(1, "Nom du contact obligatoire"),
  emailContact: (schema) => schema.email("Email du contact  invalide"),
  phoneContact: (schema) =>
    schema.regex(
      /^\d{2} \d{2} \d{2} \d{2} \d{2}$/,
      "Numéro de téléphone du contact invalide, format attendu: 01 23 45 67 89"
    ),
  surface: (schema) => schema.min(1, "Surface obligatoire"),
  effectif: (schema) => schema.min(1, "Effectif obligatoire"),
  typeBatiment: z.string().nonempty("Type de bâtiment obligatoire"),
  adresseLigne1: (schema) => schema.min(1, "Adresse ligne 1 obligatoire"),
  codePostal: (schema) =>
    schema.regex(/^\d{5}$/, "Code postal invalide, entrez 5 chiffres"),
  ville: (schema) => schema.min(1, "Ville obligatoire"),
});
