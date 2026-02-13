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
    .transform((v) => capitalizeWords(v)),
  parentId: z.uuid().nullable().optional(), // null = racine
  adresseLigne1: z
    .string()
    .min(1, "Adresse ligne 1 obligatoire")
    .transform((v) => capitalizeWords(v)),
  adresseLigne2: z
    .string()
    .optional()
    .transform((v) => (v ? capitalizeWords(v) : null)),
  codePostal: codePostalSchema("Code postal invalide (5 chiffres)"),
  ville: z
    .string()
    .min(1, "Ville obligatoire")
    .transform((v) => capitalizeWords(v)),
  surface: z
    .string()
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 50 && Number(v) <= 3000,
      "La surface doit être un nombre compris entre 50 et 3000 m²",
    ),
  effectif: z
    .string()
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 1 && Number(v) <= 300,
      "Le nombre de personnes doit être compris entre 1 et 300",
    ),
  typeBatiment: typeBatimentSchema,
  typeOccupation: typeOccupationSchema,
  commentaires: z
    .string()
    .optional()
    .transform((v) => v || null),
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

// ==================== TREE TYPES ====================

export type SiteTreeNode = SelectSiteType & {
  children: SiteTreeNode[];
};
