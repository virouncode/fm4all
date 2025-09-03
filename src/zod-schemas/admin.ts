import { z } from "zod";

//SELECT
//cf selectUserSchema

//INSERT
export const createInsertAdminSchema = (messages: {
  email: string;
  prenom: string;
  nom: string;
  image: string;
}) => {
  return z.object({
    prenom: z.string().min(1, messages.prenom),
    nom: z.string().min(1, messages.nom),
    email: z.string().email(messages.email),
    image: z.string().url(messages.image).nullable(),
  });
};

export const insertAdminSchema = createInsertAdminSchema({
  email: "Email invalide",
  prenom: "Prénom obligatoire",
  nom: "Nom obligatoire",
  image: "Image invalide",
});

export type InsertAdminType = z.infer<typeof insertAdminSchema>;

//UPDATE
export const createUpdateAdminSchema = (messages: {
  id: string;
  prenom: string;
  nom: string;
  image: string;
}) => {
  return z.object({
    id: z.string().min(1, messages.id),
    prenom: z.string().min(1, messages.prenom).optional(),
    nom: z.string().min(1, messages.nom).optional(),
    image: z.string().url(messages.image).nullable().optional(),
  });
};
export const updateAdminSchema = createUpdateAdminSchema({
  id: "ID de l'administrateur invalide",
  prenom: "Prénom obligatoire",
  nom: "Nom obligatoire",
  image: "Image invalide",
});

export type UpdateAdminType = z.infer<typeof updateAdminSchema>;
