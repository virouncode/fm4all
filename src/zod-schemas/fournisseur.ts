import { fournisseurs } from "@/db/schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { phoneNumberSchema } from "./phone";
import { siretSchema } from "./siret";

//SELECT
export const selectFournisseurSchema = createSelectSchema(fournisseurs, {
  nomFournisseur: (schema) => schema.min(1, "Nom du fournisseur obligatoire"),
  siret: siretSchema("Siret fournisseur invalide"),
  prenomContact: (schema) =>
    schema.min(1, "Prénom du contact fournisseur obligatoire"),
  nomContact: (schema) =>
    schema.min(1, "Nom du contact fournisseur obligatoire"),
  emailContact: (schema) =>
    schema.email("Email du contact fournisseur invalide"),
  phoneContact: phoneNumberSchema("Numéro de téléphone fournisseur invalide"),
});

export type SelectFournisseurType = z.infer<typeof selectFournisseurSchema>;

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
    siret: siretSchema(messages.siret),
    prenomContact: (schema) => schema.min(1, messages.prenomContact),
    nomContact: (schema) => schema.min(1, messages.nomContact),
    emailContact: (schema) => schema.email(messages.emailContact),
    phoneContact: phoneNumberSchema(messages.phoneContact),
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

export type InsertFournisseurType = z.infer<typeof insertFournisseurSchema>;

//UPDATE
export const createUpdateFournisseurSchema = (messages: {
  nomFournisseur: string;
  siret: string;
  prenomContact: string;
  nomContact: string;
  emailContact: string;
  phoneContact: string;
  noteGoogle: string;
  anneeCreation: string;
  nbClients: string;
  nbAvis: string;
}) => {
  return createUpdateSchema(fournisseurs, {
    nomFournisseur: (schema) => schema.min(1, messages.nomFournisseur),
    siret: siretSchema(messages.siret),
    prenomContact: (schema) => schema.min(1, messages.prenomContact),
    nomContact: (schema) => schema.min(1, messages.nomContact),
    emailContact: (schema) => schema.email(messages.emailContact),
    phoneContact: phoneNumberSchema(messages.phoneContact),
    slogan: (schema) => schema.optional(),
    presentation: (schema) => schema.optional(),
    logoUrl: (schema) => schema.optional(),
    locationUrl: (schema) => schema.optional(),
    noteGoogle: z
      .string()
      .trim()
      .refine((val) => !val || /^\d+([.,]\d+)?$/.test(val), {
        message: messages.noteGoogle,
      })
      .nullable(),
  });
};

// Version FR concrète
export const updateFournisseurSchema = createUpdateFournisseurSchema({
  nomFournisseur: "Nom du fournisseur obligatoire",
  siret: "Siret invalide, entrez 14 chiffres avec ou sans espaces",
  prenomContact: "Prénom du contact fournisseur obligatoire",
  nomContact: "Nom du contact fournisseur obligatoire",
  emailContact: "Email du contact fournisseur invalide",
  phoneContact: "Numéro de téléphone invalide",
  noteGoogle: "Note Google invalide",
  anneeCreation: "Année de création invalide",
  nbClients: "Nombre de clients invalide",
  nbAvis: "Nombre d'avis invalide",
});

export type UpdateFournisseurType = z.infer<typeof updateFournisseurSchema>;

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
    siret: siretSchema(messages.siret),
    prenomContact: (schema) => schema.min(1, messages.prenomContact),
    nomContact: (schema) => schema.min(1, messages.nomContact),
    emailContact: (schema) => schema.email(messages.emailContact),
    phoneContact: phoneNumberSchema(messages.phoneContact),
    noteGoogle: (schema) =>
      schema
        .refine((value) => !value || value.match(/^\d+([.,]\d+)?$/), {
          message: "Note Google invalide",
        })
        .nullable(),
  }).extend({
    noteGoogle: z
      .string()
      .refine((value) => !value || value.match(/^\d+([.,]\d+)?$/), {
        message: "Note Google invalide",
      })
      .nullable(),
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

export type UpdateFournisseurFormType = z.infer<
  typeof updateFournisseurFormSchema
>;

//=========================== ADMIN: QUERY SCHEMAS ============================//

import { DEFAULT_PAGE_SIZE } from "@/constants/pagination";
import { emptyStringToUndefinedOptional } from "@/normalize/emptyStringToUndefined";
import {
  normalizeSearchParams,
  RawSearchParams,
} from "@/normalize/normalizeSearchParams";
import { createSortSchema } from "@/zod-helpers/createSortSchema";

// Colonnes triables
export const SORTABLE_ADMIN_FOURNISSEURS_COLUMNS = {
  id: fournisseurs.id,
  nomFournisseur: fournisseurs.nomFournisseur,
  siret: fournisseurs.siret,
  prenomContact: fournisseurs.prenomContact,
  nomContact: fournisseurs.nomContact,
  emailContact: fournisseurs.emailContact,
  phoneContact: fournisseurs.phoneContact,
  createdAt: fournisseurs.createdAt,
  updatedAt: fournisseurs.updatedAt,
} as const;

export const adminFournisseursOrderBySchema = z.enum([
  "id",
  "nomFournisseur",
  "siret",
  "prenomContact",
  "nomContact",
  "emailContact",
  "phoneContact",
  "createdAt",
  "updatedAt",
]);

export type AdminFournisseursOrderByType = z.infer<
  typeof adminFournisseursOrderBySchema
>;

// Backend schema
const DEFAULT_ORDER_BY: AdminFournisseursOrderByType = "nomFournisseur";
const DEFAULT_ORDER_DIR: "asc" | "desc" = "asc";

export const adminFournisseursQueryBackendSchema = z.object({
  // Filtres
  nomFournisseur: z.string().optional(),
  siret: z.string().optional(),
  emailContact: z.string().optional(),
  phoneContact: z.string().optional(),
  // Tri
  orderBy: adminFournisseursOrderBySchema.default(DEFAULT_ORDER_BY),
  orderDir: z.enum(["asc", "desc"]).default(DEFAULT_ORDER_DIR),
  // Pagination
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(DEFAULT_PAGE_SIZE),
});

export type AdminFournisseursQueryBackendType = z.infer<
  typeof adminFournisseursQueryBackendSchema
>;

// Frontend filters
export const adminFournisseursQueryFiltersSchema = z
  .object({
    nomFournisseur: emptyStringToUndefinedOptional,
    siret: emptyStringToUndefinedOptional,
    emailContact: emptyStringToUndefinedOptional,
    phoneContact: emptyStringToUndefinedOptional,
  })
  .partial();

export type AdminFournisseursQueryFiltersType = z.infer<
  typeof adminFournisseursQueryFiltersSchema
>;

// Frontend schema complet (filtres + tri)
export const adminFournisseursQueryFrontendSchema =
  adminFournisseursQueryFiltersSchema.merge(
    createSortSchema(
      SORTABLE_ADMIN_FOURNISSEURS_COLUMNS,
      "nomFournisseur",
      "asc",
    ),
  );

export type AdminFournisseursQueryFrontendType = z.infer<
  typeof adminFournisseursQueryFrontendSchema
>;

// Parse function
export function parseAdminFournisseursQuery(raw: RawSearchParams) {
  const normalized = normalizeSearchParams(raw);
  const urlQuery = adminFournisseursQueryFrontendSchema.parse(normalized);

  const nomFournisseur =
    urlQuery.nomFournisseur &&
    urlQuery.nomFournisseur !== "all" &&
    urlQuery.nomFournisseur !== ""
      ? urlQuery.nomFournisseur
      : undefined;

  const siret =
    urlQuery.siret && urlQuery.siret !== "" ? urlQuery.siret : undefined;

  const emailContact =
    urlQuery.emailContact && urlQuery.emailContact !== ""
      ? urlQuery.emailContact
      : undefined;

  const phoneContact =
    urlQuery.phoneContact && urlQuery.phoneContact !== ""
      ? urlQuery.phoneContact
      : undefined;

  return adminFournisseursQueryBackendSchema.parse({
    nomFournisseur,
    siret,
    emailContact,
    phoneContact,
    orderBy: urlQuery.orderBy,
    orderDir: urlQuery.orderDir,
  });
}
