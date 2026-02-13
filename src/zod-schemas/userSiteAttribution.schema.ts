import {
  attributionModeCodes,
  roleAttributionSiteCodes,
  siteAttributionScopeCodes,
} from "@/constants/codeTables";
import { userSiteAttributions } from "@/db/schema/users";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const roleAttributionSchema = z.enum(roleAttributionSiteCodes);
export type RoleAttributionType = z.infer<typeof roleAttributionSchema>;

export const siteAttributionScopeSchema = z.enum(siteAttributionScopeCodes);
export type SiteAttributionScopeType = z.infer<
  typeof siteAttributionScopeSchema
>;

export const attributionModeSchema = z.enum(attributionModeCodes);
export type AttributionModeType = z.infer<typeof attributionModeSchema>;

// SELECT schema (from DB)
export const selectUserSiteAttributionSchema =
  createSelectSchema(userSiteAttributions);
export type SelectUserSiteAttributionType = z.infer<
  typeof selectUserSiteAttributionSchema
>;

export const selectUserSiteAttributionWithSiteSchema =
  selectUserSiteAttributionSchema.extend({
    site: z.object({
      id: z.uuid(),
      nom: z.string(),
      parentId: z.uuid().nullable(),
    }),
  });

export type SelectUserSiteAttributionWithSiteType = z.infer<
  typeof selectUserSiteAttributionWithSiteSchema
>;

// Schema pour attributions avec héritage (utilisé par getUserSiteAttributions)
export const selectUserSiteAttributionWithInheritanceSchema =
  selectUserSiteAttributionWithSiteSchema.extend({
    isInherited: z.boolean(),
    inheritedFromSiteId: z.uuid().nullable(),
  });

export type SelectUserSiteAttributionWithInheritanceType = z.infer<
  typeof selectUserSiteAttributionWithInheritanceSchema
>;

// INSERT schema (single attribution)
export const insertUserSiteAttributionFormSchema = z.object({
  userId: z.uuid("ID utilisateur invalide"),
  siteId: z.uuid("ID site invalide"),
  mode: attributionModeSchema,
  scope: siteAttributionScopeSchema,
  role: roleAttributionSchema,
  entrepriseId: z.uuid("ID entreprise invalide"),
});
export type InsertUserSiteAttributionFormType = z.infer<
  typeof insertUserSiteAttributionFormSchema
>;

// BULK INSERT schema (multiple attributions avec même mode/scope/role)
export const bulkInsertUserSiteAttributionsFormSchema = z.object({
  userId: z.uuid("ID utilisateur invalide"),
  siteIds: z.array(z.uuid()).min(1, "Au moins un site doit être sélectionné"),
  mode: attributionModeSchema,
  scope: siteAttributionScopeSchema,
  role: roleAttributionSchema,
  entrepriseId: z.uuid("ID entreprise invalide"),
});
export type BulkInsertUserSiteAttributionsFormType = z.infer<
  typeof bulkInsertUserSiteAttributionsFormSchema
>;

// BULK INSERT avec attributions MIXTES (mode/scope/role différents par site)
// Utilisé pour les cas complexes : racines (inclure) + exclusions (exclure)
// Optionnel: exclusionsToDelete pour supprimer des exclusions existantes avant insertion
export const bulkInsertMixedAttributionsFormSchema = z.object({
  userId: z.uuid("ID utilisateur invalide"),
  entrepriseId: z.uuid("ID entreprise invalide"),
  attributions: z
    .array(
      z.object({
        siteId: z.uuid("ID site invalide"),
        mode: attributionModeSchema,
        scope: siteAttributionScopeSchema,
        role: roleAttributionSchema,
      }),
    )
    .min(1, "Au moins une attribution doit être fournie"),
  exclusionsToDelete: z.array(z.uuid()).optional(), // IDs des attributions mode=exclure à supprimer
});
export type BulkInsertMixedAttributionsFormType = z.infer<
  typeof bulkInsertMixedAttributionsFormSchema
>;

// DELETE schema
export const deleteUserSiteAttributionSchema = z.object({
  id: z.uuid("ID attribution invalide"),
  userId: z.uuid("ID utilisateur invalide"), // For permission check
});
export type DeleteUserSiteAttributionType = z.infer<
  typeof deleteUserSiteAttributionSchema
>;

// UPDATE schema
export const updateUserSiteAttributionFormSchema = z.object({
  id: z.uuid("ID attribution invalide"),
  userId: z.uuid("ID utilisateur invalide"), // For permission check
  mode: attributionModeSchema,
  scope: siteAttributionScopeSchema,
  role: roleAttributionSchema,
  entrepriseId: z.uuid("ID entreprise invalide"),
});
export type UpdateUserSiteAttributionFormType = z.infer<
  typeof updateUserSiteAttributionFormSchema
>;
