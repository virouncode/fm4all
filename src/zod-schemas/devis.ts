import { devis } from "@/db/schema";
import { createInsertSchema } from "drizzle-zod";

export const insertDevisSchema = createInsertSchema(devis, {
  texte: (schema) => schema.min(1, "Texte du devis obligatoire"),
});

export type InsertDevisType = typeof insertDevisSchema._type;
