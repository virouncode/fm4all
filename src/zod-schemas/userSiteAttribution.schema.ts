import {
  attributionModeCodes,
  roleClientAttributionSiteCodes,
  siteAttributionScopeCodes,
} from "@/constants/codeTables";
import { userClientSiteAttributions } from "@/db/schema/users";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const roleClientAttributionSchema = z.enum(
  roleClientAttributionSiteCodes,
);
export type RoleClientAttributionType = z.infer<
  typeof roleClientAttributionSchema
>;

export const siteAttributionScopeSchema = z.enum(siteAttributionScopeCodes);
export type SiteAttributionScopeType = z.infer<
  typeof siteAttributionScopeSchema
>;

export const attributionModeSchema = z.enum(attributionModeCodes);
export type AttributionModeType = z.infer<typeof attributionModeSchema>;

// SELECT schema (from DB)
export const selectUserClientSiteAttributionSchema = createSelectSchema(
  userClientSiteAttributions,
);
export type SelectUserClientSiteAttributionType = z.infer<
  typeof selectUserClientSiteAttributionSchema
>;

export const selectUserSiteAttributionWithSiteSchema =
  selectUserClientSiteAttributionSchema.extend({
    site: z.object({
      id: z.uuid(),
      nom: z.string(),
      parentId: z.uuid().nullable(),
    }),
  });

export type SelectUserSiteAttributionWithSiteType = z.infer<
  typeof selectUserSiteAttributionWithSiteSchema
>;

// Schema pour attributions avec héritage (utilisé par getUserClientSiteAttributions)
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
  role: roleClientAttributionSchema,
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
  role: roleClientAttributionSchema,
  entrepriseId: z.uuid("ID entreprise invalide"),
});
export type BulkInsertUserSiteAttributionsFormType = z.infer<
  typeof bulkInsertUserSiteAttributionsFormSchema
>;

// BULK INSERT avec attributions MIXTES (mode/scope/role différents par site)
export const bulkInsertMixedAttributionsFormSchema = z.object({
  userId: z.uuid("ID utilisateur invalide"),
  entrepriseId: z.uuid("ID entreprise invalide"),
  attributions: z
    .array(
      z.object({
        siteId: z.uuid("ID site invalide"),
        mode: attributionModeSchema,
        scope: siteAttributionScopeSchema,
        role: roleClientAttributionSchema,
      }),
    )
    .min(1, "Au moins une attribution doit être fournie"),
  exclusionsToDelete: z.array(z.uuid()).optional(),
});
export type BulkInsertMixedAttributionsFormType = z.infer<
  typeof bulkInsertMixedAttributionsFormSchema
>;

// DELETE schema
export const deleteUserSiteAttributionSchema = z.object({
  id: z.uuid("ID attribution invalide"),
  userId: z.uuid("ID utilisateur invalide"),
});
export type DeleteUserSiteAttributionType = z.infer<
  typeof deleteUserSiteAttributionSchema
>;

// UPDATE schema
export const updateUserSiteAttributionFormSchema = z.object({
  id: z.uuid("ID attribution invalide"),
  userId: z.uuid("ID utilisateur invalide"),
  mode: attributionModeSchema,
  scope: siteAttributionScopeSchema,
  role: roleClientAttributionSchema,
  entrepriseId: z.uuid("ID entreprise invalide"),
});
export type UpdateUserSiteAttributionFormType = z.infer<
  typeof updateUserSiteAttributionFormSchema
>;
