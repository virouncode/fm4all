"use server";

import { db } from "@/db";
import { getSession } from "@/lib/auth-session";
import { getAllTickets, getTickets } from "@/lib/queries/tickets/getTickets";
import { actionClient } from "@/lib/safe-actions";
import { promoteTempTicketAttachment } from "@/lib/utils/file-helper";
import {
  adminTicketsQueryBackendSchema,
  insertTicketAttachmentToDbSchema,
  insertTicketInputSchema,
  insertTicketToDbSchema,
  selectTicketSchema,
  ticketsQueryBackendSchema,
  updateTicketInDbSchema,
  updateTicketInputSchema,
} from "@/zod-schemas/ticket";
import { del } from "@vercel/blob";
import { and, eq, inArray } from "drizzle-orm";
import { getLocale } from "next-intl/server";
import { flattenValidationErrors } from "next-safe-action";
import { z } from "zod";
import { tickets, ticketsAttachments } from "../db/schema";

export const getTicketsAction = actionClient
  .metadata({ actionName: "getTicketsAction" })
  .inputSchema(ticketsQueryBackendSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    const locale = await getLocale();

    if (!currentUser) {
      throw new Error(
        locale === "fr"
          ? "Vous n'êtes pas authentifié."
          : "You are not authenticated.",
      );
    }

    if (!currentUser.clientId) {
      throw new Error(
        locale === "fr"
          ? "Utilisateur non rattaché à une entreprise cliente"
          : "User not associated with a client company",
      );
    }

    const clientId = currentUser.clientId;

    // parsedInput EST déjà un TicketsQueryBackendType
    const tickets = await getTickets({
      clientId,
      query: parsedInput,
    });

    return tickets;
  });

export const insertTicketAction = actionClient
  .metadata({ actionName: "insertTicketAction" })
  .inputSchema(insertTicketInputSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    const locale = await getLocale();

    if (!currentUser) {
      throw new Error(
        locale === "fr"
          ? "Vous n'êtes pas authentifié."
          : "You are not authenticated.",
      );
    }

    const clientId = currentUser.clientId;
    if (!clientId) {
      throw new Error(
        locale === "fr"
          ? "Utilisateur non rattaché à une entreprise cliente."
          : "User not associated with a client company.",
      );
    }

    const createdById = currentUser.id;
    const updatedById = currentUser.id;
    const uploadedById = currentUser.id;

    const {
      attachments = [],
      dateCloture,
      // le reste des champs du ticket
      ...ticketData
    } = parsedInput;

    let dateClotureValue: Date | null = null;
    if (ticketData.status === "clos") {
      dateClotureValue = new Date();
    }
    const payload = insertTicketToDbSchema.parse({
      ...ticketData,
      clientId,
      dateCloture: dateClotureValue,
      createdById,
      updatedById,
    });

    const result = await db.transaction(async (tx) => {
      // 1) Insert du ticket
      const [insertedTicket] = await tx
        .insert(tickets)
        .values(payload)
        .returning();

      if (!insertedTicket) {
        throw new Error(
          locale === "fr"
            ? "Échec de la création du ticket."
            : "Failed to create ticket.",
        );
      }

      const ticketId = insertedTicket.id;

      // 2) Promotion des attachments (temp -> définitif)
      const promotedAttachments =
        attachments.length > 0
          ? await Promise.all(
              attachments.map((att) =>
                promoteTempTicketAttachment(att, {
                  clientId,
                  ticketId,
                  tableName: "tickets",
                }),
              ),
            )
          : [];

      // 3) Insert des attachments en base avec les URL finales
      if (promotedAttachments.length > 0) {
        await tx.insert(ticketsAttachments).values(
          promotedAttachments.map((att) =>
            insertTicketAttachmentToDbSchema.parse({
              ticketId,
              uploadedById,
              url: att.url,
              filename: att.filename,
              mimeType: att.mimeType,
              size: att.size, // si ta colonne existe bien côté DB
            }),
          ),
        );
      }

      // 4) Relire les attachments si tu veux renvoyer un snapshot
      const insertedAttachments =
        promotedAttachments.length > 0
          ? await tx
              .select()
              .from(ticketsAttachments)
              .where(eq(ticketsAttachments.ticketId, ticketId))
          : [];

      const safeTicket = selectTicketSchema.parse(insertedTicket);

      return {
        ticket: safeTicket,
        attachments: insertedAttachments,
      };
    });
    return {
      message: locale === "fr" ? "Ticket ajouté" : "Ticket added",
      ticket: result.ticket,
      attachments: result.attachments,
    };
  });

// ======================= ADMIN: getAllDevisTicketsAction ==========================//
import { getAllDevisTickets } from "@/lib/queries/tickets/getTickets";

export const getAllDevisTicketsAction = actionClient
  .metadata({ actionName: "getAllDevisTicketsAction" })
  .inputSchema(adminTicketsQueryBackendSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    const locale = await getLocale();

    if (!currentUser) {
      throw new Error(
        locale === "fr"
          ? "Vous n'êtes pas authentifié."
          : "You are not authenticated.",
      );
    }

    if (currentUser.role !== "admin") {
      throw new Error(
        locale === "fr"
          ? "Vous n'avez pas les droits pour effectuer cette action."
          : "You do not have permission to perform this action.",
      );
    }

    const tickets = await getAllDevisTickets({
      query: parsedInput,
    });

    return tickets;
  });

// Schema pour l'action admin pour mettre à jour un ticket
const updateTicketForAdminInputSchema = updateTicketInputSchema.extend({
  clientId: z.number().int().positive("ID du client invalide"),
});

// Action pour mettre à jour un ticket (admin uniquement - peut tout modifier sauf clientId et dateCloture)
export const updateTicketForAdminAction = actionClient
  .metadata({ actionName: "updateTicketForAdminAction" })
  .inputSchema(updateTicketForAdminInputSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    const locale = await getLocale();

    if (!currentUser) {
      throw new Error(
        locale === "fr"
          ? "Vous n'êtes pas authentifié."
          : "You are not authenticated.",
      );
    }

    if (currentUser.role !== "admin") {
      throw new Error(
        locale === "fr"
          ? "Vous n'avez pas les droits pour effectuer cette action."
          : "You do not have permission to perform this action.",
      );
    }

    const updatedById = currentUser.id;
    const uploadedById = currentUser.id;

    const {
      id: ticketIdFromInput,
      attachments = [],
      dateCloture,
      clientId,
      ...ticketData
    } = parsedInput;

    if (!ticketIdFromInput) {
      throw new Error(
        locale === "fr"
          ? "ID du ticket obligatoire pour la mise à jour."
          : "Ticket ID is required for update.",
      );
    }

    // Vérifier que le ticket existe
    const [existingTicket] = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, ticketIdFromInput))
      .limit(1);

    if (!existingTicket) {
      throw new Error(
        locale === "fr" ? "Ticket introuvable." : "Ticket not found.",
      );
    }

    // Vérifier que le clientId correspond (sécurité - on ne peut pas changer de client)
    if (existingTicket.clientId !== clientId) {
      throw new Error(
        locale === "fr"
          ? "Le client du ticket ne peut pas être modifié."
          : "The client of the ticket cannot be changed.",
      );
    }

    let dateClotureValue: Date | null = existingTicket.dateCloture;
    if (ticketData.status === "clos" && !existingTicket.dateCloture) {
      dateClotureValue = new Date();
    } else if (ticketData.status !== "clos") {
      dateClotureValue = null;
    }

    const payload = updateTicketInDbSchema.parse({
      ...ticketData,
      id: ticketIdFromInput,
      dateCloture: dateClotureValue,
      updatedById,
    });

    const result = await db.transaction(async (tx) => {
      // 1) Mise à jour du ticket
      const [updatedTicket] = await tx
        .update(tickets)
        .set(payload)
        .where(eq(tickets.id, ticketIdFromInput))
        .returning();

      if (!updatedTicket) {
        throw new Error(
          locale === "fr"
            ? "Échec de la mise à jour du ticket."
            : "Failed to update ticket.",
        );
      }

      const ticketId = updatedTicket.id;

      // 2) Récupérer les attachments existants en base
      const existingAttachments = await tx
        .select()
        .from(ticketsAttachments)
        .where(eq(ticketsAttachments.ticketId, ticketId));

      // Helper pour comparer "logiquement" deux attachments
      const attachmentKey = (att: {
        url: string;
        filename: string;
        mimeType: string;
        size: number;
      }) => `${att.url}__${att.filename}__${att.mimeType}__${att.size}`;

      const existingByKey = new Map(
        existingAttachments.map((att) => [attachmentKey(att), att]),
      );

      const incomingByKey = new Map(
        attachments.map((att) => [attachmentKey(att), att]),
      );

      // 3) Déterminer ceux à supprimer (présents en DB mais plus dans le payload)
      const toDelete = existingAttachments.filter(
        (att) => !incomingByKey.has(attachmentKey(att)),
      );

      if (toDelete.length > 0) {
        for (const att of toDelete) {
          try {
            if (att.url) {
              await promoteSafeDelete(att.url);
            }
          } catch {
            // ignore
          }
        }

        await tx.delete(ticketsAttachments).where(
          inArray(
            ticketsAttachments.id,
            toDelete.map((a) => a.id),
          ),
        );
      }

      // 4) Déterminer ceux à ajouter (payload mais pas en DB)
      const toInsertRaw = attachments.filter(
        (att) => !existingByKey.has(attachmentKey(att)),
      );

      if (toInsertRaw.length > 0) {
        const promotedAttachments = await Promise.all(
          toInsertRaw.map((att) =>
            promoteTempTicketAttachment(att, {
              clientId,
              ticketId,
              tableName: "tickets",
            }),
          ),
        );

        await tx.insert(ticketsAttachments).values(
          promotedAttachments.map((att) =>
            insertTicketAttachmentToDbSchema.parse({
              ticketId,
              uploadedById,
              url: att.url,
              filename: att.filename,
              mimeType: att.mimeType,
              size: att.size,
            }),
          ),
        );
      }

      // 5) Récupérer l'état final des pièces jointes
      const updatedAttachments = await tx
        .select()
        .from(ticketsAttachments)
        .where(eq(ticketsAttachments.ticketId, ticketId));

      const safeTicket = selectTicketSchema.parse(updatedTicket);

      return {
        ticket: safeTicket,
        attachments: updatedAttachments,
      };
    });

    return {
      message: locale === "fr" ? "Ticket mis à jour" : "Ticket updated",
      ticket: result.ticket,
      attachments: result.attachments,
    };
  });

// ======================= ADMIN: getAllTicketsAction ==========================//

export const getAllTicketsAction = actionClient
  .metadata({ actionName: "getAllTicketsAction" })
  .inputSchema(adminTicketsQueryBackendSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    const locale = await getLocale();

    if (!currentUser) {
      throw new Error(
        locale === "fr"
          ? "Vous n'êtes pas authentifié."
          : "You are not authenticated.",
      );
    }

    if (currentUser.role !== "admin") {
      throw new Error(
        locale === "fr"
          ? "Vous n'avez pas les droits pour effectuer cette action."
          : "You do not have permission to perform this action.",
      );
    }

    const tickets = await getAllTickets({
      query: parsedInput,
    });

    return tickets;
  });

/**
 * Action de mise à jour d'un ticket + synchronisation des pièces jointes.
 * - Met à jour les champs du ticket (titre, description, etc.)
 * - Gère les attachments via un diff:
 *   - ceux qui restent dans le payload sont conservés
 *   - ceux qui ont disparu sont supprimés (DB + blob)
 *   - ceux qui arrivent depuis /temp/ sont promus + insérés
 */

export const updateTicketAction = actionClient
  .metadata({ actionName: "updateTicketAction" })
  .inputSchema(updateTicketInputSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    const locale = await getLocale();

    if (!currentUser) {
      throw new Error(
        locale === "fr"
          ? "Vous n'êtes pas authentifié."
          : "You are not authenticated.",
      );
    }

    const clientId = currentUser.clientId;
    if (!clientId) {
      throw new Error(
        locale === "fr"
          ? "Utilisateur non rattaché à une entreprise cliente."
          : "User not associated with a client company.",
      );
    }

    const updatedById = currentUser.id;
    const uploadedById = currentUser.id;

    // On suppose que l'input contient l'id du ticket
    const {
      id: ticketIdFromInput,
      attachments = [],
      dateCloture,
      ...ticketData
    } = parsedInput;

    if (!ticketIdFromInput) {
      throw new Error(
        locale === "fr"
          ? "ID du ticket obligatoire pour la mise à jour."
          : "Ticket ID is required for update.",
      );
    }

    // Vérifier que le ticket appartient bien au client
    const [existingTicket] = await db
      .select()
      .from(tickets)
      .where(
        and(eq(tickets.id, ticketIdFromInput), eq(tickets.clientId, clientId)),
      )
      .limit(1);

    if (!existingTicket) {
      throw new Error(
        locale === "fr"
          ? "Ticket introuvable ou non accessible."
          : "Ticket not found or not accessible.",
      );
    }

    let dateClotureValue: Date | null = null;
    if (ticketData.status === "clos") {
      dateClotureValue = new Date();
    }

    const payload = updateTicketInDbSchema.parse({
      ...ticketData,
      id: ticketIdFromInput,
      dateCloture: dateClotureValue,
      updatedById,
    });

    const result = await db.transaction(async (tx) => {
      // 1) Mise à jour du ticket
      const [updatedTicket] = await tx
        .update(tickets)
        .set(payload)
        .where(eq(tickets.id, ticketIdFromInput))
        .returning();

      if (!updatedTicket) {
        throw new Error(
          locale === "fr"
            ? "Échec de la mise à jour du ticket."
            : "Failed to update ticket.",
        );
      }

      const ticketId = updatedTicket.id;

      // 2) Récupérer les attachments existants en base
      const existingAttachments = await tx
        .select()
        .from(ticketsAttachments)
        .where(eq(ticketsAttachments.ticketId, ticketId));

      // Helper pour comparer "logiquement" deux attachments
      const attachmentKey = (att: {
        url: string;
        filename: string;
        mimeType: string;
        size: number;
      }) => `${att.url}__${att.filename}__${att.mimeType}__${att.size}`;

      const existingByKey = new Map(
        existingAttachments.map((att) => [attachmentKey(att), att]),
      );

      const incomingByKey = new Map(
        attachments.map((att) => [attachmentKey(att), att]),
      );

      // 3) Déterminer ceux à supprimer (présents en DB mais plus dans le payload)
      const toDelete = existingAttachments.filter(
        (att) => !incomingByKey.has(attachmentKey(att)),
      );

      if (toDelete.length > 0) {
        // Supprimer les blobs de ceux qui disparaissent
        // (on ignore les erreurs de delete, c'est du best-effort)
        for (const att of toDelete) {
          try {
            if (att.url) {
              await promoteSafeDelete(att.url);
            }
          } catch {
            // ignore
          }
        }

        // Supprimer les rows en DB
        await tx.delete(ticketsAttachments).where(
          inArray(
            ticketsAttachments.id,
            toDelete.map((a) => a.id),
          ),
        );
      }

      // 4) Déterminer ceux à ajouter (payload mais pas en DB)
      const toInsertRaw = attachments.filter(
        (att) => !existingByKey.has(attachmentKey(att)),
      );

      // Promouvoir les nouveaux (si /temp/) puis insérer
      if (toInsertRaw.length > 0) {
        const promotedAttachments = await Promise.all(
          toInsertRaw.map((att) =>
            promoteTempTicketAttachment(att, {
              clientId,
              ticketId,
              tableName: "tickets",
            }),
          ),
        );

        await tx.insert(ticketsAttachments).values(
          promotedAttachments.map((att) =>
            insertTicketAttachmentToDbSchema.parse({
              ticketId,
              uploadedById,
              url: att.url,
              filename: att.filename,
              mimeType: att.mimeType,
              size: att.size,
            }),
          ),
        );
      }

      // 5) Récupérer l'état final des pièces jointes
      const updatedAttachments = await tx
        .select()
        .from(ticketsAttachments)
        .where(eq(ticketsAttachments.ticketId, ticketId));

      const safeTicket = selectTicketSchema.parse(updatedTicket);

      return {
        ticket: safeTicket,
        attachments: updatedAttachments,
      };
    });

    return {
      message: locale === "fr" ? "Ticket mis à jour" : "Ticket updated",
      ticket: result.ticket,
      attachments: result.attachments,
    };
  });

/**
 * Helper best-effort pour supprimer un blob.
 * Ici on utilise simplement del(url), mais tu peux affiner si besoin.
 */

async function promoteSafeDelete(url: string) {
  try {
    await del(url);
  } catch {
    // on ne bloque pas la transaction pour un échec de delete de blob
  }
}

// Schema pour l'action admin pour insérer un ticket avec clientId explicite

const insertTicketForAdminInputSchema = insertTicketInputSchema.extend({
  clientId: z.number().int().positive("ID du client invalide"),
});

// Action pour récupérer les tickets d'un client (admin uniquement)
const getClientTicketsInputSchema = z.object({
  clientId: z.number().int().positive("ID du client invalide"),
});

export const getClientTicketsForAdminAction = actionClient
  .metadata({ actionName: "getClientTicketsForAdminAction" })
  .inputSchema(getClientTicketsInputSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    const locale = await getLocale();

    if (!currentUser) {
      throw new Error(
        locale === "fr"
          ? "Vous n'êtes pas authentifié."
          : "You are not authenticated.",
      );
    }

    if (currentUser.role !== "admin") {
      throw new Error(
        locale === "fr"
          ? "Vous n'avez pas les droits pour effectuer cette action."
          : "You do not have permission to perform this action.",
      );
    }

    const { clientId } = parsedInput;

    // Récupérer tous les tickets du client (sans pagination)
    const clientTickets = await db
      .select()
      .from(tickets)
      .where(eq(tickets.clientId, clientId))
      .orderBy(tickets.createdAt);

    return clientTickets.map((ticket) => selectTicketSchema.parse(ticket));
  });

// Action pour créer un ticket pour un client spécifique (admin uniquement)
export const insertTicketForAdminAction = actionClient
  .metadata({ actionName: "insertTicketForAdminAction" })
  .inputSchema(insertTicketForAdminInputSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    const locale = await getLocale();

    if (!currentUser) {
      throw new Error(
        locale === "fr"
          ? "Vous n'êtes pas authentifié."
          : "You are not authenticated.",
      );
    }

    if (currentUser.role !== "admin") {
      throw new Error(
        locale === "fr"
          ? "Vous n'avez pas les droits pour effectuer cette action."
          : "You do not have permission to perform this action.",
      );
    }

    const createdById = currentUser.id;
    const updatedById = currentUser.id;
    const uploadedById = currentUser.id;

    const {
      attachments = [],
      dateCloture,
      clientId,
      ...ticketData
    } = parsedInput;

    let dateClotureValue: Date | null = null;
    if (ticketData.status === "clos") {
      dateClotureValue = new Date();
    }
    const payload = insertTicketToDbSchema.parse({
      ...ticketData,
      clientId,
      dateCloture: dateClotureValue,
      createdById,
      updatedById,
    });

    const result = await db.transaction(async (tx) => {
      // 1) Insert du ticket
      const [insertedTicket] = await tx
        .insert(tickets)
        .values(payload)
        .returning();

      if (!insertedTicket) {
        throw new Error(
          locale === "fr"
            ? "Échec de la création du ticket."
            : "Failed to create ticket.",
        );
      }

      const ticketId = insertedTicket.id;

      // 2) Promotion des attachments (temp -> définitif)
      const promotedAttachments =
        attachments.length > 0
          ? await Promise.all(
              attachments.map((att) =>
                promoteTempTicketAttachment(att, {
                  clientId,
                  ticketId,
                  tableName: "tickets",
                }),
              ),
            )
          : [];

      // 3) Insert des attachments en base avec les URL finales
      if (promotedAttachments.length > 0) {
        await tx.insert(ticketsAttachments).values(
          promotedAttachments.map((att) =>
            insertTicketAttachmentToDbSchema.parse({
              ticketId,
              uploadedById,
              url: att.url,
              filename: att.filename,
              mimeType: att.mimeType,
              size: att.size,
            }),
          ),
        );
      }

      // 4) Relire les attachments si tu veux renvoyer un snapshot
      const insertedAttachments =
        promotedAttachments.length > 0
          ? await tx
              .select()
              .from(ticketsAttachments)
              .where(eq(ticketsAttachments.ticketId, ticketId))
          : [];

      const safeTicket = selectTicketSchema.parse(insertedTicket);

      return {
        ticket: safeTicket,
        attachments: insertedAttachments,
      };
    });
    return {
      message: locale === "fr" ? "Ticket ajouté" : "Ticket added",
      ticket: result.ticket,
      attachments: result.attachments,
    };
  });
