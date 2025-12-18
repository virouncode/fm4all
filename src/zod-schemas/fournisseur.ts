import { fournisseurs } from "@/db/schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { phoneNumberSchema } from "./phone";

//SELECT
export const selectFournisseurSchema = createSelectSchema(fournisseurs);

export type SelectFournisseurType = z.infer<typeof selectFournisseurSchema>;

//INSERT
export const insertFournisseurSchema = createInsertSchema(fournisseurs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFournisseurType = z.infer<typeof insertFournisseurSchema>;

export const insertFournisseurToDbSchema = insertFournisseurSchema.extend({
  createdById: z.string().min(1, "ID de l'utilisateur créateur obligatoire"),
  updatedById: z
    .string()
    .min(1, "ID de l'utilisateur modificateur obligatoire"),
});

export type InsertFournisseurToDbType = z.infer<
  typeof insertFournisseurToDbSchema
>;

//UPDATE
export const updateFournisseurSchema = createUpdateSchema(fournisseurs)
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    id: z.number().positive("ID du fournisseur invalide"),
  });

export type UpdateFournisseurType = z.infer<typeof updateFournisseurSchema>;

export const updateFournissuerInDbSchema = updateFournisseurSchema
  .extend({
    updatedById: z
      .string()
      .min(1, "ID de l'utilisateur modificateur obligatoire"),
  })
  .omit({
    id: true,
  });

export type UpdateFournisseurInDbType = z.infer<
  typeof updateFournissuerInDbSchema
>;

//======================= ONBOARD FOURNISSEUR SCHEMAS ==========================//
// Pour créer un fournisseur + un user admin + les relations services-fournisseurs

import { insertUserSchema } from "./user";

export const onboardFournisseurSchema = z.object({
  fournisseur: insertFournisseurSchema,
  userAdmin: insertUserSchema,
  services: z
    .array(z.number().int().positive())
    .min(1, "Au moins un service requis"),
});

export type OnboardFournisseurType = z.infer<typeof onboardFournisseurSchema>;

//======================= FORM SCHEMAS ==========================//
//On ne peut pas appliquer des transform de type mais on peut appliquer des transform de nettoyage

export const onboardFournisseurFormSchema = z.object({
  fournisseur: z.object({
    nomFournisseur: z.string().min(1, "Le nom du fournisseur est obligatoire"),
    siret: siretSchema("SIRET invalide"),
    prenomContact: z.string().min(1, "Le prénom du contact est obligatoire"),
    nomContact: z.string().min(1, "Le nom du contact est obligatoire"),
    emailContact: z.string().email("Email du contact invalide"),
    phoneContact: phoneNumberSchema("Numéro de téléphone du contact invalide"),
    logoUrl: z.string().url("URL invalide").nullable().optional(),
  }),
  services: z
    .array(z.number().int().positive())
    .min(1, "Ajoutez au moins un service"),
});

export type OnboardFournisseurFormType = z.infer<
  typeof onboardFournisseurFormSchema
>;

// Schéma de mise à jour d'un fournisseur par l'admin (avec services)
export const updateFournisseurForAdminFormSchema = z.object({
  id: z.number().positive("ID du fournisseur invalide"),
  fournisseur: z.object({
    nomFournisseur: z.string().min(1, "Le nom du fournisseur est obligatoire"),
    siret: siretSchema("SIRET invalide"),
    prenomContact: z.string().min(1, "Le prénom du contact est obligatoire"),
    nomContact: z.string().min(1, "Le nom du contact est obligatoire"),
    emailContact: z.string().email("Email du contact invalide"),
    phoneContact: phoneNumberSchema("Numéro de téléphone du contact invalide"),
    logoUrl: z.string().url("URL invalide").nullable().optional(),
  }),
  services: z
    .array(z.number().int().positive())
    .min(1, "Ajoutez au moins un service"),
});

export type UpdateFournisseurForAdminFormType = z.infer<
  typeof updateFournisseurForAdminFormSchema
>;

//=========================== ADMIN: QUERY SCHEMAS ============================//

import { DEFAULT_PAGE_SIZE } from "@/constants/pagination";
import { emptyStringToUndefinedOptional } from "@/normalize/emptyStringToUndefined";
import {
  normalizeSearchParams,
  RawSearchParams,
} from "@/normalize/normalizeSearchParams";
import { createSortSchema } from "@/zod-helpers/createSortSchema";
import { siretSchema } from "./siret";

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
