import { user } from "@/db/schema";
import {
  normalizeSearchParams,
  RawSearchParams,
} from "@/normalize/normalizeSearchParams";
import { createSortSchema } from "@/zod-helpers/createSortSchema";
import { capitalizeWords } from "@/zod-helpers/normalize";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { phoneNumberSchema } from "./phone";
import { userRoleSchema } from "./enums";

//SELECT
export const selectUserSchema = createSelectSchema(user);
export type SelectUserType = z.infer<typeof selectUserSchema>;

export const insertUserSchema = createInsertSchema(user).omit({
  id: true,
  emailVerified: true,
  updatedAt: true,
  createdAt: true,
});
export type InsertUserType = z.infer<typeof insertUserSchema>;

export const updateUserSchema = createUpdateSchema(user).omit({
  createdAt: true,
  updatedAt: true,
  emailVerified: true,
  clientId: true, //ne peut pas être modifié
});
export type UpdateUserType = z.infer<typeof updateUserSchema>;

//======================= FORM SCHEMAS ==========================//
export const insertUserFormSchema = z.object({
  firstName: z
    .string()
    .min(1, "Le prénom est obligatoire")
    .transform((val) => capitalizeWords(val)),
  lastName: z
    .string()
    .min(1, "Le nom est obligatoire")
    .transform((val) => capitalizeWords(val)),
  email: z.email("Email invalide").transform((val) => val.toLowerCase()),
  role: userRoleSchema,
  phone: phoneNumberSchema("N° de téléphone invalide"),
  avatarAttachment: z
    .object({
      url: z.url("URL invalide"),
      filename: z.string(),
      mimeType: z.string(),
      size: z.number(),
    })
    .nullable(),
});

export type InsertUserFormType = z.infer<typeof insertUserFormSchema>;

export const updateUserFormSchema = insertUserFormSchema.partial().extend({
  id: z.string().min(1, "ID de l'utilisateur obligatoire"),
});
export type UpdateUserFormType = z.infer<typeof updateUserFormSchema>;

//================== USERS QUERY PARAMS ==================//
export const SORTABLE_CLIENT_USERS_COLUMNS = {
  lastName: user.lastName,
  firstName: user.firstName,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  phone: user.phone,
} as const;

export const clientUsersOrderBySchema = z.enum([
  "lastName",
  "firstName",
  "email",
  "phone",
  "createdAt",
  "updatedAt",
]);

export type ClientUsersSortableColumnType = z.infer<
  typeof clientUsersOrderBySchema
>;

const DEFAULT_ORDER_BY: ClientUsersSortableColumnType = "lastName";
const DEFAULT_ORDER_DIR: "asc" | "desc" = "asc";

export const clientUsersQueryBackendSchema = z.object({
  //filtres
  lastName: z.string().optional(),
  firstName: z.string().optional(),
  email: z.string().optional(),
  //tri
  orderBy: clientUsersOrderBySchema.default(DEFAULT_ORDER_BY),
  orderDir: z.enum(["asc", "desc"]).default(DEFAULT_ORDER_DIR),
});

export type ClientUsersQueryBackendType = z.infer<
  typeof clientUsersQueryBackendSchema
>;

export const clientUsersQueryFiltersSchema = z
  .object({
    lastName: z.string().optional(),
    firstName: z.string().optional(),
    email: z.string().optional(),
  })
  .partial();

export type ClientUsersQueryFiltersType = z.infer<
  typeof clientUsersQueryFiltersSchema
>;

//filtres + tri
export const clientUsersQueryFrontendSchema =
  clientUsersQueryFiltersSchema.merge(
    createSortSchema(SORTABLE_CLIENT_USERS_COLUMNS, "lastName"), // orderBy, orderDir
  );

export type ClientUsersQueryFrontendType = z.infer<
  typeof clientUsersQueryFrontendSchema
>;

export function parseClientUsersQuery(
  raw: RawSearchParams,
): ClientUsersQueryBackendType {
  const normalized = normalizeSearchParams(raw);
  const urlQuery = clientUsersQueryFrontendSchema.parse(normalized);
  const orderBy =
    urlQuery.orderBy &&
    Object.keys(SORTABLE_CLIENT_USERS_COLUMNS).includes(urlQuery.orderBy)
      ? (urlQuery.orderBy as ClientUsersSortableColumnType)
      : DEFAULT_ORDER_BY;

  const orderDir =
    urlQuery.orderDir === "asc" || urlQuery.orderDir === "desc"
      ? urlQuery.orderDir
      : DEFAULT_ORDER_DIR;
  return {
    lastName: urlQuery.lastName,
    firstName: urlQuery.firstName,
    email: urlQuery.email,
    orderBy,
    orderDir,
  };
}
