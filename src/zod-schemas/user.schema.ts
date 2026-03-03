import { adhesionStatutCodes, roleAdhesionCodes } from "@/constants/codeTables";
import { user } from "@/db/schema/auth";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { phoneNumberSchemaEmpty } from "./phone.schema";
import { capitalizeWords, lower } from "@/zod-helpers/normalize";

// ==================== AUTO-GENERATED SCHEMAS ====================
export const selectUserSchema = createSelectSchema(user);
export const insertUserSchema = createInsertSchema(user).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  emailVerified: true,
});

export type SelectUserType = z.infer<typeof selectUserSchema>;
export type InsertUserType = z.infer<typeof insertUserSchema>;

// ==================== FORM SCHEMAS ====================

// Schema pour formulaire de création utilisateur (base)
export const insertUserFormSchema = z.object({
  prenom: z
    .string()
    .min(1, "Le prénom est requis")
    .max(100)
    .transform((v) => capitalizeWords(v)), // Nettoyage
  nom: z
    .string()
    .min(1, "Le nom est requis")
    .max(100)
    .transform((v) => capitalizeWords(v)), // Nettoyage
  email: z
    .email("Email invalide")
    .transform((v) => lower(v)), // Nettoyage
  phone: phoneNumberSchemaEmpty("Numéro de téléphone invalide").optional(),
  avatar: z
    .object({
      storageKey: z.string(),
      filename: z.string(),
      mimeType: z.string(),
      sizeBytes: z.number(),
      previewUrl: z.string().optional(),
    })
    .optional()
    .nullable(),
  roleAdhesion: z.enum(roleAdhesionCodes),

  // Hiérarchie
  parentId: z.uuid().optional().nullable(),
});

export type InsertUserFormType = z.infer<typeof insertUserFormSchema>;

// Schema pour DB insert (avec computed fields)
export const insertUserToDbSchema = insertUserSchema.extend({
  name: z.string(), // Computed: `${prenom} ${nom}`
  image: z.string().nullable().default(null), // Toujours null (better-auth compat)
  avatarId: z.uuid().nullable(), // Set après création document
  createdById: z.uuid(),
  updatedById: z.uuid(),
});

export type InsertUserToDbType = z.infer<typeof insertUserToDbSchema>;

// Schema pour update utilisateur
export const updateUserFormSchema = z.object({
  id: z.uuid(),
  prenom: z.string().min(1).max(100).optional(),
  nom: z.string().min(1).max(100).optional(),
  email: z.email().optional(),
  phone: phoneNumberSchemaEmpty("Numéro de téléphone invalide")
    .optional()
    .nullable(),

  avatar: z
    .object({
      storageKey: z.string(),
      filename: z.string(),
      mimeType: z.string(),
      sizeBytes: z.number(),
      previewUrl: z.string().optional(),
    })
    .optional()
    .nullable(),

  // Modifiables uniquement si on édite quelqu'un de niveau inférieur (pas soi-même)
  roleAdhesion: z.enum(roleAdhesionCodes).optional(),
  statut: z.enum(adhesionStatutCodes).optional(),
});

export type UpdateUserFormType = z.infer<typeof updateUserFormSchema>;

export const updateUserToDbSchema = z.object({
  prenom: z.string().optional(),
  nom: z.string().optional(),
  name: z.string().optional(), // Recomputed si prenom/nom changent
  email: z.string().optional(),
  phone: z.string().nullable().optional(),
  avatarId: z.uuid().nullable().optional(),
  updatedById: z.uuid(),
});

export type UpdateUserToDbType = z.infer<typeof updateUserToDbSchema>;

// ==================== QUERY SCHEMAS ====================

export const usersOrderBySchema = z.enum([
  "prenom",
  "nom",
  "email",
  "createdAt",
]);
export const DEFAULT_ORDER_BY = "nom" as const;
export const DEFAULT_ORDER_DIR = "asc" as const;

// Backend query schema (from URL params)
export const usersQueryBackendSchema = z.object({
  entrepriseId: z.uuid(),

  // Filters
  search: z.string().optional(), // Recherche nom/prénom/email (case-insensitive, any order)
  roleAdhesion: z.enum(roleAdhesionCodes).optional(),
  statutAdhesion: z.enum(adhesionStatutCodes).optional(),

  // Sorting & pagination
  orderBy: usersOrderBySchema.default(DEFAULT_ORDER_BY),
  orderDir: z.enum(["asc", "desc"]).default(DEFAULT_ORDER_DIR),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(50),
});

export type UsersQueryBackendType = z.infer<typeof usersQueryBackendSchema>;

// Frontend query schema (URL params are strings)
export const usersQueryFrontendSchema = z
  .object({
    search: z.string().optional(),
    roleAdhesion: z.enum(roleAdhesionCodes).or(z.literal("all")).optional(),
    statutAdhesion: z.enum(adhesionStatutCodes).or(z.literal("all")).optional(),
    orderBy: z.string().optional(),
    orderDir: z.string().optional(),
    page: z.string().optional(),
    pageSize: z.string().optional(),
  })
  .partial();

export type UsersQueryFrontendType = z.infer<typeof usersQueryFrontendSchema>;

// Parser: URL params string → Backend typed params
export function parseUsersQuery(
  raw: Record<string, string | string[] | undefined>,
): UsersQueryBackendType {
  // Normalize arrays to single values
  const normalized: Record<string, string | undefined> = {};
  for (const key in raw) {
    normalized[key] = Array.isArray(raw[key]) ? raw[key][0] : raw[key];
  }

  const urlQuery = usersQueryFrontendSchema.parse(normalized);

  // Convert frontend → backend types
  return usersQueryBackendSchema.parse({
    roleAdhesion:
      urlQuery.roleAdhesion === "all" ? undefined : urlQuery.roleAdhesion,
    statutAdhesion:
      urlQuery.statutAdhesion === "all" ? undefined : urlQuery.statutAdhesion,
    search: urlQuery.search,
    orderBy: urlQuery.orderBy || DEFAULT_ORDER_BY,
    orderDir: urlQuery.orderDir || DEFAULT_ORDER_DIR,
    page: urlQuery.page ? parseInt(urlQuery.page, 10) : 1,
    pageSize: urlQuery.pageSize ? parseInt(urlQuery.pageSize, 10) : 50,
  });
}

// ==================== USER WITH RELATIONS ====================

export const userWithAdhesionSchema = selectUserSchema.extend({
  adhesion: z
    .object({
      role: z.enum(roleAdhesionCodes),
      statut: z.enum(adhesionStatutCodes),
    })
    .nullable(),
  avatar: z
    .object({
      storageKey: z.string(),
      storageProvider: z.enum(["s3", "vercel_blob"]),
      filename: z.string(),
      mimeType: z.string(),
      sizeBytes: z.number(),
    })
    .nullable(),
});

export type UserWithAdhesionType = z.infer<typeof userWithAdhesionSchema>;

// ==================== TREE NODE ====================

export type UserTreeNode = SelectUserType & {
  children: UserTreeNode[];
  adhesion?: {
    role: (typeof roleAdhesionCodes)[number];
    statut: (typeof adhesionStatutCodes)[number];
  } | null;
  avatar?: {
    storageKey: string;
    storageProvider: "s3" | "vercel_blob";
    filename: string;
    mimeType: string;
    sizeBytes: number;
  } | null;
};
