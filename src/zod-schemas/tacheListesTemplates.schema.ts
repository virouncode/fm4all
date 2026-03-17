import { capitalizeFirstWord } from "@/zod-helpers/normalize";
import { z } from "zod";

// ==================== QUERY / READ ====================

export const getAvailableTacheListesTemplatesSchema = z.object({
  serviceId: z.uuid("ID de service invalide"),
  entrepriseId: z.uuid("ID d'entreprise invalide"),
  executionId: z.uuid().optional(),
  /** Fourni directement quand pas d'executionId (ex: création d'exécution) */
  prestataireEntrepriseId: z.uuid().optional(),
});
export type GetAvailableTacheListesTemplatesType = z.infer<
  typeof getAvailableTacheListesTemplatesSchema
>;

export const getTacheListesTemplatesSchema = z.object({
  proprietaireEntrepriseId: z.uuid("ID d'entreprise invalide").nullable(),
  serviceId: z.uuid().optional(),
});
export type GetTacheListesTemplatesType = z.infer<
  typeof getTacheListesTemplatesSchema
>;

export const getTacheListeTemplateSchema = z.object({
  id: z.uuid("ID de pack invalide"),
});
export type GetTacheListeTemplateType = z.infer<
  typeof getTacheListeTemplateSchema
>;

export const getChecklistsForPageSchema = z.object({
  /** Posture de l'utilisateur */
  posture: z.enum(["client", "prestataire", "plateforme"]),
  /** entrepriseId de l'utilisateur (client ou prestataire) — obligatoire sauf plateforme */
  entrepriseId: z.uuid().optional(),
  /** Filtre optionnel par service */
  serviceId: z.uuid().optional(),
  /** Filtre plateforme : null = système, uuid = entreprise spécifique */
  proprietaireFilter: z.uuid().nullable().optional(),
});
export type GetChecklistsForPageType = z.infer<
  typeof getChecklistsForPageSchema
>;

// ==================== TEMPLATE CRUD ====================

export const insertTacheListeTemplateSchema = z.object({
  nom: z
    .string()
    .min(1, "Nom obligatoire")
    .max(255, "Nom trop long")
    .transform(capitalizeFirstWord),
  serviceId: z.uuid("ID de service invalide"),
  proprietaireEntrepriseId: z.uuid("ID d'entreprise invalide").nullable(),
});
export type InsertTacheListeTemplateType = z.infer<
  typeof insertTacheListeTemplateSchema
>;

export const updateTacheListeTemplateSchema = z.object({
  id: z.uuid("ID de pack invalide"),
  entrepriseId: z.uuid("ID d'entreprise invalide").nullable(),
  nom: z.string().min(1).max(255).transform(capitalizeFirstWord).optional(),
  actif: z.boolean().optional(),
});
export type UpdateTacheListeTemplateType = z.infer<
  typeof updateTacheListeTemplateSchema
>;

export const deleteTacheListeTemplateSchema = z.object({
  id: z.uuid("ID de pack invalide"),
  entrepriseId: z.uuid("ID d'entreprise invalide").nullable(),
});
export type DeleteTacheListeTemplateType = z.infer<
  typeof deleteTacheListeTemplateSchema
>;

// ==================== ITEM CRUD ====================

export const insertTacheListeItemSchema = z.object({
  listeTemplateId: z.uuid("ID de pack invalide"),
  entrepriseId: z.uuid("ID d'entreprise invalide").nullable(),
  titre: z
    .string()
    .min(1, "Titre obligatoire")
    .max(255, "Titre trop long")
    .transform(capitalizeFirstWord),
  description: z.string().optional(),
  dureeEstimeeMinutes: z.number().int().positive().optional(),
  emoji: z.string().max(10).optional(),
});
export type InsertTacheListeItemType = z.infer<
  typeof insertTacheListeItemSchema
>;

export const updateTacheListeItemSchema = z.object({
  id: z.uuid("ID d'item invalide"),
  entrepriseId: z.uuid("ID d'entreprise invalide").nullable(),
  titre: z
    .string()
    .min(1)
    .max(255)
    .transform(capitalizeFirstWord)
    .optional(),
  description: z.string().optional(),
  ordre: z.number().int().positive().optional(),
  actif: z.boolean().optional(),
  dureeEstimeeMinutes: z.number().int().positive().nullable().optional(),
  emoji: z.string().max(10).nullable().optional(),
});
export type UpdateTacheListeItemType = z.infer<
  typeof updateTacheListeItemSchema
>;

export const deleteTacheListeItemSchema = z.object({
  id: z.uuid("ID d'item invalide"),
  entrepriseId: z.uuid("ID d'entreprise invalide").nullable(),
});
export type DeleteTacheListeItemType = z.infer<
  typeof deleteTacheListeItemSchema
>;

export const reorderTacheListeItemsSchema = z.object({
  listeTemplateId: z.uuid("ID de pack invalide"),
  entrepriseId: z.uuid("ID d'entreprise invalide").nullable(),
  /** Tableau des IDs dans le nouvel ordre (du premier au dernier) */
  orderedIds: z.array(z.uuid()).min(1),
});
export type ReorderTacheListeItemsType = z.infer<
  typeof reorderTacheListeItemsSchema
>;
