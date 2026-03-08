"use server";

import { db } from "@/db";
import { clientPrestataireRelations, entreprises } from "@/db/schema/entreprises";
import { userPrestataireAdhesions } from "@/db/schema/users";
import { documents, documentsLinks } from "@/db/schema/documents";
import { sites } from "@/db/schema/sites";
import { ticketMessages, tickets } from "@/db/schema/tickets";
import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import {
  assignTicketSchema,
  changeTicketStatusSchema,
  insertTicketFormSchema,
  insertTicketMessageActionSchema,
  selectTicketMessageSchema,
  selectTicketSchema,
  ticketsQuerySchema,
  updateTicketAssigneEntrepriseSchema,
  updateTicketAssigneUserSchema,
  updateTicketAttachmentsSchema,
  updateTicketBasicFieldsSchema,
  updateTicketFormSchema,
  updateTicketStatutSchema,
} from "@/zod-schemas/ticket.schema";
import { and, eq, inArray } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { z } from "zod";

// Queries
import { getSession } from "@/server/auth/get-session";
import {
  getTicketById,
  getTicketsByPerimetre,
} from "@/server/queries/tickets.query";
import { hasAccessToEntreprise } from "@/server/queries/userAdhesions.query";
import { getEffectivePlateformeRole } from "@/server/utils/permissions.utils";
import { cookies } from "next/headers";

// Utils
import { getDocumentsByTicketId } from "@/server/queries/documents.query";
import { deleteS3Object, promoteS3Key } from "@/server/s3/s3";
import { canUserAccessTicket } from "@/server/utils/ticketsPerimetre.utils";
import {
  canUserAssignTicket,
  canUserCreateTicket,
  canUserEditAssigneEntrepriseId,
  canUserEditAssigneUserId,
  canUserEditStatut,
  canUserEditTicketBasicFields,
  canUserEditTypeAndPriorite,
  canUserUpdateTicket,
  getAvailableStatutsForUser,
} from "@/server/utils/ticketsPermissions.utils";
import { isStatusTransitionAllowed } from "@/server/utils/ticketsTransitions.utils";
import { normalizeForSubmit } from "@/zod-helpers/normalize";

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

    // Vérifier accès entreprise (posture-aware)
    const hasAccess = await hasAccessToEntreprise(
      currentUser.id,
      parsedInput.entrepriseId,
    );

    if (!hasAccess) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Déterminer posture depuis le cookie
    const cookieStore = await cookies();
    const posture = (cookieStore.get("fm4all:postureActive")?.value ??
      "client") as "client" | "prestataire" | "plateforme";

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
      ticketId: z.uuid(),
      entrepriseId: z.uuid(),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // Vérifier accès entreprise (posture-aware)
    const hasAccess = await hasAccessToEntreprise(
      currentUser.id,
      parsedInput.entrepriseId,
    );

    if (!hasAccess) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Récupérer ticket
    const ticket = await getTicketById(parsedInput.ticketId);

    if (!ticket) {
      throw errors.notFound("Ticket");
    }

    // Vérifier accès via périmètre (posture-aware, gère client/prestataire/plateforme)
    const hasTicketAccess = await canUserAccessTicket({
      userId: currentUser.id,
      ticketId: parsedInput.ticketId,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!hasTicketAccess) {
      throw errors.forbidden(
        "Vous n'avez pas accès à ce ticket (périmètre insuffisant).",
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
      entrepriseId: z.uuid(),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // Vérifier accès entreprise (posture-aware)
    const hasAccess = await hasAccessToEntreprise(
      currentUser.id,
      parsedInput.entrepriseId,
    );

    if (!hasAccess) {
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
        "Vous n'avez pas la permission de créer un ticket sur ce site. Rôle requis: demandeur_site ou supérieur.",
      );
    }

    // Déterminer posture
    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    const isPlatform = !!platformRole?.role;

    const cookieStore = await cookies();
    const posture = cookieStore.get("fm4all:postureActive")?.value;

    // demandeurEntrepriseId = TOUJOURS l'entreprise courante (qui crée)
    const demandeurEntrepriseId = parsedInput.entrepriseId;

    // proprietaireEntrepriseId selon posture:
    // - Client: auto = entreprise courante
    // - Plateforme: choisi dans le Select
    // - Prestataire: client propriétaire du site (récupéré depuis la table sites)
    let proprietaireEntrepriseId: string;

    if (isPlatform) {
      proprietaireEntrepriseId =
        parsedInput.proprietaireEntrepriseId || parsedInput.entrepriseId;
    } else if (posture === "prestataire") {
      // Récupérer le client propriétaire du site
      const site = await db.query.sites.findFirst({
        where: eq(sites.id, parsedInput.siteId),
        columns: { entrepriseId: true },
      });
      if (!site) {
        throw errors.notFound("Site introuvable.");
      }
      // Vérifier que la relation client-prestataire existe
      const relation = await db.query.clientPrestataireRelations.findFirst({
        where: and(
          eq(
            clientPrestataireRelations.clientEntrepriseId,
            site.entrepriseId,
          ),
          eq(
            clientPrestataireRelations.prestataireEntrepriseId,
            parsedInput.entrepriseId,
          ),
        ),
        columns: { id: true },
      });
      if (!relation) {
        throw errors.forbidden(
          "Vous n'avez pas de relation avec le client propriétaire de ce site.",
        );
      }
      proprietaireEntrepriseId = site.entrepriseId;
    } else {
      proprietaireEntrepriseId = parsedInput.entrepriseId;
    }

    // Normaliser les données avant insertion (transforme "" → null)
    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: ["description", "assigneEntrepriseId"] as const,
    });

    // Transaction: INSERT ticket + attachments
    const insertedTicket = await db.transaction(async (tx) => {
      // 1. INSERT ticket
      const [ticket] = await tx
        .insert(tickets)
        .values({
          titre: normalized.titre, // Déjà nettoyé (capitalizeFirstWord) par schema
          description: normalized.description, // "" → null par normalizeForSubmit
          type: normalized.type,
          priorite: normalized.priorite,
          siteId: normalized.siteId,
          proprietaireEntrepriseId,
          demandeurEntrepriseId,
          assigneEntrepriseId: normalized.assigneEntrepriseId, // "" → null par normalizeForSubmit
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
              categorie: "ticket_piece_jointe",
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
      entrepriseId: z.uuid(),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // Vérifier accès entreprise (posture-aware)
    const hasAccess = await hasAccessToEntreprise(
      currentUser.id,
      parsedInput.entrepriseId,
    );

    if (!hasAccess) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Récupérer ticket
    const ticket = await getTicketById(parsedInput.id);

    if (!ticket) {
      throw errors.notFound("Ticket");
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
        "Vous n'avez pas la permission de modifier ce ticket.",
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

    // Vérifier accès entreprise (posture-aware)
    const hasAccess = await hasAccessToEntreprise(
      currentUser.id,
      parsedInput.entrepriseId,
    );

    if (!hasAccess) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Récupérer ticket
    const ticket = await getTicketById(parsedInput.ticketId);

    if (!ticket) {
      throw errors.notFound("Ticket");
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
        `Transition ${ticket.statut} → ${parsedInput.newStatut} non autorisée pour votre rôle.`,
      );
    }

    // Calculer timestamps
    const now = new Date();
    const updates: Record<string, unknown> = {
      statut: parsedInput.newStatut,
      lastActivityAt: now,
      updatedById: currentUser.id,
    };

    // priseEnChargeAt : setté une seule fois lors du passage à pris_en_charge
    if (
      parsedInput.newStatut === "pris_en_charge" &&
      ticket.statut === "nouveau" &&
      !ticket.priseEnChargeAt
    ) {
      updates.priseEnChargeAt = now;
    }

    if (parsedInput.newStatut === "a_valider") {
      updates.resolvedAt = now;
    }

    if (parsedInput.newStatut === "clos") {
      updates.closedAt = now;
      if (!ticket.resolvedAt) {
        updates.resolvedAt = now;
      }
    }

    if (
      parsedInput.newStatut === "annule" ||
      parsedInput.newStatut === "rejete"
    ) {
      updates.closedAt = now;
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

    // Vérifier accès entreprise (posture-aware)
    const hasAccess = await hasAccessToEntreprise(
      currentUser.id,
      parsedInput.entrepriseId,
    );

    if (!hasAccess) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Récupérer ticket
    const ticket = await getTicketById(parsedInput.ticketId);

    if (!ticket) {
      throw errors.notFound("Ticket");
    }

    // Vérifier permission ASSIGN
    const canAssign = await canUserAssignTicket({
      userId: currentUser.id,
      ticketId: parsedInput.ticketId,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!canAssign) {
      throw errors.forbidden(
        "Vous n'avez pas la permission d'assigner ce ticket. Rôle requis: responsable_site ou plateforme.",
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
// FIELD-LEVEL UPDATE ACTIONS (Ticket Details Page)
// Basées sur la matrice de permissions 2026-02-24
// ═══════════════════════════════════════════════════════════════

/**
 * Met à jour les champs de base du ticket (titre, description, type, priorite)
 * Permissions: Plateforme OU Client (demandeur/responsable site)
 */
export const updateTicketBasicFieldsAction = actionClient
  .metadata({ actionName: "updateTicketBasicFieldsAction" })
  .inputSchema(updateTicketBasicFieldsSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // Vérifier si plateforme
    const platformRole = await getEffectivePlateformeRole(currentUser.id);

    // Si pas plateforme, vérifier accès entreprise (posture-aware)
    if (!platformRole?.role) {
      const hasAccess = await hasAccessToEntreprise(
        currentUser.id,
        parsedInput.entrepriseId,
      );

      if (!hasAccess) {
        throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
      }
    }

    // Vérifier permission sur titre/description (niveau ≥ 2 — demandeur_site)
    const hasBasicFields =
      parsedInput.titre !== undefined || parsedInput.description !== undefined;
    const hasTypeOrPriorite =
      parsedInput.type !== undefined || parsedInput.priorite !== undefined;

    if (hasBasicFields) {
      const canEdit = await canUserEditTicketBasicFields({
        userId: currentUser.id,
        ticketId: parsedInput.ticketId,
        entrepriseId: parsedInput.entrepriseId,
      });
      if (!canEdit) {
        throw errors.forbidden(
          "Vous n'avez pas la permission de modifier le titre ou la description. Rôle requis : demandeur_site ou supérieur.",
        );
      }
    }

    // Vérifier permission sur type/priorité (niveau ≥ 3 — responsable_site uniquement)
    if (hasTypeOrPriorite) {
      const canEditTypeOrPriorite = await canUserEditTypeAndPriorite({
        userId: currentUser.id,
        ticketId: parsedInput.ticketId,
        entrepriseId: parsedInput.entrepriseId,
      });
      if (!canEditTypeOrPriorite) {
        throw errors.forbidden(
          "Vous n'avez pas la permission de modifier le type ou la priorité. Rôle requis : responsable_site.",
        );
      }
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
  .inputSchema(updateTicketAssigneEntrepriseSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // Normaliser: "" → null
    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: ["assigneEntrepriseId"] as const,
    });

    // Vérifier accès entreprise (posture-aware)
    const hasAccess = await hasAccessToEntreprise(
      currentUser.id,
      normalized.entrepriseId,
    );

    if (!hasAccess) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Vérifier permission
    const canEdit = await canUserEditAssigneEntrepriseId({
      userId: currentUser.id,
      ticketId: normalized.ticketId,
      entrepriseId: normalized.entrepriseId,
    });

    if (!canEdit) {
      throw errors.forbidden(
        "Vous n'avez pas la permission de modifier le prestataire assigné.",
      );
    }

    // Si client, vérifier que le prestataire est dans sa liste
    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    const isPlatform = !!platformRole?.role;

    if (!isPlatform && normalized.assigneEntrepriseId) {
      const { getClientPrestataires } = await import(
        "@/server/queries/clientServiceExecutions.query"
      );
      const prestataires = await getClientPrestataires(normalized.entrepriseId);

      const isAllowed = prestataires.some(
        (p) => p.id === normalized.assigneEntrepriseId,
      );

      if (!isAllowed) {
        throw errors.forbidden(
          "Ce prestataire n'est pas dans votre liste de prestataires autorisés.",
        );
      }
    }

    // Si on change de prestataire, reset assigneUserId
    const updates: Record<string, unknown> = {
      assigneEntrepriseId: normalized.assigneEntrepriseId,
      assigneUserId: null, // Reset user assignment
      lastActivityAt: new Date(),
      updatedById: currentUser.id,
    };

    // UPDATE
    const [updatedTicket] = await db
      .update(tickets)
      .set(updates)
      .where(eq(tickets.id, normalized.ticketId))
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
  .inputSchema(updateTicketAssigneUserSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // Normaliser: "" → null
    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: ["assigneUserId"] as const,
    });

    // Vérifier accès entreprise (posture-aware)
    const hasAccess = await hasAccessToEntreprise(
      currentUser.id,
      normalized.entrepriseId,
    );

    if (!hasAccess) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Vérifier permission
    const canEdit = await canUserEditAssigneUserId({
      userId: currentUser.id,
      ticketId: normalized.ticketId,
      entrepriseId: normalized.entrepriseId,
    });

    if (!canEdit) {
      throw errors.forbidden(
        "Seul le prestataire assigné peut modifier l'utilisateur assigné.",
      );
    }

    // UPDATE
    const [updatedTicket] = await db
      .update(tickets)
      .set({
        assigneUserId: normalized.assigneUserId,
        lastActivityAt: new Date(),
        updatedById: currentUser.id,
      })
      .where(eq(tickets.id, normalized.ticketId))
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
  .inputSchema(updateTicketStatutSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // Vérifier si plateforme
    const platformRole = await getEffectivePlateformeRole(currentUser.id);

    // Si pas plateforme, vérifier accès entreprise (posture-aware)
    if (!platformRole?.role) {
      const hasAccess = await hasAccessToEntreprise(
        currentUser.id,
        parsedInput.entrepriseId,
      );

      if (!hasAccess) {
        throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
      }
    }

    // Vérifier permission générale
    const canEdit = await canUserEditStatut({
      userId: currentUser.id,
      ticketId: parsedInput.ticketId,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!canEdit) {
      throw errors.forbidden(
        "Vous n'avez pas la permission de modifier le statut du ticket.",
      );
    }

    // Vérifier que le statut demandé est dans le superset autorisé
    const availableStatuts = await getAvailableStatutsForUser({
      userId: currentUser.id,
      ticketId: parsedInput.ticketId,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!availableStatuts.includes(parsedInput.statut)) {
      throw errors.forbidden(
        `Le statut "${parsedInput.statut}" n'est pas autorisé pour votre rôle.`,
      );
    }

    // Récupérer ticket pour vérifier le statut courant et les timestamps
    const ticket = await getTicketById(parsedInput.ticketId);
    if (!ticket) {
      throw errors.notFound("Ticket");
    }

    // Vérifier la transition via la machine d'état
    const isAllowed = await isStatusTransitionAllowed({
      userId: currentUser.id,
      ticketId: parsedInput.ticketId,
      entrepriseId: parsedInput.entrepriseId,
      currentStatut: ticket.statut,
      newStatut: parsedInput.statut,
    });

    if (!isAllowed) {
      throw errors.forbidden(
        `Transition ${ticket.statut} → ${parsedInput.statut} non autorisée pour votre rôle.`,
      );
    }

    // Calculer timestamps
    const now = new Date();
    const updates: Record<string, unknown> = {
      statut: parsedInput.statut,
      lastActivityAt: now,
      updatedById: currentUser.id,
    };

    // priseEnChargeAt : setté une seule fois lors du passage à pris_en_charge
    if (
      parsedInput.statut === "pris_en_charge" &&
      ticket.statut === "nouveau" &&
      !ticket.priseEnChargeAt
    ) {
      updates.priseEnChargeAt = now;
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

// ═══════════════════════════════════════════════════════════════
// UPDATE TICKET ATTACHMENTS
// ═══════════════════════════════════════════════════════════════

/**
 * Met à jour les pièces jointes du ticket
 * - Promeut les nouveaux fichiers (temp → documents)
 * - Supprime les anciens fichiers (DB + S3)
 *
 * Permissions: Plateforme OU Client (demandeur/responsable site)
 */
export const updateTicketAttachmentsAction = actionClient
  .metadata({ actionName: "updateTicketAttachmentsAction" })
  .inputSchema(updateTicketAttachmentsSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // Vérifier si plateforme
    const platformRole = await getEffectivePlateformeRole(currentUser.id);

    // Si pas plateforme, vérifier accès entreprise (posture-aware)
    if (!platformRole?.role) {
      const hasAccess = await hasAccessToEntreprise(
        currentUser.id,
        parsedInput.entrepriseId,
      );

      if (!hasAccess) {
        throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
      }
    }

    // Vérifier permission
    const canEdit = await canUserEditTicketBasicFields({
      userId: currentUser.id,
      ticketId: parsedInput.ticketId,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!canEdit) {
      throw errors.forbidden(
        "Vous n'avez pas la permission de modifier les pièces jointes du ticket.",
      );
    }

    // Récupérer ticket pour avoir proprietaireEntrepriseId
    const ticket = await getTicketById(parsedInput.ticketId);

    if (!ticket) {
      throw errors.notFound("Ticket");
    }

    // Récupérer les documents actuels du ticket
    const existingDocuments = await getDocumentsByTicketId(
      parsedInput.ticketId,
    );

    // IDs des nouveaux attachments (depuis le form)
    const newStorageKeys = new Set(
      parsedInput.attachments.map((att) => att.storageKey),
    );

    // Transaction pour update atomique
    await db.transaction(async (tx) => {
      // 1. Supprimer les anciens documents qui ne sont plus dans la liste
      for (const existingDoc of existingDocuments) {
        if (!newStorageKeys.has(existingDoc.storageKey)) {
          // Supprimer de documentsLinks
          await tx
            .delete(documentsLinks)
            .where(eq(documentsLinks.documentId, existingDoc.id));

          // Supprimer de documents
          await tx.delete(documents).where(eq(documents.id, existingDoc.id));

          // Supprimer de S3
          await deleteS3Object({ key: existingDoc.storageKey });
        }
      }

      // 2. Ajouter les nouveaux documents (ceux qui ont une temp key)
      const existingKeys = new Set(
        existingDocuments.map((doc) => doc.storageKey),
      );

      for (const attachment of parsedInput.attachments) {
        // Skip si déjà existe
        if (existingKeys.has(attachment.storageKey)) continue;

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
            proprietaireEntrepriseId: ticket.proprietaireEntrepriseId,
            categorie: "ticket_piece_jointe",
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
          proprietaireEntrepriseId: ticket.proprietaireEntrepriseId,
          ticketId: ticket.id,
          visibilite: "public",
          createdById: currentUser.id,
          updatedById: currentUser.id,
        });
      }

      // 3. Update lastActivityAt du ticket
      await tx
        .update(tickets)
        .set({
          lastActivityAt: new Date(),
          updatedById: currentUser.id,
        })
        .where(eq(tickets.id, parsedInput.ticketId));
    });

    return {
      success: true,
      message: "Pièces jointes mises à jour avec succès",
    };
  });

/**
 * Créer un message dans un ticket avec pièces jointes optionnelles
 *
 * Permissions: canViewTicket (tout utilisateur ayant accès au ticket peut poster)
 * Note: Visibilité "interne" réservée à plateforme + prestataire assigné
 *
 * @param ticketId - ID du ticket
 * @param entrepriseId - ID de l'entreprise
 * @param message - Contenu du message
 * @param visibilite - public ou interne
 * @param attachments - Pièces jointes optionnelles
 * @returns Message créé
 */
export const insertTicketMessageAction = actionClient
  .metadata({ actionName: "insertTicketMessageAction" })
  .inputSchema(insertTicketMessageActionSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // Vérifier que le ticket existe et appartient à l'entreprise
    const ticket = await getTicketById(parsedInput.ticketId);

    if (!ticket) {
      throw errors.notFound("Ticket");
    }

    // Vérifier que l'utilisateur est lié à ce ticket (client, prestataire ou plateforme)
    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    const isPlatform = !!platformRole?.role;

    // Client : propriétaire ou demandeur (prestataire peut être demandeur)
    const isClient =
      !isPlatform &&
      (ticket.proprietaireEntrepriseId === parsedInput.entrepriseId ||
        (ticket.demandeurEntrepriseId === parsedInput.entrepriseId &&
          ticket.assigneEntrepriseId !== parsedInput.entrepriseId));

    // Prestataire : assigné ou demandeur (quand prestataire a créé le ticket)
    const isPrestataire =
      !isPlatform &&
      !isClient &&
      (ticket.assigneEntrepriseId === parsedInput.entrepriseId ||
        ticket.demandeurEntrepriseId === parsedInput.entrepriseId);

    if (!isPlatform && !isClient && !isPrestataire) {
      throw errors.forbidden("Vous n'avez pas accès à ce ticket.");
    }

    // Vérifier rôle ≥ demandeur_site pour poster un message (niveau ≥ 2)
    // Les observateurs et intervenants ne peuvent pas commenter
    if (!isPlatform) {
      const canPost = await canUserEditTicketBasicFields({
        userId: currentUser.id,
        ticketId: parsedInput.ticketId,
        entrepriseId: parsedInput.entrepriseId,
      });
      if (!canPost) {
        throw errors.forbidden(
          "Vous n'avez pas la permission de poster un message. Rôle requis : demandeur_site ou supérieur.",
        );
      }
    }

    // Vérifier permissions de visibilité selon posture
    if (!isPlatform) {
      // Client peut poster "public" ou "client_only"
      if (
        isClient &&
        !["public", "client_only"].includes(parsedInput.visibilite)
      ) {
        throw errors.forbidden(
          "Le client ne peut poster que des messages publics ou réservés au client.",
        );
      }
      // Prestataire peut poster "public" ou "prestataire_only"
      if (
        isPrestataire &&
        !["public", "prestataire_only"].includes(parsedInput.visibilite)
      ) {
        throw errors.forbidden(
          "Le prestataire ne peut poster que des messages publics ou réservés au prestataire.",
        );
      }
    }

    // Transaction: INSERT message + promote PJ + INSERT documents + UPDATE ticket
    const insertedMessage = await db.transaction(async (tx) => {
      // 1. INSERT message
      const [message] = await tx
        .insert(ticketMessages)
        .values({
          ticketId: parsedInput.ticketId,
          auteurUserId: currentUser.id,
          message: parsedInput.message,
          visibilite: parsedInput.visibilite,
        })
        .returning();

      // 2. Traiter les pièces jointes si présentes
      if (parsedInput.attachments && parsedInput.attachments.length > 0) {
        for (const attachment of parsedInput.attachments) {
          // Skip si pas de storageKey (fichier non uploadé)
          if (!attachment.storageKey) continue;

          // Promouvoir le fichier temp → documents
          const promotedKey = await promoteS3Key({
            tempKey: attachment.storageKey,
          });

          // INSERT document
          const [doc] = await tx
            .insert(documents)
            .values({
              proprietaireEntrepriseId: ticket.proprietaireEntrepriseId,
              categorie: "ticket_message_piece_jointe",
              storageProvider: "s3",
              storageKey: promotedKey, // ✅ Utiliser le promotedKey
              filename: attachment.filename,
              mimeType: attachment.mimeType,
              sizeBytes: attachment.sizeBytes,
              createdById: currentUser.id,
            })
            .returning();

          // INSERT documentsLinks avec ticketMessageId
          // Note: ticketId est NULL pour les PJ des messages (normalisation)
          // Le lien se fait uniquement via ticketMessageId
          await tx.insert(documentsLinks).values({
            documentId: doc.id,
            proprietaireEntrepriseId: ticket.proprietaireEntrepriseId,
            ticketMessageId: message.id, // ✅ Lier au message uniquement
            visibilite: "public",
            createdById: currentUser.id,
            updatedById: currentUser.id,
          });
        }
      }

      // 3. UPDATE ticket.lastActivityAt
      await tx
        .update(tickets)
        .set({
          lastActivityAt: new Date(),
          updatedById: currentUser.id,
        })
        .where(eq(tickets.id, parsedInput.ticketId));

      return message;
    });

    // Valider le retour avec Zod
    const parsedMessage = selectTicketMessageSchema.parse(insertedMessage);

    return { message: parsedMessage };
  });

// ═══════════════════════════════════════════════════════════════
// GET PRESTATAIRE CLIENTS (pour création ticket, sans restriction de rôle)
// ═══════════════════════════════════════════════════════════════

export const getPrestataireMesClientsForTicketAction = actionClient
  .metadata({ actionName: "getPrestataireMesClientsForTicketAction" })
  .inputSchema(z.object({ prestataireEntrepriseId: z.uuid() }), {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    // Vérifier adhésion prestataire active (tout rôle)
    const adhesion = await db.query.userPrestataireAdhesions.findFirst({
      where: and(
        eq(userPrestataireAdhesions.userId, currentUser.id),
        eq(userPrestataireAdhesions.entrepriseId, parsedInput.prestataireEntrepriseId),
        eq(userPrestataireAdhesions.statut, "actif"),
      ),
    });

    if (!adhesion) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Récupérer les IDs clients via clientPrestataireRelations
    const clientIds = await db
      .select({ id: clientPrestataireRelations.clientEntrepriseId })
      .from(clientPrestataireRelations)
      .where(
        eq(
          clientPrestataireRelations.prestataireEntrepriseId,
          parsedInput.prestataireEntrepriseId,
        ),
      );

    if (!clientIds.length) return { clients: [] };

    const clients = await db
      .select({ id: entreprises.id, nom: entreprises.nom })
      .from(entreprises)
      .where(inArray(entreprises.id, clientIds.map((c) => c.id)));

    return { clients };
  });
