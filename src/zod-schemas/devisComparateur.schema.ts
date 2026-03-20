import { devisTemporaires } from "@/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { insertProspectSchema } from "./prospect.schema";

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

export const saveProgressSchema = z.object({
  prospect: insertProspectSchema,
  texte: insertDevisTemporaireSchema.shape.texte,
});
export type SaveProgressType = z.infer<typeof saveProgressSchema>;
