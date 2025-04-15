import { fournisseurs } from "@/db/schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

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
});

export type SelectFournisseurType = typeof selectFournisseurSchema._type;

//INSERT
export const insertFournisseurSchema = createInsertSchema(fournisseurs, {
  nomFournisseur: (schema) => schema.min(1, "Nom de l'entreprise obligatoire"),
  siret: (schema) =>
    schema.refine(
      (value) => !value || /^\d{3} \d{3} \d{3} \d{5}$/.test(value),
      { message: "Siret invalide, format attendu: 123 456 789 12345" }
    ),
  prenomContact: (schema) => schema.min(1, "Prénom du contact obligatoire"),
  nomContact: (schema) => schema.min(1, "Nom du contact obligatoire"),
  emailContact: (schema) => schema.email("Email du contact invalide"),
  phoneContact: (schema) => schema.min(1, "Numéro de téléphone obligatoire"),
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
});

export type UpdateFournisseurType = typeof updateFournisseurSchema._type;
