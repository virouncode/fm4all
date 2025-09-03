import { logosFournisseurs } from "@/db/schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

export const selectLogoSchema = createSelectSchema(logosFournisseurs, {
  url: (schema) =>
    schema.regex(/^(http|https):\/\/[^ "]+$/, "Url du logo invalide"),
  type: (schema) => schema.min(1, "Type du logo obligatoire"),
});

export type SelectLogoType = typeof selectLogoSchema._type;

export const insertLogoSchema = createInsertSchema(logosFournisseurs, {
  url: (schema) =>
    schema.regex(/^(http|https):\/\/[^ "]+$/, "Url du logo invalide"),
  type: (schema) => schema.min(1, "Type du logo obligatoire"),
});

export type InsertLogoType = typeof insertLogoSchema._type;

export const updateLogoSchema = createUpdateSchema(logosFournisseurs, {
  url: (schema) =>
    schema.regex(/^(http|https):\/\/[^ "]+$/, "Url du logo invalide"),
  type: (schema) => schema.min(1, "Type du logo obligatoire"),
});

export type UpdateLogoType = typeof updateLogoSchema._type;
