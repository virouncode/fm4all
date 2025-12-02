import { clients, typeBatimentEnum, typeOccupationEnum } from "@/db/schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const typeBatimentSchema = z.enum(typeBatimentEnum.enumValues);
export type TypeBatimentType = z.infer<typeof typeBatimentSchema>;

export const typeOccupationSchema = z.enum(typeOccupationEnum.enumValues);
export type TypeOccupationType = z.infer<typeof typeOccupationSchema>;

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

export const updateClientInDbSchema = updateClientSchema.extend({
  updatedById: z
    .string() //c'est normal que ce soit un string ici car dans la table users id est un string
    .min(1, "ID de l'utilisateur modificateur obligatoire"),
});

export type UpdateClientInDbType = z.infer<typeof updateClientInDbSchema>;

//======================= FORM SCHEMAS ==========================//
//On ne peut pas appliquer des transform de type mais on peut appliquer des transform de nettoyage

//TODO changer les tables clients => simplifer
