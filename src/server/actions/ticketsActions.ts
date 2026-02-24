"use server";

import { actionClient } from "@/lib/action/safe-actions";
import { errors } from "@/lib/action/errors";
import { db } from "@/db";
import { tickets, ticketMessages } from "@/db/schema/tickets";
import {
  selectTicketSchema,
  insertTicketFormSchema,
  updateTicketFormSchema,
  ticketsQuerySchema,
  changeTicketStatusSchema,
  assignTicketSchema,
  insertTicketMessageFormSchema,
  selectTicketMessageSchema,
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
} from "@/server/utils/ticketsPermissions.utils";
import { isStatusTransitionAllowed } from "@/server/utils/ticketsTransitions.utils";
import { canUserWriteVisibility } from "@/server/utils/ticketsMessages.utils";

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

    // Déterminer demandeurEntrepriseId (si plateforme → FM4ALL, sinon null)
    const platformRole = await getUserPlateformeAdhesion(currentUser.id);
    let demandeurEntrepriseId: string | null = null;

    if (platformRole?.role) {
      // C'est la plateforme FM4ALL qui crée le ticket
      demandeurEntrepriseId = parsedInput.entrepriseId;
    }

    // Transaction: INSERT ticket
    const insertedTicket = await db.transaction(async (tx) => {
      const [ticket] = await tx
        .insert(tickets)
        .values({
          titre: parsedInput.titre,
          description: parsedInput.description || null,
          type: parsedInput.type,
          priorite: parsedInput.priorite,
          siteId: parsedInput.siteId,
          proprietaireEntrepriseId: parsedInput.entrepriseId,
          demandeurEntrepriseId,
          statut: "nouveau",
          createdById: currentUser.id,
          updatedById: currentUser.id,
        })
        .returning();

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
