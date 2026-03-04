import { sites } from "@/db/schema/sites";
import { capitalizeWords } from "@/zod-helpers/normalize";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { codePostalSchema } from "./codePostal.schema";
import { typeBatimentSchema, typeOccupationSchema } from "./enums";

// ==================== BASE SCHEMAS (FROM DB) ====================

// SELECT SCHEMA
export const selectSiteSchema = createSelectSchema(sites);
export type SelectSiteType = z.infer<typeof selectSiteSchema>;

// INSERT SCHEMA (omit auto-generated fields)
export const insertSiteSchema = createInsertSchema(sites).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
});
export type InsertSiteType = z.infer<typeof insertSiteSchema>;

// INSERT TO DB (add server-side fields)
export const insertSiteToDbSchema = insertSiteSchema.extend({
  createdById: z.string().min(1, "ID de l'utilisateur créateur obligatoire"),
  updatedById: z
    .string()
    .min(1, "ID de l'utilisateur modificateur obligatoire"),
});
export type InsertSiteToDbType = z.infer<typeof insertSiteToDbSchema>;

// UPDATE SCHEMA
export const updateSiteSchema = createUpdateSchema(sites)
  .omit({
    createdAt: true,
    updatedAt: true,
    createdById: true,
    updatedById: true,
    entrepriseId: true, // cannot change enterprise
  })
  .extend({
    id: z.uuid("ID du site invalide"),
  });
export type UpdateSiteType = z.infer<typeof updateSiteSchema>;

// UPDATE TO DB (add updatedById)
export const updateSiteToDbSchema = updateSiteSchema
  .extend({
    updatedById: z
      .string()
      .min(1, "ID de l'utilisateur modificateur obligatoire"),
  })
  .omit({
    id: true, // not updated in the set clause
  });
export type UpdateSiteToDbType = z.infer<typeof updateSiteToDbSchema>;

// ==================== FORM SCHEMAS ====================
// Form uses string inputs for numbers, then converts

export const insertSiteFormSchema = z.object({
  nom: z
    .string()
    .min(1, "Nom du site obligatoire")
    .transform((v) => capitalizeWords(v)), // ✅ Nettoyage (string → string)
  parentId: z.uuid().nullable().optional(), // null = racine
  adresseLigne1: z
    .string()
    .min(1, "Adresse ligne 1 obligatoire")
    .transform((v) => capitalizeWords(v)), // ✅ Nettoyage (string → string)
  adresseLigne2: z.string().optional(), // ❌ PAS de transform (normalisation dans action)
  codePostal: codePostalSchema("Code postal invalide (5 chiffres)"),
  ville: z
    .string()
    .min(1, "Ville obligatoire")
    .transform((v) => capitalizeWords(v)), // ✅ Nettoyage (string → string)
  surface: z
    .string()
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 1 && Number(v) <= 3000,
      "La surface doit être un nombre compris entre 1 et 3000 m²",
    ),
  effectif: z
    .string()
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 1 && Number(v) <= 300,
      "Le nombre de personnes doit être compris entre 1 et 300",
    ),
  typeBatiment: typeBatimentSchema,
  typeOccupation: typeOccupationSchema,
  commentaires: z.string().optional(), // ❌ PAS de transform (normalisation dans action)
});
export type InsertSiteFormType = z.infer<typeof insertSiteFormSchema>;

export const updateSiteFormSchema = insertSiteFormSchema.partial().extend({
  id: z.uuid("ID du site invalide"),
  actif: z.boolean().optional(),
});
export type UpdateSiteFormType = z.infer<typeof updateSiteFormSchema>;

// ==================== QUERY SCHEMAS ====================

export const getSitesQuerySchema = z.object({
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
});
export type GetSitesQueryType = z.infer<typeof getSitesQuerySchema>;

// Schéma pour toutes les actions qui identifient un site dans une entreprise
export const siteByIdSchema = z.object({
  siteId: z.uuid("ID du site invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
});
export type SiteByIdType = z.infer<typeof siteByIdSchema>;

export const getAccessibleSitesSchema = z.object({
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
  /** Filtre optionnel : ne retourner que les sites où l'utilisateur a ce rôle */
  filterByRole: z.string().optional(),
});
export type GetAccessibleSitesType = z.infer<typeof getAccessibleSitesSchema>;

// Schéma pour l'action plateforme sans filtre d'entreprise
export const getAllSitesForPlatformSchema = z.object({});
export type GetAllSitesForPlatformType = z.infer<
  typeof getAllSitesForPlatformSchema
>;

// Schéma action INSERT site (form + entrepriseId serveur)
export const insertSiteActionSchema = insertSiteSchema.extend({
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
});
export type InsertSiteActionType = z.infer<typeof insertSiteActionSchema>;

// Schéma action UPDATE site (form + entrepriseId serveur)
export const updateSiteActionSchema = updateSiteSchema.extend({
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
});
export type UpdateSiteActionType = z.infer<typeof updateSiteActionSchema>;

// ==================== FILTER SCHEMAS ====================

export const sitesQueryFrontendSchema = z
  .object({
    nom: z.string().optional(),
    ville: z.string().optional(),
    typeBatiment: z.string().optional(),
    typeOccupation: z.string().optional(),
    surfaceMin: z.string().optional(),
    surfaceMax: z.string().optional(),
    effectifMin: z.string().optional(),
    effectifMax: z.string().optional(),
  })
  .partial();

export type SitesQueryFrontendType = z.infer<typeof sitesQueryFrontendSchema>;

// ==================== TREE TYPES ====================

export type SiteTreeNode = SelectSiteType & {
  children: SiteTreeNode[];
};
