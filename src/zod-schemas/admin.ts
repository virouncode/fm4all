import { user } from "@/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const createInsertAdminSchema = (messages: {
  email: string;
  prenom: string;
  nom: string;
  password: string;
  passwordConfirmation: string;
}) => {
  return createInsertSchema(user, {
    email: (schema) => schema.email(messages.email),
  })
    .omit({
      id: true,
      name: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    })
    .extend({
      prenom: z.string().min(1, messages.prenom),
      nom: z.string().min(1, messages.nom),
      password: z.string().min(1, messages.password),
      passwordConfirmation: z.string().min(1, messages.passwordConfirmation),
    });
};

export const insertAdminSchema = createInsertAdminSchema({
  email: "Email invalide",
  prenom: "Prénom obligatoire",
  nom: "Nom obligatoire",
  password: "Mot de passe obligatoire",
  passwordConfirmation: "Confirmation du mot de passe obligatoire",
});

export type InsertAdminType = typeof insertAdminSchema._type;
