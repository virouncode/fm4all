import "server-only";

import { db } from "@/db";
import { tickets, ticketMessages } from "@/db/schema/tickets";
import { sites } from "@/db/schema/sites";
import { entreprises } from "@/db/schema/entreprises";
import { userClientAdhesions, userPrestataireAdhesions } from "@/db/schema/users";
import { getAllPrestataireSiteIds } from "@/server/queries/userPrestataireSiteAttributions.query";
import { user } from "@/db/schema/auth";
import { documents, documentsLinks } from "@/db/schema/documents";
import { getUserAccessibleSiteIdsForTickets } from "@/server/utils/ticketsPerimetre.utils";
import {
  SelectTicketType,
  TicketsQueryType,
} from "@/zod-schemas/ticket.schema";
import { alias } from "drizzle-orm/pg-core";
import { and, asc, count, desc, eq, inArray, like, or, SQL } from "drizzle-orm";

const proprietaireEntreprise = alias(entreprises, "proprietaire_entreprise");
const demandeurEntreprise = alias(entreprises, "demandeur_entreprise");
const assigneEntreprise = alias(entreprises, "assigne_entreprise");
import type { TicketMessageVisibiliteType } from "@/zod-schemas/enums";

/**
 * Récupère un ticket par ID
 *
 * @param ticketId - ID du ticket
 * @returns Le ticket ou null si non trouvé
 */
export async function getTicketById(
  ticketId: string,
): Promise<SelectTicketType | null> {
  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, ticketId),
  });

  return ticket || null;
}

/**
 * Récupère les tickets du périmètre utilisateur avec filtres et pagination
 *
 * Logique selon posture:
 * - Plateforme: TOUS les tickets (aucun filtre de périmètre)
 * - Client: tickets des sites du périmètre effectif (attributions)
 * - Prestataire: tickets assignés à son entreprise ou à lui
 *
 * @param userId - ID de l'utilisateur
 * @param entrepriseId - ID de l'entreprise active
 * @param posture - Posture de l'utilisateur (client/prestataire/plateforme)
 * @param filters - Filtres, tri et pagination
 * @returns Tickets paginés avec métadonnées
 */
export async function getTicketsByPerimetre({
  userId,
  entrepriseId,
  posture,
  filters,
}: {
  userId: string;
  entrepriseId: string;
  posture: "client" | "prestataire" | "plateforme";
  filters: TicketsQueryType;
}): Promise<{
  items: SelectTicketType[];
  total: number;
  page: number;
  pageSize: number;
}> {
  // 1. Calculer le périmètre accessible selon posture
  let accessibleSiteIds: string[] = [];
  let prestataireIsAdmin = false;
  let clientIsAdmin = false;

  if (posture === "client") {
    // Admin client → voit tous les tickets de l'entreprise (sans restriction de site)
    const clientAdhesion = await db.query.userClientAdhesions.findFirst({
      where: and(
        eq(userClientAdhesions.userId, userId),
        eq(userClientAdhesions.entrepriseId, entrepriseId),
        eq(userClientAdhesions.statut, "actif"),
      ),
      columns: { role: true },
    });
    clientIsAdmin = clientAdhesion?.role === "admin";

    if (!clientIsAdmin) {
      // Non-admin: sites du périmètre effectif
      accessibleSiteIds = await getUserAccessibleSiteIdsForTickets({
        userId,
        entrepriseId,
      });
    }
  } else if (posture === "prestataire") {
    // Prestataire: tickets assignés à son entreprise
    // Admin → tous les tickets assignés, sinon filtrer par sites attribués
    const prestataireAdhesion = await db.query.userPrestataireAdhesions.findFirst({
      where: and(
        eq(userPrestataireAdhesions.userId, userId),
        eq(userPrestataireAdhesions.entrepriseId, entrepriseId),
        eq(userPrestataireAdhesions.statut, "actif"),
      ),
      columns: { role: true },
    });

    if (!prestataireAdhesion) {
      return { items: [], total: 0, page: filters.page, pageSize: filters.pageSize };
    }

    prestataireIsAdmin = prestataireAdhesion.role === "admin";

    if (!prestataireIsAdmin) {
      accessibleSiteIds = await getAllPrestataireSiteIds({ userId });
    }
  }

  // 2. Construire WHERE clause
  const conditions: (SQL | undefined)[] = [];

  // Filtre périmètre
  if (posture === "plateforme") {
    // Plateforme: aucun filtre de périmètre, voit TOUS les tickets
  } else if (posture === "client") {
    // Filtre sur l'entreprise propriétaire (toujours)
    conditions.push(eq(tickets.proprietaireEntrepriseId, entrepriseId));
    if (!clientIsAdmin) {
      // Non-admin: restreindre aux sites attribués
      if (accessibleSiteIds.length === 0) {
        return { items: [], total: 0, page: filters.page, pageSize: filters.pageSize };
      }
      conditions.push(inArray(tickets.siteId, accessibleSiteIds));
    }
  } else if (posture === "prestataire") {
    if (!prestataireIsAdmin && accessibleSiteIds.length === 0) {
      return { items: [], total: 0, page: filters.page, pageSize: filters.pageSize };
    }
    // Uniquement les tickets assignés à l'entreprise du prestataire
    conditions.push(eq(tickets.assigneEntrepriseId, entrepriseId));
    // Non-admin: restreindre aux sites attribués
    if (!prestataireIsAdmin) {
      conditions.push(inArray(tickets.siteId, accessibleSiteIds));
    }
  }

  // Filtres métier
  if (filters.search) {
    conditions.push(
      or(
        like(tickets.titre, `%${filters.search}%`),
        like(tickets.description, `%${filters.search}%`),
      ),
    );
  }
  if (filters.statut) {
    conditions.push(eq(tickets.statut, filters.statut));
  }
  if (filters.priorite) {
    conditions.push(eq(tickets.priorite, filters.priorite));
  }
  if (filters.type) {
    conditions.push(eq(tickets.type, filters.type));
  }
  if (filters.siteId) {
    conditions.push(eq(tickets.siteId, filters.siteId));
  }
  if (filters.assigneUserId) {
    conditions.push(eq(tickets.assigneUserId, filters.assigneUserId));
  }
  if (filters.proprietaireEntrepriseId) {
    conditions.push(
      eq(tickets.proprietaireEntrepriseId, filters.proprietaireEntrepriseId),
    );
  }
  if (filters.demandeurEntrepriseId) {
    conditions.push(
      eq(tickets.demandeurEntrepriseId, filters.demandeurEntrepriseId),
    );
  }
  if (filters.assigneEntrepriseId) {
    conditions.push(
      eq(tickets.assigneEntrepriseId, filters.assigneEntrepriseId),
    );
  }

  // Filtrer les undefined avant de passer à and()
  const validConditions = conditions.filter((c): c is SQL => c !== undefined);
  const whereClause =
    validConditions.length > 0 ? and(...validConditions) : undefined;

  // 3. Compter le total
  const countResult = whereClause
    ? await db.select({ count: count() }).from(tickets).where(whereClause)
    : await db.select({ count: count() }).from(tickets);

  const total = countResult[0]?.count || 0;

  // 4. Récupérer les items avec pagination + tri
  // Construire les clauses de tri (primaire + secondaire)
  const orderByClauses: SQL[] = [];

  switch (filters.orderBy) {
    case "siteNom":
      orderByClauses.push(
        filters.orderDir === "desc" ? desc(sites.nom) : asc(sites.nom),
      );
      break;

    case "proprietaireEntrepriseNom":
      orderByClauses.push(
        filters.orderDir === "desc"
          ? desc(proprietaireEntreprise.nom)
          : asc(proprietaireEntreprise.nom),
      );
      break;

    case "demandeurEntrepriseNom":
      orderByClauses.push(
        filters.orderDir === "desc"
          ? desc(demandeurEntreprise.nom)
          : asc(demandeurEntreprise.nom),
      );
      break;

    case "assigneEntrepriseNom":
      orderByClauses.push(
        filters.orderDir === "desc"
          ? desc(assigneEntreprise.nom)
          : asc(assigneEntreprise.nom),
      );
      break;

    default:
      // Tri sur colonnes tickets directes (priorite, statut, createdAt, etc.)
      orderByClauses.push(
        filters.orderDir === "desc"
          ? desc(tickets[filters.orderBy])
          : asc(tickets[filters.orderBy]),
      );
  }

  // Tri secondaire systématique sur lastActivityAt (les plus récents en premier)
  orderByClauses.push(desc(tickets.lastActivityAt));
  // Tri tertiaire sur id pour garantir un ordre stable (pagination sans doublons)
  orderByClauses.push(asc(tickets.id));

  // Query avec JOINs pour tri relationnel
  const queryBuilder = db
    .select({
      id: tickets.id,
      occurrenceId: tickets.occurrenceId,
      occurrenceTacheId: tickets.occurrenceTacheId,
      proprietaireEntrepriseId: tickets.proprietaireEntrepriseId,
      demandeurEntrepriseId: tickets.demandeurEntrepriseId,
      assigneEntrepriseId: tickets.assigneEntrepriseId,
      assigneUserId: tickets.assigneUserId,
      siteId: tickets.siteId,
      titre: tickets.titre,
      description: tickets.description,
      type: tickets.type,
      priorite: tickets.priorite,
      statut: tickets.statut,
      priseEnChargeAt: tickets.priseEnChargeAt,
      lastActivityAt: tickets.lastActivityAt,
      resolvedAt: tickets.resolvedAt,
      closedAt: tickets.closedAt,
      createdById: tickets.createdById,
      updatedById: tickets.updatedById,
      createdAt: tickets.createdAt,
      updatedAt: tickets.updatedAt,
    })
    .from(tickets)
    .leftJoin(sites, eq(tickets.siteId, sites.id))
    .leftJoin(
      proprietaireEntreprise,
      eq(tickets.proprietaireEntrepriseId, proprietaireEntreprise.id),
    )
    .leftJoin(
      demandeurEntreprise,
      eq(tickets.demandeurEntrepriseId, demandeurEntreprise.id),
    )
    .leftJoin(
      assigneEntreprise,
      eq(tickets.assigneEntrepriseId, assigneEntreprise.id),
    );

  const items = whereClause
    ? await queryBuilder
        .where(whereClause)
        .orderBy(...orderByClauses)
        .limit(filters.pageSize)
        .offset((filters.page - 1) * filters.pageSize)
    : await queryBuilder
        .orderBy(...orderByClauses)
        .limit(filters.pageSize)
        .offset((filters.page - 1) * filters.pageSize);

  return {
    items,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

/**
 * Vérifie si un ticket appartient à une entreprise
 *
 * @param ticketId - ID du ticket
 * @param entrepriseId - ID de l'entreprise
 * @returns true si le ticket appartient à l'entreprise
 */
export async function ticketBelongsToEntreprise({
  ticketId,
  entrepriseId,
}: {
  ticketId: string;
  entrepriseId: string;
}): Promise<boolean> {
  const ticket = await db.query.tickets.findFirst({
    where: and(
      eq(tickets.id, ticketId),
      eq(tickets.proprietaireEntrepriseId, entrepriseId),
    ),
  });

  return !!ticket;
}

/**
 * Récupère les messages d'un ticket avec leurs pièces jointes et infos auteur,
 * filtrés selon la posture de l'utilisateur courant.
 *
 * Règles de visibilité:
 * - plateforme : voit tout (public, client_only, prestataire_only, fm4all_only)
 * - client     : voit public + client_only
 * - prestataire: voit public + prestataire_only
 *
 * @param ticketId - ID du ticket
 * @param posture  - Posture de l'utilisateur courant
 * @returns Messages visibles avec attachments et infos auteur
 */
export async function getTicketMessagesWithAttachments(
  ticketId: string,
  posture: "client" | "prestataire" | "plateforme",
) {
  // Déterminer les visibilités autorisées selon la posture
  const visibilitesAutorisees: TicketMessageVisibiliteType[] =
    posture === "plateforme"
      ? ["public", "client_only", "prestataire_only", "fm4all_only"]
      : posture === "client"
        ? ["public", "client_only"]
        : ["public", "prestataire_only"];

  // 1. Récupérer les messages avec infos auteur, filtrés par visibilité
  const messages = await db
    .select({
      id: ticketMessages.id,
      ticketId: ticketMessages.ticketId,
      auteurUserId: ticketMessages.auteurUserId,
      message: ticketMessages.message,
      visibilite: ticketMessages.visibilite,
      createdAt: ticketMessages.createdAt,
      // Infos auteur
      auteurPrenom: user.prenom,
      auteurNom: user.nom,
    })
    .from(ticketMessages)
    .leftJoin(user, eq(ticketMessages.auteurUserId, user.id))
    .where(
      and(
        eq(ticketMessages.ticketId, ticketId),
        inArray(ticketMessages.visibilite, visibilitesAutorisees),
      ),
    )
    .orderBy(asc(ticketMessages.createdAt));

  // 2. Récupérer les pièces jointes en une seule query batch
  const messageIds = messages.map((m) => m.id);

  const allAttachments =
    messageIds.length > 0
      ? await db
          .select({
            messageId: documentsLinks.ticketMessageId,
            id: documents.id,
            storageKey: documents.storageKey,
            filename: documents.filename,
            mimeType: documents.mimeType,
            sizeBytes: documents.sizeBytes,
          })
          .from(documents)
          .innerJoin(documentsLinks, eq(documentsLinks.documentId, documents.id))
          .where(inArray(documentsLinks.ticketMessageId, messageIds))
          .orderBy(asc(documents.createdAt))
      : [];

  const attachmentsByMessageId = new Map<
    string,
    Array<{
      id: string;
      storageKey: string;
      filename: string;
      mimeType: string;
      sizeBytes: number | null;
    }>
  >();
  for (const att of allAttachments) {
    if (!att.messageId) continue;
    const list = attachmentsByMessageId.get(att.messageId) ?? [];
    list.push({
      id: att.id,
      storageKey: att.storageKey,
      filename: att.filename,
      mimeType: att.mimeType,
      sizeBytes: att.sizeBytes,
    });
    attachmentsByMessageId.set(att.messageId, list);
  }

  return messages.map((msg) => ({
    ...msg,
    attachments: attachmentsByMessageId.get(msg.id) ?? [],
  }));
}
