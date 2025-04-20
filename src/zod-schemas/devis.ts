import { devis, devisTemporaires } from "@/db/schema";
import { createInsertSchema } from "drizzle-zod";

export const createInsertDevisTemporaireSchema = (messages: {
  texte: string;
}) => {
  return createInsertSchema(devisTemporaires, {
    texte: (schema) => schema.min(1, messages.texte),
  });
};
export const insertDevisTempororaireSchema = createInsertDevisTemporaireSchema({
  texte: "Texte obligatoire",
});

export type InsertDevisTemporaireType =
  typeof insertDevisTempororaireSchema._type;

export const createInsertDevisSchema = (messages: { devisUrl: string }) => {
  return createInsertSchema(devis, {
    devisUrl: (schema) => schema.min(1, messages.devisUrl),
  });
};

export const insertDevisSchema = createInsertDevisSchema({
  devisUrl: "URL du devis obligatoire",
});

export type InsertDevisType = typeof insertDevisSchema._type;
