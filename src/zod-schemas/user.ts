import { user } from "@/db/schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

//SELECT
export const selectUserSchema = createSelectSchema(user, {
  name: (schema) => schema.min(1, "Name is required"),
  email: (schema) => schema.email("Email is invalid"),
  image: (schema) => schema.url("Image is invalid").nullable(),
});
export type SelectUserType = typeof selectUserSchema._type;

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

export type InsertUserType = typeof insertUserSchema._type;

//UPDATE
export const updateUserSchema = createUpdateSchema(user);
export type UpdateUserType = typeof updateUserSchema._type;
