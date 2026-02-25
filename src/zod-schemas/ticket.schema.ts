import { tickets, ticketMessages } from "@/db/schema/tickets";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import {
  ticketMessageVisibiliteSchema,
  ticketPrioriteSchema,
  ticketStatutSchema,
  ticketTypeSchema,
} from "./enums";
import { capitalizeFirstWord } from "@/zod-helpers/normalize";

// ═══════════════════════════════════════════════════════════════
// TICKETS - SELECT (depuis DB)
// ═══════════════════════════════════════════════════════════════

export const selectTicketSchema = createSelectSchema(tickets);
export type SelectTicketType = z.infer<typeof selectTicketSchema>;

// ═══════════════════════════════════════════════════════════════
// ATTACHMENTS (pièces jointes)
// ═══════════════════════════════════════════════════════════════

export const attachmentSchema = z.object({
  storageKey: z.string(),
  filename: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
  previewUrl: z.string().optional(),
});
export type AttachmentFormType = z.infer<typeof attachmentSchema>;

// ═══════════════════════════════════════════════════════════════
// TICKETS - INSERT FORM (formulaire client)
// ═══════════════════════════════════════════════════════════════

export const insertTicketFormSchema = z.object({
  titre: z
    .string()
    .min(1, "Titre obligatoire")
    .max(255)
    .transform((v) => capitalizeFirstWord(v)), // Nettoyage : première lettre majuscule
  description: z.string().optional(), // Pas de transform (normalisation dans action)
  type: ticketTypeSchema,
  priorite: ticketPrioriteSchema,
  siteId: z.string().uuid("Site obligatoire"),
  proprietaireEntrepriseId: z.string().uuid("Client obligatoire").optional(), // Pour posture plateforme
  assigneEntrepriseId: z.string().uuid().or(z.literal("")).optional(), // Prestataire (optionnel) - accepte UUID ou ""
  attachments: z.array(attachmentSchema).optional(), // Pièces jointes
});
export type InsertTicketFormType = z.infer<typeof insertTicketFormSchema>;

// ═══════════════════════════════════════════════════════════════
// TICKETS - INSERT TO DB (Server Action ajoute les champs)
// ═══════════════════════════════════════════════════════════════

export const insertTicketToDbSchema = createInsertSchema(tickets)
  .extend({
    proprietaireEntrepriseId: z.string().uuid(),
    demandeurEntrepriseId: z.string().uuid().nullable(),
    statut: ticketStatutSchema.default("nouveau"),
    createdById: z.string().uuid(),
    updatedById: z.string().uuid(),
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    lastActivityAt: true,
    resolvedAt: true,
    closedAt: true,
  });
export type InsertTicketToDbType = z.infer<typeof insertTicketToDbSchema>;

// ═══════════════════════════════════════════════════════════════
// TICKETS - UPDATE FORM (formulaire client)
// ═══════════════════════════════════════════════════════════════

export const updateTicketFormSchema = insertTicketFormSchema.partial().extend({
  id: z.string().uuid(),
  statut: ticketStatutSchema.optional(),
  assigneEntrepriseId: z.string().uuid().nullable().optional(),
  assigneUserId: z.string().uuid().nullable().optional(),
});
export type UpdateTicketFormType = z.infer<typeof updateTicketFormSchema>;

// ═══════════════════════════════════════════════════════════════
// TICKETS - UPDATE TO DB (Server Action ajoute updatedById)
// ═══════════════════════════════════════════════════════════════

export const updateTicketToDbSchema = z.object({
  titre: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  type: ticketTypeSchema.optional(),
  priorite: ticketPrioriteSchema.optional(),
  siteId: z.string().uuid().optional(),
  statut: ticketStatutSchema.optional(),
  assigneEntrepriseId: z.string().uuid().nullable().optional(),
  assigneUserId: z.string().uuid().nullable().optional(),
  lastActivityAt: z.date().optional(),
  resolvedAt: z.date().nullable().optional(),
  closedAt: z.date().nullable().optional(),
  updatedById: z.string().uuid(),
});
export type UpdateTicketToDbType = z.infer<typeof updateTicketToDbSchema>;

// ═══════════════════════════════════════════════════════════════
// TICKETS - UPDATE FIELD-LEVEL SCHEMAS (permissions granulaires)
// ═══════════════════════════════════════════════════════════════

/**
 * Schema pour la mise à jour des champs de base
 * Permissions: Plateforme OU Client (demandeur/responsable site)
 */
export const updateTicketBasicFieldsSchema = z.object({
  ticketId: z.string().uuid(),
  entrepriseId: z.string().uuid(),
  titre: z.string().min(1, "Titre obligatoire").max(255).optional(),
  description: z.string().nullable().optional(),
  type: ticketTypeSchema.optional(),
  priorite: ticketPrioriteSchema.optional(),
});
export type UpdateTicketBasicFieldsType = z.infer<
  typeof updateTicketBasicFieldsSchema
>;

/**
 * Schema pour la mise à jour du prestataire assigné
 * Permissions: Plateforme OU Client (demandeur/responsable site)
 * Note: "" sera converti en null par normalizeForSubmit côté serveur
 */
export const updateTicketAssigneEntrepriseSchema = z.object({
  ticketId: z.string().uuid(),
  entrepriseId: z.string().uuid(),
  assigneEntrepriseId: z.string(), // Accepte "" ou UUID, normalisé côté serveur
});
export type UpdateTicketAssigneEntrepriseType = z.infer<
  typeof updateTicketAssigneEntrepriseSchema
>;

/**
 * Schema pour la mise à jour de l'utilisateur assigné
 * Permissions: UNIQUEMENT Prestataire (si ticket assigné à son entreprise)
 * Note: "" sera converti en null par normalizeForSubmit côté serveur
 */
export const updateTicketAssigneUserSchema = z.object({
  ticketId: z.string().uuid(),
  entrepriseId: z.string().uuid(),
  assigneUserId: z.string(), // Accepte "" ou UUID, normalisé côté serveur
});
export type UpdateTicketAssigneUserType = z.infer<
  typeof updateTicketAssigneUserSchema
>;

/**
 * Schema pour la mise à jour du statut
 * Permissions: Variables selon posture (voir getAvailableStatutsForUser)
 */
export const updateTicketStatutSchema = z.object({
  ticketId: z.string().uuid(),
  entrepriseId: z.string().uuid(),
  statut: ticketStatutSchema,
});
export type UpdateTicketStatutType = z.infer<typeof updateTicketStatutSchema>;

/**
 * Schema pour la mise à jour des pièces jointes
 * Permissions: canEditBasicFields
 */
export const updateTicketAttachmentsSchema = z.object({
  ticketId: z.string().uuid(),
  entrepriseId: z.string().uuid(),
  attachments: z.array(attachmentSchema),
});
export type UpdateTicketAttachmentsType = z.infer<
  typeof updateTicketAttachmentsSchema
>;

// ═══════════════════════════════════════════════════════════════
// TICKET MESSAGES - SELECT (depuis DB)
// ═══════════════════════════════════════════════════════════════

export const selectTicketMessageSchema = createSelectSchema(ticketMessages);
export type SelectTicketMessageType = z.infer<typeof selectTicketMessageSchema>;

// ═══════════════════════════════════════════════════════════════
// TICKET MESSAGES - INSERT FORM (formulaire client)
// ═══════════════════════════════════════════════════════════════

export const insertTicketMessageFormSchema = z.object({
  message: z.string().min(1, "Message obligatoire"),
  visibilite: ticketMessageVisibiliteSchema,
  attachments: z.array(attachmentSchema).optional(), // Pièces jointes du message
});
export type InsertTicketMessageFormType = z.infer<
  typeof insertTicketMessageFormSchema
>;

// ═══════════════════════════════════════════════════════════════
// TICKET MESSAGES - INSERT TO DB (Server Action ajoute les champs)
// ═══════════════════════════════════════════════════════════════

export const insertTicketMessageToDbSchema = createInsertSchema(ticketMessages)
  .extend({
    ticketId: z.string().uuid(),
    auteurUserId: z.string().uuid(),
  })
  .omit({
    id: true,
    createdAt: true,
  });
export type InsertTicketMessageToDbType = z.infer<
  typeof insertTicketMessageToDbSchema
>;

/**
 * Schema pour l'action serveur d'insertion d'un message avec PJ
 */
export const insertTicketMessageActionSchema = z.object({
  ticketId: z.string().uuid(),
  entrepriseId: z.string().uuid(),
  message: z.string().min(1, "Message obligatoire"),
  visibilite: ticketMessageVisibiliteSchema,
  attachments: z.array(attachmentSchema).optional(),
});
export type InsertTicketMessageActionType = z.infer<
  typeof insertTicketMessageActionSchema
>;

// ═══════════════════════════════════════════════════════════════
// QUERY SCHEMAS (filtres + pagination)
// ═══════════════════════════════════════════════════════════════

export const ticketsQuerySchema = z.object({
  entrepriseId: z.string().uuid(),

  // Filtres
  search: z.string().optional(),
  statut: ticketStatutSchema.optional(),
  priorite: ticketPrioriteSchema.optional(),
  type: ticketTypeSchema.optional(),
  siteId: z.string().uuid().optional(),
  assigneUserId: z.string().uuid().optional(),
  proprietaireEntrepriseId: z.string().uuid().optional(),
  demandeurEntrepriseId: z.string().uuid().optional(),
  assigneEntrepriseId: z.string().uuid().optional(),

  // Tri
  orderBy: z
    .enum([
      "createdAt",
      "lastActivityAt",
      "priorite",
      "statut",
      "titre",
      "type",
      "siteNom",
      "proprietaireEntrepriseNom",
      "demandeurEntrepriseNom",
      "assigneEntrepriseNom",
    ])
    .default("lastActivityAt"),
  orderDir: z.enum(["asc", "desc"]).default("desc"),

  // Pagination
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(50),
});
export type TicketsQueryType = z.infer<typeof ticketsQuerySchema>;

// ═══════════════════════════════════════════════════════════════
// CHANGE STATUS SCHEMA
// ═══════════════════════════════════════════════════════════════

export const changeTicketStatusSchema = z.object({
  ticketId: z.string().uuid(),
  entrepriseId: z.string().uuid(),
  newStatut: ticketStatutSchema,
});
export type ChangeTicketStatusType = z.infer<typeof changeTicketStatusSchema>;

// ═══════════════════════════════════════════════════════════════
// ASSIGN TICKET SCHEMA
// ═══════════════════════════════════════════════════════════════

export const assignTicketSchema = z.object({
  ticketId: z.string().uuid(),
  entrepriseId: z.string().uuid(),
  assigneEntrepriseId: z.string().uuid().nullable().optional(),
  assigneUserId: z.string().uuid().nullable().optional(),
});
export type AssignTicketType = z.infer<typeof assignTicketSchema>;
