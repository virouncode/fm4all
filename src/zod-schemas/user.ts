import { roleEnum, user } from "@/db/schema";
import {
  normalizeSearchParams,
  RawSearchParams,
} from "@/normalize/normalizeSearchParams";
import { createSortSchema } from "@/zod-helpers/createSortSchema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { phoneNumberSchema } from "./phone";
import { AttachmentFieldValue } from "./ticket";

export const userRoleSchema = z.enum(roleEnum.enumValues);
export type UserRoleType = z.infer<typeof userRoleSchema>;

//SELECT
export const selectUserSchema = createSelectSchema(user, {
  name: (schema) => schema.min(1, "Nom invalide"),
  firstName: (schema) => schema.min(1, "Prénom invalide"),
  lastName: (schema) => schema.min(1, "Nom de famille invalide"),
  email: z.email("Email invalide"),
  image: z.url("Url de l'avatar invalide").nullable(),
});
export type SelectUserType = z.infer<typeof selectUserSchema>;

//INSERT
export const insertUserSchema = createInsertSchema(user, {
  name: (schema) => schema.min(1, "Nom obligatoire"),
  firstName: (schema) => schema.min(1, "Prénom obligatoire"),
  lastName: (schema) => schema.min(1, "Nom de famille obligatoire"),
  email: z.email("Email invalide"),
  image: z.url("Url de l'avatar invalide").nullable(),
  phone: phoneNumberSchema("Numéro de téléphone invalide"),
  role: userRoleSchema,
})
  .omit({
    id: true,
    emailVerified: true,
    updatedAt: true,
  })
  .extend({
    password: z.string().min(1, "Password is required"),
  });

export type InsertUserType = z.infer<typeof insertUserSchema>;

export const insertUserFormSchema = insertUserSchema
  .omit({ name: true, password: true })
  .extend({
    avatarAttachment: z
      .object({
        url: z.url("URL invalide"),
        filename: z.string(),
        mimeType: z.string(),
        size: z.number(),
      })
      .nullable(),
  });

export type InsertUserFormType = z.input<typeof insertUserFormSchema> & {
  avatarAttachment: AttachmentFieldValue | null;
};

//UPDATE
export const updateUserSchema = createUpdateSchema(user, {
  id: z.string().min(1, "ID utilisateur obligatoire"),
  phone: phoneNumberSchema("Numéro de téléphone invalide").nullable(),
});
export type UpdateUserType = z.infer<typeof updateUserSchema>;

export const updateUserFormSchema = updateUserSchema.extend({
  avatarAttachment: z
    .object({
      url: z.url("URL invalide"),
      filename: z.string(),
      mimeType: z.string(),
      size: z.number(),
    })
    .nullable(),
});

export type UpdateUserFormType = z.input<typeof updateUserSchema> & {
  avatarAttachment: AttachmentFieldValue | null;
};

//================== USERS QUERY PARAMS ==================//
export const SORTABLE_CLIENT_USERS_COLUMNS = {
  id: user.id,
  lastName: user.lastName,
  firstName: user.firstName,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
} as const;

export const clientUsersOrderBySchema = z.enum([
  "id",
  "lastName",
  "firstName",
  "email",
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
