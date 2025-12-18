import { emptyStringToUndefinedOptional } from "@/normalize/emptyStringToUndefined";
import {
  RawSearchParams,
  normalizeSearchParams,
} from "@/normalize/normalizeSearchParams";
import { capitalizeWords } from "@/zod-helpers/normalize";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { sites } from "../db/schema";
import { codePostalSchema } from "./codePostal";
import { typeBatimentSchema, typeOccupationSchema } from "./enums";

export const selectSiteSchema = createSelectSchema(sites);
export type SelectSiteType = z.infer<typeof selectSiteSchema>;

export const insertSiteSchema = createInsertSchema(sites).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdById: true, //ajouté côté serveur
  updatedById: true, //ajouté côté serveur
  clientId: true, //ajouté côté serveur
});
export type InsertSiteType = z.infer<typeof insertSiteSchema>;

export const insertSiteToDbSchema = insertSiteSchema.extend({
  createdById: z.string().min(1, "ID de l'utilisateur créateur obligatoire"),
  updatedById: z
    .string() //c'est normal que ce soit un string ici car dans la table users id est un string
    .min(1, "ID de l'utilisateur modificateur obligatoire"),
  clientId: z.number().positive("ID du client invalide"),
});
export type InsertSiteToDbType = z.infer<typeof insertSiteToDbSchema>;

export const updateSiteSchema = createUpdateSchema(sites)
  .omit({
    createdAt: true,
    updatedAt: true,
    createdById: true, //ne peut pas être mis à jour
    updatedById: true, //ajouté côté serveur
    clientId: true, //ne peut pas être mis à jour
  })
  .extend({
    id: z.number().positive("ID du site invalide"),
  });
export type UpdateSiteType = z.infer<typeof updateSiteSchema>;

export const updateSiteInDbSchema = updateSiteSchema
  .extend({
    updatedById: z
      .string()
      .min(1, "ID de l'utilisateur modificateur obligatoire"),
  })
  .omit({
    id: true, //on ne met pas à jour l'id dans le parse
  });

export type UpdateSiteInDbType = z.infer<typeof updateSiteInDbSchema>;

//======================= FORM SCHEMAS ==========================//
//On ne peut pas appliquer des transform de type mais on peut appliquer des transform de nettoyage
export const insertSiteFormSchema = z.object({
  nomSite: z
    .string()
    .min(1, "Nom du site obligatoire")
    .transform((v) => capitalizeWords(v)),
  adresseLigne1: z
    .string()
    .min(1, "Adresse ligne 1 obligatoire")
    .transform((v) => capitalizeWords(v)),
  adresseLigne2: z.string().transform((v) => capitalizeWords(v)),
  codePostal: codePostalSchema("Code postal invalide"),
  ville: z
    .string()
    .min(1, "Ville obligatoire")
    .transform((v) => capitalizeWords(v)),
  surface: z
    .string()
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 50 && Number(v) <= 3000,
      "La surface doit être un nombre entre 50 et 3000 m²",
    ),
  effectif: z
    .string()
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 1 && Number(v) <= 300,
      "L'effectif doit être un nombre entre 1 et 300 personnes",
    ),
  typeBatiment: typeBatimentSchema,
  typeOccupation: typeOccupationSchema,
  commentaires: z.string(),
});
export type InsertSiteFormType = z.infer<typeof insertSiteFormSchema>;

export const updateSiteFormSchema = insertSiteFormSchema.partial().extend({
  id: z.number().positive("ID du site invalide"),
});

export type UpdateSiteFormType = z.infer<typeof updateSiteFormSchema>;

// ================== FILTERS + SORT ================== //
export const SORTABLE_SITES_COLUMNS = {
  id: sites.id,
  nomSite: sites.nomSite,
  codePostal: sites.codePostal,
  ville: sites.ville,
  surface: sites.surface,
  effectif: sites.effectif,
  typeBatiment: sites.typeBatiment,
  typeOccupation: sites.typeOccupation,
  createdAt: sites.createdAt,
  updatedAt: sites.updatedAt,
} as const;

export const sitesOrderBySchema = z.enum([
  "id",
  "nomSite",
  "codePostal",
  "ville",
  "surface",
  "effectif",
  "typeBatiment",
  "typeOccupation",
  "createdAt",
  "updatedAt",
]);

export type SitesSortableColumnType = z.infer<typeof sitesOrderBySchema>;

const DEFAULT_ORDER_BY: SitesSortableColumnType = "nomSite";
const DEFAULT_ORDER_DIR: "asc" | "desc" = "asc";

export const sitesQueryBackendSchema = z.object({
  //filters
  nomSite: z.string().optional(),
  codePostal: z.string().optional(),
  ville: z.string().optional(),
  typeBatiment: typeBatimentSchema.optional(),
  typeOccupation: typeOccupationSchema.optional(),
  //sort
  orderBy: sitesOrderBySchema.default(DEFAULT_ORDER_BY),
  orderDir: z.enum(["asc", "desc"]).default(DEFAULT_ORDER_DIR),
});

export type SitesQueryBackendType = z.infer<typeof sitesQueryBackendSchema>;

export const sitesQueryFiltersSchema = z
  .object({
    nomSite: emptyStringToUndefinedOptional,
    codePostal: emptyStringToUndefinedOptional,
    ville: emptyStringToUndefinedOptional,
    typeBatiment: typeBatimentSchema.or(z.literal("all")).optional(),
    typeOccupation: typeOccupationSchema.or(z.literal("all")).optional(),
  })
  .partial();

export type SitesQueryFiltersType = z.infer<typeof sitesQueryFiltersSchema>;

export const sitesQueryForntendSchema = sitesQueryFiltersSchema.merge(
  z.object({
    orderBy: sitesOrderBySchema.default(DEFAULT_ORDER_BY),
    orderDir: z.enum(["asc", "desc"]).default(DEFAULT_ORDER_DIR),
  }),
);

export function parseSitesQuery(raw: RawSearchParams): SitesQueryBackendType {
  const normalized = normalizeSearchParams(raw);
  const urlQuery = sitesQueryForntendSchema.parse(normalized);

  //conversion en types adaptés au backend
  const nomSite =
    urlQuery.nomSite && urlQuery.nomSite.trim().length > 0
      ? urlQuery.nomSite.trim()
      : undefined;
  const codePostal =
    urlQuery.codePostal && urlQuery.codePostal.trim().length > 0
      ? urlQuery.codePostal.trim()
      : undefined;
  const ville =
    urlQuery.ville && urlQuery.ville.trim().length > 0
      ? urlQuery.ville.trim()
      : undefined;
  const typeBatiment =
    urlQuery.typeBatiment && urlQuery.typeBatiment !== "all"
      ? urlQuery.typeBatiment
      : undefined;
  const typeOccupation =
    urlQuery.typeOccupation && urlQuery.typeOccupation !== "all"
      ? urlQuery.typeOccupation
      : undefined;
  const orderBy =
    urlQuery.orderBy &&
    Object.keys(SORTABLE_SITES_COLUMNS).includes(urlQuery.orderBy)
      ? (urlQuery.orderBy as SitesSortableColumnType)
      : DEFAULT_ORDER_BY;
  const orderDir =
    urlQuery.orderDir === "asc" || urlQuery.orderDir === "desc"
      ? urlQuery.orderDir
      : DEFAULT_ORDER_DIR;

  return sitesQueryBackendSchema.parse({
    nomSite,
    codePostal,
    ville,
    typeBatiment,
    typeOccupation,
    orderBy,
    orderDir,
  });
}

//=========================== ADMIN: QUERY SCHEMAS ============================//

import { DEFAULT_PAGE_SIZE } from "@/constants/pagination";
import { createSortSchema } from "@/zod-helpers/createSortSchema";

// Colonnes triables admin (ajout de clientId, adresseLigne1, adresseLigne2)
export const SORTABLE_ADMIN_SITES_COLUMNS = {
  id: sites.id,
  clientId: sites.clientId,
  nomSite: sites.nomSite,
  adresseLigne1: sites.adresseLigne1,
  adresseLigne2: sites.adresseLigne2,
  codePostal: sites.codePostal,
  ville: sites.ville,
  surface: sites.surface,
  effectif: sites.effectif,
  typeBatiment: sites.typeBatiment,
  typeOccupation: sites.typeOccupation,
  createdAt: sites.createdAt,
  updatedAt: sites.updatedAt,
} as const;

export const adminSitesOrderBySchema = z.enum([
  "id",
  "clientId",
  "nomSite",
  "adresseLigne1",
  "adresseLigne2",
  "codePostal",
  "ville",
  "surface",
  "effectif",
  "typeBatiment",
  "typeOccupation",
  "createdAt",
  "updatedAt",
]);

export type AdminSitesOrderByType = z.infer<typeof adminSitesOrderBySchema>;

// Backend schema avec clientId optionnel et pagination
const ADMIN_DEFAULT_ORDER_BY: AdminSitesOrderByType = "nomSite";
const ADMIN_DEFAULT_ORDER_DIR: "asc" | "desc" = "asc";

export const adminSitesQueryBackendSchema = z.object({
  // Filtres
  clientId: z.number().int().optional(),
  nomSite: z.string().optional(),
  adresseLigne1: z.string().optional(),
  codePostal: z.string().optional(),
  ville: z.string().optional(),
  typeBatiment: typeBatimentSchema.optional(),
  typeOccupation: typeOccupationSchema.optional(),
  // Tri
  orderBy: adminSitesOrderBySchema.default(ADMIN_DEFAULT_ORDER_BY),
  orderDir: z.enum(["asc", "desc"]).default(ADMIN_DEFAULT_ORDER_DIR),
  // Pagination
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(DEFAULT_PAGE_SIZE),
});
export type AdminSitesQueryBackendType = z.infer<
  typeof adminSitesQueryBackendSchema
>;

// Frontend filters avec clientId
export const adminSitesQueryFiltersSchema = z
  .object({
    clientId: emptyStringToUndefinedOptional,
    nomSite: emptyStringToUndefinedOptional,
    adresseLigne1: emptyStringToUndefinedOptional,
    codePostal: emptyStringToUndefinedOptional,
    ville: emptyStringToUndefinedOptional,
    typeBatiment: typeBatimentSchema.or(z.literal("all")).optional(),
    typeOccupation: typeOccupationSchema.or(z.literal("all")).optional(),
  })
  .partial();

export type AdminSitesQueryFiltersType = z.infer<
  typeof adminSitesQueryFiltersSchema
>;

// Frontend schema complet
export const adminSitesQueryFrontendSchema = adminSitesQueryFiltersSchema.merge(
  createSortSchema(SORTABLE_ADMIN_SITES_COLUMNS, "nomSite"),
);
export type AdminSitesQueryFrontendType = z.infer<
  typeof adminSitesQueryFrontendSchema
>;

// Parse function pour admin
export function parseAdminSitesQuery(
  raw: RawSearchParams,
): AdminSitesQueryBackendType {
  const normalized = normalizeSearchParams(raw);
  const urlQuery = adminSitesQueryFrontendSchema.parse(normalized);

  const clientId =
    urlQuery.clientId &&
    urlQuery.clientId !== "all" &&
    !Number.isNaN(Number(urlQuery.clientId))
      ? Number(urlQuery.clientId)
      : undefined;

  const nomSite =
    urlQuery.nomSite &&
    urlQuery.nomSite !== "all" &&
    urlQuery.nomSite.trim().length > 0
      ? urlQuery.nomSite.trim()
      : undefined;

  const adresseLigne1 =
    urlQuery.adresseLigne1 && urlQuery.adresseLigne1.trim().length > 0
      ? urlQuery.adresseLigne1.trim()
      : undefined;

  const codePostal =
    urlQuery.codePostal && urlQuery.codePostal.trim().length > 0
      ? urlQuery.codePostal.trim()
      : undefined;

  const ville =
    urlQuery.ville && urlQuery.ville.trim().length > 0
      ? urlQuery.ville.trim()
      : undefined;

  const typeBatiment =
    urlQuery.typeBatiment && urlQuery.typeBatiment !== "all"
      ? urlQuery.typeBatiment
      : undefined;

  const typeOccupation =
    urlQuery.typeOccupation && urlQuery.typeOccupation !== "all"
      ? urlQuery.typeOccupation
      : undefined;

  return adminSitesQueryBackendSchema.parse({
    clientId,
    nomSite,
    adresseLigne1,
    codePostal,
    ville,
    typeBatiment,
    typeOccupation,
    orderBy: urlQuery.orderBy,
    orderDir: urlQuery.orderDir,
  });
}
