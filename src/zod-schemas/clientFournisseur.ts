import { clientFournisseurs } from "@/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const createInsertClientFournisseurSchema = (messages: {
  clientId: string;
  fournisseurId: string;
}) =>
  createInsertSchema(clientFournisseurs, {
    clientId: (schema) => schema.min(1, messages.clientId), // integer mais drizzle-zod génère string → number derrière
    fournisseurId: (schema) => schema.min(1, messages.fournisseurId),
  });

export const insertClientFournisseurSchema =
  createInsertClientFournisseurSchema({
    clientId: "Client requis",
    fournisseurId: "Fournisseur requis",
  });

export type InsertClientFournisseurType = z.infer<
  typeof insertClientFournisseurSchema
>;
