import { capitalizeWords } from "@/zod-helpers/normalize";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { services } from "../db/schema/services";

export const serviceSelectSchema = createSelectSchema(services);
export type ServiceSelectType = z.infer<typeof serviceSelectSchema>;

// ==================== INSERT SCHEMAS ====================

export const insertServiceFormSchema = z.object({
  nom: z
    .string()
    .min(1, "Nom du service obligatoire")
    .transform(capitalizeWords),
  description: z.string().optional(),
});
export type InsertServiceFormType = z.infer<typeof insertServiceFormSchema>;

// ==================== UPDATE SCHEMAS ====================

export const updateServiceFormSchema = z.object({
  id: z.string().uuid(),
  nom: z
    .string()
    .min(1, "Nom du service obligatoire")
    .transform(capitalizeWords),
  description: z.string().optional(),
});
export type UpdateServiceFormType = z.infer<typeof updateServiceFormSchema>;

// ==================== STATS TYPE ====================

export type ServiceWithStatsType = {
  id: string;
  nom: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  nbClients: number;
  nbPrestataires: number;
};
