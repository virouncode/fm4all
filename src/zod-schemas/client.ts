import { clients } from "@/db/schema";
import { upper } from "@/zod-helpers/normalize";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { siretSchemaEmpty } from "./siret";
import { insertSiteFormSchema, insertSiteSchema } from "./site";
import { insertUserFormSchema, insertUserSchema } from "./user";

export const selectClientSchema = createSelectSchema(clients);
export type SelectClientType = z.infer<typeof selectClientSchema>;

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertClientType = z.infer<typeof insertClientSchema>;

export const insertClientToDbSchema = insertClientSchema.extend({
  createdById: z.string().min(1, "ID de l'utilisateur créateur obligatoire"),
  updatedById: z
    .string() //c'est normal que ce soit un string ici car dans la table users id est un string
    .min(1, "ID de l'utilisateur modificateur obligatoire"),
});
export type InsertClientToDbType = z.infer<typeof insertClientToDbSchema>;

export const updateClientSchema = createUpdateSchema(clients)
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    id: z.number().positive("ID du client invalide"),
  });
export type UpdateClientType = z.infer<typeof updateClientSchema>;

export const updateClientInDbSchema = updateClientSchema
  .extend({
    updatedById: z
      .string() //c'est normal que ce soit un string ici car dans la table users id est un string
      .min(1, "ID de l'utilisateur modificateur obligatoire"),
  })
  .omit({
    id: true, //on ne met pas à jour l'id dans le parse
  });

export type UpdateClientInDbType = z.infer<typeof updateClientInDbSchema>;

export const onboardClientSchema = z.object({
  client: insertClientSchema,
  sitePrincipal: insertSiteSchema,
  userAdmin: insertUserSchema,
});

//======================= FORM SCHEMAS ==========================//
//On ne peut pas appliquer des transform de type mais on peut appliquer des transform de nettoyage

//Créer un client + un site principal + un user administrateur pour ce client

export const onboardClientFormSchema = z.object({
  client: z.object({
    nomEntreprise: z
      .string()
      .min(1, "Le nom de l'entreprise est obligatoire")
      .transform((v) => upper(v)),
    siret: siretSchemaEmpty("SIRET invalide"),
    prospectId: z.number().optional().nullable(),
  }),
  sitePrincipal: insertSiteFormSchema,
  userAdmin: insertUserFormSchema,
});

export type OnboardClientFormType = z.infer<typeof onboardClientFormSchema>;
