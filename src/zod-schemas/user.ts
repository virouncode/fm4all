import { roleEnum, user } from "@/db/schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const userRoleSchema = z.enum(roleEnum.enumValues);
export type UserRoleType = z.infer<typeof userRoleSchema>;

//SELECT
export const selectUserSchema = createSelectSchema(user, {
  name: (schema) => schema.min(1, "Name is required"),
  email: (schema) => schema.email("Email is invalid"),
  image: (schema) => schema.url("Image is invalid").nullable(),
});
export type SelectUserType = z.infer<typeof selectUserSchema>;

//INSERT
export const insertUserSchema = createInsertSchema(user, {
  name: (schema) => schema.min(1, "Name is required"),
  email: (schema) => schema.email("Email is invalid"),
  image: (schema) => schema.url("Image is invalid").nullable(),
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

//UPDATE
export const updateUserSchema = createUpdateSchema(user);
export type UpdateUserType = z.infer<typeof updateUserSchema>;
