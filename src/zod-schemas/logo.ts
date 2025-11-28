import { logosFournisseurs } from "@/db/schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const selectLogoSchema = createSelectSchema(logosFournisseurs, {
  url: (schema) =>
    schema.regex(/^(http|https):\/\/[^ "]+$/, "Url du logo invalide"),
  type: (schema) => schema.min(1, "Type du logo obligatoire"),
});

export type SelectLogoType = z.infer<typeof selectLogoSchema>;

export const insertLogoSchema = createInsertSchema(logosFournisseurs, {
  url: (schema) =>
    schema.regex(/^(http|https):\/\/[^ "]+$/, "Url du logo invalide"),
  type: (schema) => schema.min(1, "Type du logo obligatoire"),
});

export type InsertLogoType = z.infer<typeof insertLogoSchema>;

export const updateLogoSchema = createUpdateSchema(logosFournisseurs, {
  url: (schema) =>
    schema.regex(/^(http|https):\/\/[^ "]+$/, "Url du logo invalide"),
  type: (schema) => schema.min(1, "Type du logo obligatoire"),
});

export type UpdateLogoType = z.infer<typeof updateLogoSchema>;
