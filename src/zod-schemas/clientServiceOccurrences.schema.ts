import {
  occurrenceStatutSchema,
  occurrenceTacheStatutSchema,
  occurrenceTransitionStatutSchema,
} from "@/zod-schemas/enums";
import { z } from "zod";

// ==================== OCCURRENCE STATUT ====================

export const updateOccurrenceStatutSchema = z.object({
  occurrenceId: z.uuid("ID de l'occurrence invalide"),
  prestationId: z.uuid("ID de la prestation invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
  statut: occurrenceTransitionStatutSchema,
});
export type UpdateOccurrenceStatutType = z.infer<
  typeof updateOccurrenceStatutSchema
>;

// ==================== GET OCCURRENCES PAGE ====================

export const getOccurrencesPageSchema = z.object({
  prestationId: z.uuid(),
  entrepriseId: z.uuid(),
  offset: z.number().int().min(0),
  limit: z.number().int().min(1).max(100).default(50),
  statut: occurrenceStatutSchema.optional(),
  nonAssignedOnly: z.boolean().optional(),
  siteId: z.uuid().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
});
export type GetOccurrencesPageType = z.infer<typeof getOccurrencesPageSchema>;

// ==================== GET OCCURRENCE TACHES ====================

export const getOccurrenceTachesSchema = z.object({
  occurrenceId: z.uuid("ID de l'occurrence invalide"),
  prestationId: z.uuid("ID de la prestation invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
});
export type GetOccurrenceTachesType = z.infer<typeof getOccurrenceTachesSchema>;

// ==================== UPDATE OCCURRENCE DATES ====================

export const updateOccurrenceDatesSchema = z.object({
  occurrenceId: z.uuid("ID de l'occurrence invalide"),
  prestationId: z.uuid("ID de la prestation invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
  dateDebutPrevue: z.string().nullable(),
  dateFinPrevue: z.string().nullable(),
});
export type UpdateOccurrenceDatesType = z.infer<
  typeof updateOccurrenceDatesSchema
>;

// ==================== UPDATE TACHE STATUT ====================

// Sous-ensemble valide pour les transitions de tâche (a_faire n'est pas une cible)
export const occurrenceTacheTransitionStatutSchema =
  occurrenceTacheStatutSchema.exclude(["a_faire"]);
export type OccurrenceTacheTransitionStatutType = z.infer<
  typeof occurrenceTacheTransitionStatutSchema
>;

export const updateOccurrenceTacheStatutSchema = z.object({
  tacheId: z.uuid("ID de la tâche invalide"),
  occurrenceId: z.uuid("ID de l'occurrence invalide"),
  prestationId: z.uuid("ID de la prestation invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
  statut: occurrenceTacheTransitionStatutSchema,
});
export type UpdateOccurrenceTacheStatutType = z.infer<
  typeof updateOccurrenceTacheStatutSchema
>;

// ==================== TACHE PIECE JOINTE ====================

export const addTachePieceJointeSchema = z.object({
  tacheId: z.uuid("ID de la tâche invalide"),
  occurrenceId: z.uuid("ID de l'occurrence invalide"),
  prestationId: z.uuid("ID de la prestation invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
  storageKey: z.string().min(1, "Clé S3 requise"),
  filename: z.string().min(1, "Nom de fichier requis"),
  mimeType: z.string().min(1, "Type MIME requis"),
  sizeBytes: z.number().int().positive("Taille invalide"),
});
export type AddTachePieceJointeType = z.infer<typeof addTachePieceJointeSchema>;

export const deleteTachePieceJointeSchema = z.object({
  linkId: z.uuid("ID du lien invalide"),
  documentId: z.uuid("ID du document invalide"),
  tacheId: z.uuid("ID de la tâche invalide"),
  occurrenceId: z.uuid("ID de l'occurrence invalide"),
  prestationId: z.uuid("ID de la prestation invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
});
export type DeleteTachePieceJointeType = z.infer<
  typeof deleteTachePieceJointeSchema
>;

// ==================== INSERT TACHE AD-HOC ====================

export const insertAdHocTacheSchema = z.object({
  occurrenceId: z.uuid("ID de l'occurrence invalide"),
  prestationId: z.uuid("ID de la prestation invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
  titre: z.string().min(1, "Le titre est obligatoire").max(255),
  description: z.string().max(1000).optional(),
});
export type InsertAdHocTacheType = z.infer<typeof insertAdHocTacheSchema>;

// ==================== UPDATE TACHE AD-HOC ====================

export const updateAdHocTacheSchema = z.object({
  tacheId: z.uuid("ID de la tâche invalide"),
  occurrenceId: z.uuid("ID de l'occurrence invalide"),
  prestationId: z.uuid("ID de la prestation invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
  titre: z.string().min(1, "Le titre est obligatoire").max(255),
  description: z.string().max(1000).optional(),
});
export type UpdateAdHocTacheType = z.infer<typeof updateAdHocTacheSchema>;

// ==================== DELETE TACHE AD-HOC ====================

export const deleteAdHocTacheSchema = z.object({
  tacheId: z.uuid("ID de la tâche invalide"),
  occurrenceId: z.uuid("ID de l'occurrence invalide"),
  prestationId: z.uuid("ID de la prestation invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
});
export type DeleteAdHocTacheType = z.infer<typeof deleteAdHocTacheSchema>;

// ==================== UPDATE TACHE ASSIGNEE ====================

export const updateTacheAssigneeSchema = z.object({
  tacheId: z.uuid("ID de la tâche invalide"),
  occurrenceId: z.uuid("ID de l'occurrence invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
  assigneeUserId: z.uuid().nullable(),
});
export type UpdateTacheAssigneeType = z.infer<typeof updateTacheAssigneeSchema>;

// ==================== GET ASSIGNABLE USERS ====================

export const getAssignableUsersForOccurrenceSchema = z.object({
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
});
export type GetAssignableUsersForOccurrenceType = z.infer<
  typeof getAssignableUsersForOccurrenceSchema
>;

// ==================== TICKET ↔ OCCURRENCE LINK ====================

export const ticketOccurrenceLinkSchema = z.object({
  ticketId: z.uuid("ID du ticket invalide"),
  occurrenceId: z.uuid("ID de l'occurrence invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
});
export type TicketOccurrenceLinkType = z.infer<typeof ticketOccurrenceLinkSchema>;

export const occurrenceTicketsSchema = z.object({
  occurrenceId: z.uuid("ID de l'occurrence invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
});
export type OccurrenceTicketsType = z.infer<typeof occurrenceTicketsSchema>;

// ==================== UPDATE OCCURRENCE ASSIGNEE ====================

export const updateOccurrenceAssigneeSchema = z.object({
  occurrenceId: z.uuid("ID de l'occurrence invalide"),
  prestationId: z.uuid("ID de la prestation invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
  assigneeUserId: z.uuid().nullable(),
  applyToTaches: z.boolean().optional(),
});
export type UpdateOccurrenceAssigneeType = z.infer<
  typeof updateOccurrenceAssigneeSchema
>;

// ==================== INSERT OCCURRENCE ON-DEMAND ====================

export const insertOccurrenceOnDemandFormSchema = z.object({
  prestationId: z.uuid("ID de la prestation invalide"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
  dateDebutPrevue: z.string().min(1, "Date de début obligatoire"),
  dateFinPrevue: z.string().optional(),
  notes: z.string().max(2000).optional(),
});
export type InsertOccurrenceOnDemandFormType = z.infer<
  typeof insertOccurrenceOnDemandFormSchema
>;
