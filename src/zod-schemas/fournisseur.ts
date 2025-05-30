import { fournisseurs } from "@/db/schema";
import { isValidSIRET } from "@/lib/utils/isValideSIRET";
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
    schema.refine((value) => isValidSIRET(value), "Siret invalide"),
  prenomContact: (schema) =>
    schema.min(1, "Prénom du contact fournisseur obligatoire"),
  nomContact: (schema) =>
    schema.min(1, "Nom du contact fournisseur obligatoire"),
  emailContact: (schema) =>
    schema.email("Email du contact fournisseur invalide"),
  phoneContact: (schema) =>
    schema.regex(
      /^(?:\+|00)?\d{1,4}[-.\s]?(?:\(?\d{1,4}\)?[-.\s]?)?\d{2,4}([-.\s]?\d{2,4}){2,3}$/,
      "Numéro de téléphone invalide"
    ),
});

export type SelectFournisseurType = typeof selectFournisseurSchema._type;

//INSERT
export const createInsertFournisseurSchema = (messages: {
  nomFournisseur: string;
  siret: string;
  prenomContact: string;
  nomContact: string;
  emailContact: string;
  phoneContact: string;
}) => {
  return createInsertSchema(fournisseurs, {
    nomFournisseur: (schema) => schema.min(1, messages.nomFournisseur),
    siret: (schema) =>
      schema.refine((value) => isValidSIRET(value), messages.siret),
    prenomContact: (schema) => schema.min(1, messages.prenomContact),
    nomContact: (schema) => schema.min(1, messages.nomContact),
    emailContact: (schema) => schema.email(messages.emailContact),
    phoneContact: (schema) =>
      schema.regex(
        /^(?:\+|00)?\d{1,4}[-.\s]?(?:\(?\d{1,4}\)?[-.\s]?)?\d{2,4}([-.\s]?\d{2,4}){2,3}$/,
        messages.phoneContact
      ),
  });
};
export const insertFournisseurSchema = createInsertFournisseurSchema({
  nomFournisseur: "Nom de l'entreprise obligatoire",
  siret: "Siret invalide",
  prenomContact: "Prénom du contact obligatoire",
  nomContact: "Nom du contact obligatoire",
  emailContact: "Email du contact invalide",
  phoneContact: "Numéro de téléphone obligatoire",
});

export type InsertFournisseurType = typeof insertFournisseurSchema._type;

//UPDATE
export const updateFournisseurSchema = createUpdateSchema(fournisseurs, {
  nomFournisseur: (schema) => schema.min(1, "Nom de l'entreprise obligatoire"),
  siret: (schema) =>
    schema.refine((value) => !value || isValidSIRET(value), {
      message: "Siret invalide",
    }),
  prenomContact: (schema) => schema.min(1, "Prénom du contact obligatoire"),
  nomContact: (schema) => schema.min(1, "Nom du contact obligatoire"),
  emailContact: (schema) => schema.email("Email du contact invalide"),
  phoneContact: (schema) =>
    schema.regex(
      /^(?:\+|00)?\d{1,4}[-.\s]?(?:\(?\d{1,4}\)?[-.\s]?)?\d{2,4}([-.\s]?\d{2,4}){2,3}$/,
      "Numéro de téléphone invalide"
    ),
});

export type UpdateFournisseurType = typeof updateFournisseurSchema._type;

export const createUpdateFournisseurFormSchema = (messages: {
  nomFournisseur: string;
  siret: string;
  prenomContact: string;
  nomContact: string;
  emailContact: string;
  phoneContact: string;
}) => {
  return createUpdateSchema(fournisseurs, {
    nomFournisseur: (schema) => schema.min(1, messages.nomFournisseur),
    siret: (schema) =>
      schema.refine((value) => isValidSIRET(value), messages.siret),
    prenomContact: (schema) => schema.min(1, messages.prenomContact),
    nomContact: (schema) => schema.min(1, messages.nomContact),
    emailContact: (schema) => schema.email(messages.emailContact),
    phoneContact: (schema) =>
      schema.regex(
        /^(?:\+|00)?\d{1,4}[-.\s]?(?:\(?\d{1,4}\)?[-.\s]?)?\d{2,4}([-.\s]?\d{2,4}){2,3}$/,
        messages.phoneContact
      ),
    noteGoogle: (schema) =>
      schema
        .refine((value) => !value || value.match(/^\d+([.,]\d+)?$/), {
          message: "Note Google invalide",
        })
        .nullable(),
  }).extend({
    anneeCreation: z
      .string()
      .refine((value) => !value || value.match(/^\d{4}$/), {
        message: "Année de création invalide",
      })
      .nullable(),
    nbClients: z
      .string()
      .refine((value) => !value || value.match(/^\d+$/), {
        message: "Nombre de clients invalide",
      })
      .nullable(),
    nbAvis: z
      .string()
      .refine((value) => !value || value.match(/^\d+$/), {
        message: "Nombre d'avis invalide",
      })
      .nullable(),
  });
};
export const updateFournisseurFormSchema = createUpdateFournisseurFormSchema({
  nomFournisseur: "Nom de l'entreprise obligatoire",
  siret: "Siret invalide",
  prenomContact: "Prénom du contact obligatoire",
  nomContact: "Nom du contact obligatoire",
  emailContact: "Email du contact invalide",
  phoneContact: "Numéro de téléphone invalide",
});

export type UpdateFournisseurFormType =
  typeof updateFournisseurFormSchema._type;
