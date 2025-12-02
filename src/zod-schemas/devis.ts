import { devis, devisTemporaires } from "@/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { insertProspectSchema } from "./prospect";

export const selectDevisTemporaireSchema = createSelectSchema(devisTemporaires);
export type SelectDevisTemporaireType = z.infer<
  typeof selectDevisTemporaireSchema
>;

export const createInsertDevisTemporaireSchema = (messages: {
  texte: string;
}) => {
  return createInsertSchema(devisTemporaires, {
    texte: (schema) => schema.min(1, messages.texte),
  });
};
export const insertDevisTemporaireSchema = createInsertDevisTemporaireSchema({
  texte: "Texte obligatoire",
});

export type InsertDevisTemporaireType = z.infer<
  typeof insertDevisTemporaireSchema
>;

export const createInsertDevisSchema = (messages: { devisUrl: string }) => {
  return createInsertSchema(devis, {
    devisUrl: (schema) => schema.min(1, messages.devisUrl),
  });
};

export const insertDevisSchema = createInsertDevisSchema({
  devisUrl: "URL du devis obligatoire",
});

export type InsertDevisType = z.infer<typeof insertDevisSchema>;

export const saveProgressSchema = z.object({
  prospect: insertProspectSchema,
  texte: insertDevisTemporaireSchema.shape.texte,
});
export type SaveProgressType = z.infer<typeof saveProgressSchema>;
