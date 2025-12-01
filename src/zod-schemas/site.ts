import { emptyStringToUndefinedOptional } from "@/normalize/emptyStringToUndefined";
import {
  RawSearchParams,
  normalizeSearchParams,
} from "@/normalize/normalizeSearchParams";
import { z } from "zod";
import { sites } from "../db/schema";
import { typeBatimentSchema, typeOccupationSchema } from "./client"; // adapte le chemin si besoin
import { codePostalSchema } from "./codePostal";

// ================== SELECT ================== //

export const selectSiteSchema = z.object({
  id: z.number().positive("ID du site invalide"),
  clientId: z.number().positive("ID du client invalide"),
  nomSite: z.string().min(1, "Nom du site obligatoire"),
  adresseLigne1: z.string().min(1, "Adresse ligne 1 obligatoire"),
  adresseLigne2: z.string().nullable(),
  codePostal: codePostalSchema,
  ville: z.string().min(1, "Ville obligatoire"),
  surface: z
    .number()
    .min(1, "Surface minimum 1 m²")
    .max(3000, "Surface maximum 3000 m²"),
  effectif: z
    .number()
    .min(1, "Effectif minimum 1 personne")
    .max(300, "Effectif maximum 300 personnes"),
  typeBatiment: typeBatimentSchema,
  typeOccupation: typeOccupationSchema,
  commentaires: z.string().nullable(),
  createdById: z.string().nullable(),
  updatedById: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type SelectSiteType = z.infer<typeof selectSiteSchema>;

// ================== INSERT ================== //

export const insertSiteSchema = z.object({
  clientId: z.number().positive("ID du client invalide"),
  nomSite: z.string().min(1, "Nom du site obligatoire"),
  adresseLigne1: z.string().min(1, "Adresse ligne 1 obligatoire"),
  adresseLigne2: z.string().nullable(),
  codePostal: codePostalSchema,
  ville: z.string().min(1, "Ville obligatoire"),
  surface: z
    .number()
    .min(1, "Surface minimum 1 m²")
    .max(3000, "Surface maximum 3000 m²"),
  effectif: z
    .number()
    .min(1, "Effectif minimum 1 personne")
    .max(300, "Effectif maximum 300 personnes"),
  typeBatiment: typeBatimentSchema,
  typeOccupation: typeOccupationSchema,
  commentaires: z.string().nullable(),
});

export type InsertSiteType = z.infer<typeof insertSiteSchema>;

export const insertSiteToDbSchema = insertSiteSchema.extend({
  createdById: z.string().min(1, "ID de l'utilisateur créateur obligatoire"),
  updatedById: z
    .string() //c'est normal que ce soit un string ici car dans la table users id est un string
    .min(1, "ID de l'utilisateur modificateur obligatoire"),
});

export type InsertSiteToDbType = z.infer<typeof insertSiteToDbSchema>;

// ================== UPDATE ================== //

export const updateSiteSchema = insertSiteSchema
  .partial()
  .extend({ id: z.number().positive("ID du site invalide") });

export type UpdateSiteType = z.infer<typeof updateSiteSchema>;

export const updateSiteInDbSchema = updateSiteSchema.extend({
  updatedById: z
    .string() //c'est normal que ce soit un string ici car dans la table users id est un string
    .min(1, "ID de l'utilisateur modificateur obligatoire"),
});

export type UpdateSiteInDbType = z.infer<typeof updateSiteInDbSchema>;

//================= FORMS =================//

export const insertSiteFormSchema = z.object({
  nomSite: z.string().min(1, "Nom du site obligatoire"),
  adresseLigne1: z.string().min(1, "Adresse ligne 1 obligatoire"),
  adresseLigne2: z.string().nullable(),
  codePostal: codePostalSchema,
  ville: z.string().min(1, "Ville obligatoire"),
  surface: z.coerce
    .number("Surface invalide")
    .int("Surface doit être un entier")
    .min(1, "Surface minimum 1 m²")
    .max(3000, "Surface maximum 3000 m²"),

  effectif: z.coerce
    .number("Effectif invalide")
    .int("Effectif doit être un entier")
    .min(1, "Effectif minimum 1 personne")
    .max(300, "Effectif maximum 300 personnes"),
  typeBatiment: typeBatimentSchema,
  typeOccupation: typeOccupationSchema,
  commentaires: z.string().nullable(),
});

export type InsertSiteFormType = z.input<typeof insertSiteFormSchema>;

export const updateSiteFormSchema = insertSiteFormSchema.partial().extend({
  id: z.number().positive("ID du site invalide"),
});

export type UpdateSiteFormType = z.input<typeof updateSiteFormSchema>;

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
