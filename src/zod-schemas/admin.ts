import { user } from "@/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const insertAdminSchema = createInsertSchema(user, {
  email: (schema) => schema.email("Email invalide"),
})
  .omit({
    id: true,
    name: true,
    emailVerified: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    prenom: z.string().min(1, "Prenom obligatoire"),
    nom: z.string().min(1, "Nom obligatoire"),
    password: z.string().min(1, "Mot de passe obligatoire"),
    passwordConfirmation: z.string().min(1, "Confirmation obligatoire"),
  });

export type InsertAdminType = typeof insertAdminSchema._type;
