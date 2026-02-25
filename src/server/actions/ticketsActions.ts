"use server";

import { actionClient } from "@/lib/action/safe-actions";
import { errors } from "@/lib/action/errors";
import { db } from "@/db";
import { tickets, ticketMessages } from "@/db/schema/tickets";
import { documents, documentsLinks } from "@/db/schema/documents";
import {
  selectTicketSchema,
  insertTicketFormSchema,
  updateTicketFormSchema,
  ticketsQuerySchema,
  changeTicketStatusSchema,
  assignTicketSchema,
  insertTicketMessageFormSchema,
  selectTicketMessageSchema,
  updateTicketBasicFieldsSchema,
  updateTicketAssigneEntrepriseSchema,
  updateTicketAssigneUserSchema,
  updateTicketStatutSchema,
} from "@/zod-schemas/ticket.schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { flattenValidationErrors } from "next-safe-action";

// Queries
import {
  getTicketById,
  getTicketsByPerimetre,
} from "@/server/queries/tickets.query";
import { getTicketMessagesFiltered } from "@/server/queries/ticketMessages.query";
import { getUserAdhesion } from "@/server/queries/userAdhesions.query";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import { getEntrepriseById } from "@/server/queries/entreprise.query";
import { getSession } from "@/server/auth/get-session";

// Utils
import { canUserAccessTicket } from "@/server/utils/ticketsPerimetre.utils";
import {
  canUserCreateTicket,
  canUserUpdateTicket,
  canUserAssignTicket,
  canUserEditTicketBasicFields,
  canUserEditAssigneEntrepriseId,
  canUserEditAssigneUserId,
  canUserEditStatut,
  getAvailableStatutsForUser,
} from "@/server/utils/ticketsPermissions.utils";
import { isStatusTransitionAllowed } from "@/server/utils/ticketsTransitions.utils";
import { canUserWriteVisibility } from "@/server/utils/ticketsMessages.utils";
import { promoteS3Key } from "@/server/s3/s3";

// ═══════════════════════════════════════════════════════════════
// GET TICKETS (avec filtres et pagination)
// ═══════════════════════════════════════════════════════════════

export const getTicketsAction = actionClient
  .metadata({ actionName: "getTicketsAction" })
  .inputSchema(ticketsQuerySchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // Vérifier accès entreprise
    const adhesion = await getUserAdhesion({
      userId: currentUser.id,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!adhesion) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Déterminer posture
    const platformRole = await getUserPlateformeAdhesion(currentUser.id);
    const entreprise = await getEntrepriseById(parsedInput.entrepriseId);

    let posture: "client" | "fournisseur" | "plateforme" = "client";

    if (platformRole?.role) {
      posture = "plateforme";
    } else if (entreprise?.roles.includes("prestataire")) {
      posture = "fournisseur";
    }

    // Récupérer tickets avec périmètre
    const result = await getTicketsByPerimetre({
      userId: currentUser.id,
      entrepriseId: parsedInput.entrepriseId,
      posture,
      filters: parsedInput,
    });

    // Calculer hasMore pour infinite scroll
    const hasMore = result.page * result.pageSize < result.total;

    return {
      tickets: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      hasMore,
    };
  });

// ═══════════════════════════════════════════════════════════════
// GET TICKET BY ID
// ═══════════════════════════════════════════════════════════════

export const getTicketByIdAction = actionClient
  .metadata({ actionName: "getTicketByIdAction" })
  .inputSchema(
    z.object({
      ticketId: z.string().uuid(),
      entrepriseId: z.string().uuid(),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    }
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // Vérifier accès entreprise
    const adhesion = await getUserAdhesion({
      userId: currentUser.id,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!adhesion) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Récupérer ticket
    const ticket = await getTicketById(parsedInput.ticketId);

    if (!ticket) {
      throw errors.notFound("Ticket");
    }

    // Vérifier ownership
    if (ticket.proprietaireEntrepriseId !== parsedInput.entrepriseId) {
      throw errors.forbidden(
        "Ce ticket n'appartient pas à votre entreprise."
      );
    }

    // Vérifier accès via périmètre
    const hasAccess = await canUserAccessTicket({
      userId: currentUser.id,
      ticketId: parsedInput.ticketId,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!hasAccess) {
      throw errors.forbidden(
        "Vous n'avez pas accès à ce ticket (périmètre insuffisant)."
      );
    }

    return { ticket };
  });

// ═══════════════════════════════════════════════════════════════
// INSERT TICKET
// ═══════════════════════════════════════════════════════════════

export const insertTicketAction = actionClient
  .metadata({ actionName: "insertTicketAction" })
  .inputSchema(
    insertTicketFormSchema.extend({
      entrepriseId: z.string().uuid(),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    }
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // Vérifier accès entreprise
    const adhesion = await getUserAdhesion({
      userId: currentUser.id,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!adhesion) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Vérifier permission CREATE
    const canCreate = await canUserCreateTicket({
      userId: currentUser.id,
      siteId: parsedInput.siteId,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!canCreate) {
      throw errors.forbidden(
        "Vous n'avez pas la permission de créer un ticket sur ce site. Rôle requis: demandeur_site ou supérieur."
      );
    }

    // Déterminer posture
    const platformRole = await getUserPlateformeAdhesion(currentUser.id);
    const isPlatform = !!platformRole?.role;

    // demandeurEntrepriseId = TOUJOURS l'entreprise courante
    const demandeurEntrepriseId = parsedInput.entrepriseId;

    // proprietaireEntrepriseId selon posture:
    // - Client: auto = entreprise courante
    // - Plateforme: choisi dans le Select
    const proprietaireEntrepriseId = isPlatform
      ? parsedInput.proprietaireEntrepriseId || parsedInput.entrepriseId
      : parsedInput.entrepriseId;

    // Transaction: INSERT ticket + attachments
    const insertedTicket = await db.transaction(async (tx) => {
      // 1. INSERT ticket
      const [ticket] = await tx
        .insert(tickets)
        .values({
          titre: parsedInput.titre,
          description: parsedInput.description || null,
          type: parsedInput.type,
          priorite: parsedInput.priorite,
          siteId: parsedInput.siteId,
          proprietaireEntrepriseId,
          demandeurEntrepriseId,
          assigneEntrepriseId: parsedInput.assigneEntrepriseId || null,
          statut: "nouveau",
          createdById: currentUser.id,
          updatedById: currentUser.id,
        })
        .returning();

      // 2. Traiter les pièces jointes si présentes
      if (parsedInput.attachments && parsedInput.attachments.length > 0) {
        for (const attachment of parsedInput.attachments) {
          // Skip si pas de storageKey (fichier non uploadé)
          if (!attachment.storageKey) continue;

          // Promouvoir le fichier de /temp à /documents
          const promotedKey = await promoteS3Key({
            tempKey: attachment.storageKey,
          });

          // INSERT dans documents
          const [document] = await tx
            .insert(documents)
            .values({
              proprietaireEntrepriseId,
              categorie: "piece_jointe",
              storageProvider: "s3",
              storageKey: promotedKey,
              filename: attachment.filename,
              mimeType: attachment.mimeType,
              sizeBytes: attachment.sizeBytes,
              createdById: currentUser.id,
            })
            .returning();

          // INSERT lien dans documentsLinks
          await tx.insert(documentsLinks).values({
            documentId: document.id,
            proprietaireEntrepriseId,
            ticketId: ticket.id,
            visibilite: "public",
            createdById: currentUser.id,
            updatedById: currentUser.id,
          });
        }
      }

      return ticket;
    });

    // Valider retour
    const parsedTicket = selectTicketSchema.parse(insertedTicket);

    return { ticket: parsedTicket };
  });

// ═══════════════════════════════════════════════════════════════
// UPDATE TICKET
// ═══════════════════════════════════════════════════════════════

export const updateTicketAction = actionClient
  .metadata({ actionName: "updateTicketAction" })
  .inputSchema(
    updateTicketFormSchema.extend({
      entrepriseId: z.string().uuid(),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    }
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // Vérifier accès entreprise
    const adhesion = await getUserAdhesion({
      userId: currentUser.id,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!adhesion) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Récupérer ticket
    const ticket = await getTicketById(parsedInput.id);

    if (!ticket) {
      throw errors.notFound("Ticket");
    }

    // Vérifier ownership
    if (ticket.proprietaireEntrepriseId !== parsedInput.entrepriseId) {
      throw errors.forbidden(
        "Ce ticket n'appartient pas à votre entreprise."
      );
    }

    // Vérifier permission UPDATE
    const canUpdate = await canUserUpdateTicket({
      userId: currentUser.id,
      ticketId: parsedInput.id,
      entrepriseId: parsedInput.entrepriseId,
      updateData: parsedInput,
    });

    if (!canUpdate) {
      throw errors.forbidden(
        "Vous n'avez pas la permission de modifier ce ticket."
      );
    }

    // UPDATE
    const [updatedTicket] = await db
      .update(tickets)
      .set({
        ...(parsedInput.titre && { titre: parsedInput.titre }),
        ...(parsedInput.description !== undefined && {
          description: parsedInput.description || null,
        }),
        ...(parsedInput.type && { type: parsedInput.type }),
        ...(parsedInput.priorite && { priorite: parsedInput.priorite }),
        ...(parsedInput.siteId && { siteId: parsedInput.siteId }),
        ...(parsedInput.statut && { statut: parsedInput.statut }),
        ...(parsedInput.assigneEntrepriseId !== undefined && {
          assigneEntrepriseId: parsedInput.assigneEntrepriseId,
        }),
        ...(parsedInput.assigneUserId !== undefined && {
          assigneUserId: parsedInput.assigneUserId,
        }),
        lastActivityAt: new Date(),
        updatedById: currentUser.id,
      })
      .where(eq(tickets.id, parsedInput.id))
      .returning();

    // Valider retour
    const parsedTicket = selectTicketSchema.parse(updatedTicket);

    return { ticket: parsedTicket };
  });

// ═══════════════════════════════════════════════════════════════
// CHANGE TICKET STATUS
// ═══════════════════════════════════════════════════════════════

export const changeTicketStatusAction = actionClient
  .metadata({ actionName: "changeTicketStatusAction" })
  .inputSchema(changeTicketStatusSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // Vérifier accès entreprise
    const adhesion = await getUserAdhesion({
      userId: currentUser.id,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!adhesion) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Récupérer ticket
    const ticket = await getTicketById(parsedInput.ticketId);

    if (!ticket) {
      throw errors.notFound("Ticket");
    }

    // Vérifier ownership
    if (ticket.proprietaireEntrepriseId !== parsedInput.entrepriseId) {
      throw errors.forbidden(
        "Ce ticket n'appartient pas à votre entreprise."
      );
    }

    // Vérifier transition autorisée
    const isAllowed = await isStatusTransitionAllowed({
      userId: currentUser.id,
      ticketId: parsedInput.ticketId,
      entrepriseId: parsedInput.entrepriseId,
      currentStatut: ticket.statut,
      newStatut: parsedInput.newStatut,
    });

    if (!isAllowed) {
      throw errors.forbidden(
        `Transition ${ticket.statut} → ${parsedInput.newStatut} non autorisée pour votre rôle.`
      );
    }

    // Calculer timestamps
    const now = new Date();
    const updates: Record<string, unknown> = {
      statut: parsedInput.newStatut,
      lastActivityAt: now,
      updatedById: currentUser.id,
    };

    if (parsedInput.newStatut === "a_valider") {
      updates.resolvedAt = now;
    }

    if (parsedInput.newStatut === "clos") {
      updates.closedAt = now;
      if (!ticket.resolvedAt) {
        updates.resolvedAt = now;
      }
    }

    // UPDATE
    const [updatedTicket] = await db
      .update(tickets)
      .set(updates)
      .where(eq(tickets.id, parsedInput.ticketId))
      .returning();

    // Valider retour
    const parsedTicket = selectTicketSchema.parse(updatedTicket);

    return { ticket: parsedTicket };
  });

// ═══════════════════════════════════════════════════════════════
// ASSIGN TICKET
// ═══════════════════════════════════════════════════════════════

export const assignTicketAction = actionClient
  .metadata({ actionName: "assignTicketAction" })
  .inputSchema(assignTicketSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // Vérifier accès entreprise
    const adhesion = await getUserAdhesion({
      userId: currentUser.id,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!adhesion) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Récupérer ticket
    const ticket = await getTicketById(parsedInput.ticketId);

    if (!ticket) {
      throw errors.notFound("Ticket");
    }

    // Vérifier ownership
    if (ticket.proprietaireEntrepriseId !== parsedInput.entrepriseId) {
      throw errors.forbidden(
        "Ce ticket n'appartient pas à votre entreprise."
      );
    }

    // Vérifier permission ASSIGN
    const canAssign = await canUserAssignTicket({
      userId: currentUser.id,
      ticketId: parsedInput.ticketId,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!canAssign) {
      throw errors.forbidden(
        "Vous n'avez pas la permission d'assigner ce ticket. Rôle requis: responsable_site ou plateforme."
      );
    }

    // UPDATE assignation
    const [updatedTicket] = await db
      .update(tickets)
      .set({
        ...(parsedInput.assigneEntrepriseId !== undefined && {
          assigneEntrepriseId: parsedInput.assigneEntrepriseId,
        }),
        ...(parsedInput.assigneUserId !== undefined && {
          assigneUserId: parsedInput.assigneUserId,
        }),
        lastActivityAt: new Date(),
        updatedById: currentUser.id,
      })
      .where(eq(tickets.id, parsedInput.ticketId))
      .returning();

    // Valider retour
    const parsedTicket = selectTicketSchema.parse(updatedTicket);

    return { ticket: parsedTicket };
  });

// ═══════════════════════════════════════════════════════════════
// INSERT TICKET MESSAGE
// ═══════════════════════════════════════════════════════════════

export const insertTicketMessageAction = actionClient
  .metadata({ actionName: "insertTicketMessageAction" })
  .inputSchema(
    insertTicketMessageFormSchema.extend({
      ticketId: z.string().uuid(),
      entrepriseId: z.string().uuid(),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    }
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // Vérifier accès entreprise
    const adhesion = await getUserAdhesion({
      userId: currentUser.id,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!adhesion) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Récupérer ticket
    const ticket = await getTicketById(parsedInput.ticketId);

    if (!ticket) {
      throw errors.notFound("Ticket");
    }

    // Vérifier ownership
    if (ticket.proprietaireEntrepriseId !== parsedInput.entrepriseId) {
      throw errors.forbidden(
        "Ce ticket n'appartient pas à votre entreprise."
      );
    }

    // Vérifier accès ticket
    const hasAccess = await canUserAccessTicket({
      userId: currentUser.id,
      ticketId: parsedInput.ticketId,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!hasAccess) {
      throw errors.forbidden(
        "Vous n'avez pas accès à ce ticket (périmètre insuffisant)."
      );
    }

    // Vérifier permission visibilité
    const canWrite = await canUserWriteVisibility({
      userId: currentUser.id,
      entrepriseId: parsedInput.entrepriseId,
      visibilite: parsedInput.visibilite,
    });

    if (!canWrite) {
      throw errors.forbidden(
        `Vous ne pouvez pas écrire un message avec la visibilité "${parsedInput.visibilite}".`
      );
    }

    // Transaction: INSERT message + UPDATE lastActivityAt
    const insertedMessage = await db.transaction(async (tx) => {
      const [message] = await tx
        .insert(ticketMessages)
        .values({
          ticketId: parsedInput.ticketId,
          auteurUserId: currentUser.id,
          message: parsedInput.message,
          visibilite: parsedInput.visibilite,
        })
        .returning();

      // Mettre à jour lastActivityAt du ticket
      await tx
        .update(tickets)
        .set({
          lastActivityAt: new Date(),
          updatedById: currentUser.id,
        })
        .where(eq(tickets.id, parsedInput.ticketId));

      return message;
    });

    // Valider retour
    const parsedMessage = selectTicketMessageSchema.parse(insertedMessage);

    return { message: parsedMessage };
  });

// ═══════════════════════════════════════════════════════════════
// GET TICKET MESSAGES
// ═══════════════════════════════════════════════════════════════

export const getTicketMessagesAction = actionClient
  .metadata({ actionName: "getTicketMessagesAction" })
  .inputSchema(
    z.object({
      ticketId: z.string().uuid(),
      entrepriseId: z.string().uuid(),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    }
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // Vérifier accès entreprise
    const adhesion = await getUserAdhesion({
      userId: currentUser.id,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!adhesion) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Vérifier accès ticket
    const hasAccess = await canUserAccessTicket({
      userId: currentUser.id,
      ticketId: parsedInput.ticketId,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!hasAccess) {
      throw errors.forbidden(
        "Vous n'avez pas accès à ce ticket (périmètre insuffisant)."
      );
    }

    // Récupérer messages filtrés
    const messages = await getTicketMessagesFiltered({
      ticketId: parsedInput.ticketId,
      userId: currentUser.id,
      entrepriseId: parsedInput.entrepriseId,
    });

    return { messages };
  });

// ═══════════════════════════════════════════════════════════════
// FIELD-LEVEL UPDATE ACTIONS (Ticket Details Page)
// Basées sur la matrice de permissions 2026-02-24
// ═══════════════════════════════════════════════════════════════

/**
 * Met à jour les champs de base du ticket (titre, description, type, priorite)
 * Permissions: Plateforme OU Client (demandeur/responsable site)
 */
export const updateTicketBasicFieldsAction = actionClient
  .metadata({ actionName: "updateTicketBasicFieldsAction" })
  .inputSchema(
    updateTicketBasicFieldsSchema,
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    }
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // Vérifier accès entreprise
    const adhesion = await getUserAdhesion({
      userId: currentUser.id,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!adhesion) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Vérifier permission
    const canEdit = await canUserEditTicketBasicFields({
      userId: currentUser.id,
      ticketId: parsedInput.ticketId,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!canEdit) {
      throw errors.forbidden(
        "Vous n'avez pas la permission de modifier ces champs. Seuls les clients avec rôle demandeur_site ou supérieur peuvent modifier le titre, description, type et priorité."
      );
    }

    // Préparer les updates
    const updates: Record<string, unknown> = {
      lastActivityAt: new Date(),
      updatedById: currentUser.id,
    };

    if (parsedInput.titre) updates.titre = parsedInput.titre;
    if (parsedInput.description !== undefined)
      updates.description = parsedInput.description;
    if (parsedInput.type) updates.type = parsedInput.type;
    if (parsedInput.priorite) updates.priorite = parsedInput.priorite;

    // UPDATE
    const [updatedTicket] = await db
      .update(tickets)
      .set(updates)
      .where(eq(tickets.id, parsedInput.ticketId))
      .returning();

    const parsedTicket = selectTicketSchema.parse(updatedTicket);
    return { ticket: parsedTicket };
  });

/**
 * Met à jour le prestataire assigné (assigneEntrepriseId)
 * Permissions: Plateforme OU Client (demandeur/responsable site)
 */
export const updateTicketAssigneEntrepriseAction = actionClient
  .metadata({ actionName: "updateTicketAssigneEntrepriseAction" })
  .inputSchema(
    updateTicketAssigneEntrepriseSchema,
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    }
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // Vérifier accès entreprise
    const adhesion = await getUserAdhesion({
      userId: currentUser.id,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!adhesion) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Vérifier permission
    const canEdit = await canUserEditAssigneEntrepriseId({
      userId: currentUser.id,
      ticketId: parsedInput.ticketId,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!canEdit) {
      throw errors.forbidden(
        "Vous n'avez pas la permission de modifier le prestataire assigné."
      );
    }

    // Si client, vérifier que le prestataire est dans sa liste
    const platformRole = await getUserPlateformeAdhesion(currentUser.id);
    const isPlatform = !!platformRole?.role;

    if (!isPlatform && parsedInput.assigneEntrepriseId) {
      const { getClientPrestataires } = await import(
        "@/server/queries/clientServiceExecutions.query"
      );
      const prestataires = await getClientPrestataires(
        parsedInput.entrepriseId
      );

      const isAllowed = prestataires.some(
        (p) => p.id === parsedInput.assigneEntrepriseId
      );

      if (!isAllowed) {
        throw errors.forbidden(
          "Ce prestataire n'est pas dans votre liste de prestataires autorisés."
        );
      }
    }

    // Si on change de prestataire, reset assigneUserId
    const updates: Record<string, unknown> = {
      assigneEntrepriseId: parsedInput.assigneEntrepriseId,
      assigneUserId: null, // Reset user assignment
      lastActivityAt: new Date(),
      updatedById: currentUser.id,
    };

    // UPDATE
    const [updatedTicket] = await db
      .update(tickets)
      .set(updates)
      .where(eq(tickets.id, parsedInput.ticketId))
      .returning();

    const parsedTicket = selectTicketSchema.parse(updatedTicket);
    return { ticket: parsedTicket };
  });

/**
 * Met à jour l'utilisateur assigné (assigneUserId)
 * Permissions: UNIQUEMENT Prestataire (si ticket assigné à son entreprise)
 */
export const updateTicketAssigneUserAction = actionClient
  .metadata({ actionName: "updateTicketAssigneUserAction" })
  .inputSchema(
    updateTicketAssigneUserSchema,
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    }
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // Vérifier accès entreprise
    const adhesion = await getUserAdhesion({
      userId: currentUser.id,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!adhesion) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Vérifier permission
    const canEdit = await canUserEditAssigneUserId({
      userId: currentUser.id,
      ticketId: parsedInput.ticketId,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!canEdit) {
      throw errors.forbidden(
        "Seul le prestataire assigné peut modifier l'utilisateur assigné."
      );
    }

    // UPDATE
    const [updatedTicket] = await db
      .update(tickets)
      .set({
        assigneUserId: parsedInput.assigneUserId,
        lastActivityAt: new Date(),
        updatedById: currentUser.id,
      })
      .where(eq(tickets.id, parsedInput.ticketId))
      .returning();

    const parsedTicket = selectTicketSchema.parse(updatedTicket);
    return { ticket: parsedTicket };
  });

/**
 * Met à jour le statut du ticket
 * Permissions: Variables selon posture (voir getAvailableStatutsForUser)
 */
export const updateTicketStatutAction = actionClient
  .metadata({ actionName: "updateTicketStatutAction" })
  .inputSchema(
    updateTicketStatutSchema,
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    }
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // Vérifier accès entreprise
    const adhesion = await getUserAdhesion({
      userId: currentUser.id,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!adhesion) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Vérifier permission générale
    const canEdit = await canUserEditStatut({
      userId: currentUser.id,
      ticketId: parsedInput.ticketId,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!canEdit) {
      throw errors.forbidden(
        "Vous n'avez pas la permission de modifier le statut du ticket."
      );
    }

    // Vérifier que le statut demandé est autorisé pour cet utilisateur
    const availableStatuts = await getAvailableStatutsForUser({
      userId: currentUser.id,
      ticketId: parsedInput.ticketId,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!availableStatuts.includes(parsedInput.statut)) {
      throw errors.forbidden(
        `Le statut "${parsedInput.statut}" n'est pas autorisé pour votre rôle.`
      );
    }

    // Calculer timestamps
    const now = new Date();
    const updates: Record<string, unknown> = {
      statut: parsedInput.statut,
      lastActivityAt: now,
      updatedById: currentUser.id,
    };

    // Récupérer ticket pour vérifier resolvedAt
    const ticket = await getTicketById(parsedInput.ticketId);
    if (!ticket) {
      throw errors.notFound("Ticket");
    }

    if (parsedInput.statut === "a_valider" && !ticket.resolvedAt) {
      updates.resolvedAt = now;
    }

    if (
      parsedInput.statut === "clos" ||
      parsedInput.statut === "annule" ||
      parsedInput.statut === "rejete"
    ) {
      updates.closedAt = now;
    }

    // UPDATE
    const [updatedTicket] = await db
      .update(tickets)
      .set(updates)
      .where(eq(tickets.id, parsedInput.ticketId))
      .returning();

    const parsedTicket = selectTicketSchema.parse(updatedTicket);
    return { ticket: parsedTicket };
  });
