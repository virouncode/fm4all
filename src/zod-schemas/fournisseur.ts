import { fournisseurs } from "@/db/schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

//SELECT
export const selectFournisseurSchema = createSelectSchema(fournisseurs, {
  nomFournisseur: (schema) => schema.min(1, "Nom du fournisseur obligatoire"),
  siret: (schema) =>
    schema.regex(/^\d{3} \d{3} \d{3} \d{5}$/, "Siret invalide"),
  prenomContact: (schema) =>
    schema.min(1, "Prénom du contact fournisseur obligatoire"),
  nomContact: (schema) =>
    schema.min(1, "Nom du contact fournisseur obligatoire"),
  emailContact: (schema) =>
    schema.email("Email du contact fournisseur invalide"),
  phoneContact: (schema) =>
    schema.regex(
      /^\d{2} \d{2} \d{2} \d{2} \d{2}$/,
      "Numéro de téléphone du contact fournisseur invalide"
    ),
}).extend({
  logoUrl: z
    .string()
    .refine(
      (val) => !val.trim() || /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(val),
      "Url du logo invalide"
    ),
  logoType: z.string().nonempty("Type du logo obligatoire"),
});

export type SelectFournisseurType = typeof selectFournisseurSchema._type;

//INSERT
export const insertFournisseurSchema = createInsertSchema(fournisseurs, {
  nomFournisseur: (schema) => schema.min(1, "Nom de l'entreprise obligatoire"),
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
  dateChiffrage: (schema) => schema.date("Date de chiffrage obligatoire"),
  status: z.string().nonempty("Statut obligatoire"),
}).extend({
  logo: z.any().nullable(),
});

export type InsertFournisseurType = typeof insertFournisseurSchema._type;

//UPDATE
export const updateFournisseurSchema = createUpdateSchema(fournisseurs, {
  nomFournisseur: (schema) => schema.min(1, "Nom de l'entreprise obligatoire"),
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
  dateChiffrage: (schema) => schema.date("Date de chiffrage obligatoire"),
  status: z.string().nonempty("Statut obligatoire"),
}).extend({
  logo: z.any().nullable(),
});

export type UpdateFournisseurType = typeof updateFournisseurSchema._type;
