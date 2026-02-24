import "server-only";

import { db } from "@/db";
import { tickets } from "@/db/schema/tickets";
import { sites } from "@/db/schema/sites";
import { entreprises } from "@/db/schema/entreprises";
import { getUserAccessibleSiteIdsForTickets } from "@/server/utils/ticketsPerimetre.utils";
import {
  SelectTicketType,
  TicketsQueryType,
} from "@/zod-schemas/ticket.schema";
import { and, asc, count, desc, eq, inArray, like, or, sql, SQL } from "drizzle-orm";

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
 * - Fournisseur: tickets assignés à son entreprise ou à lui
 *
 * @param userId - ID de l'utilisateur
 * @param entrepriseId - ID de l'entreprise active
 * @param posture - Posture de l'utilisateur (client/fournisseur/plateforme)
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
  posture: "client" | "fournisseur" | "plateforme";
  filters: TicketsQueryType;
}): Promise<{
  items: SelectTicketType[];
  total: number;
  page: number;
  pageSize: number;
}> {
  // 1. Calculer les siteIds accessibles selon posture
  let accessibleSiteIds: string[] = [];

  if (posture === "client") {
    // Client: sites du périmètre effectif
    accessibleSiteIds = await getUserAccessibleSiteIdsForTickets({
      userId,
      entrepriseId,
    });
  }

  // 2. Construire WHERE clause
  const conditions: (SQL | undefined)[] = [];

  // Filtre périmètre
  if (posture === "plateforme") {
    // Plateforme: aucun filtre de périmètre, voit TOUS les tickets
    // (Pas de condition ici)
  } else if (posture === "client") {
    // Client: filtrer par sites accessibles
    if (accessibleSiteIds.length === 0) {
      // Aucun site accessible → aucun ticket
      return {
        items: [],
        total: 0,
        page: filters.page,
        pageSize: filters.pageSize,
      };
    }
    conditions.push(inArray(tickets.siteId, accessibleSiteIds));
  } else if (posture === "fournisseur") {
    // Fournisseur: tickets assignés
    conditions.push(
      or(
        eq(tickets.assigneEntrepriseId, entrepriseId),
        eq(tickets.assigneUserId, userId),
      ),
    );
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
          ? desc(sql`proprietaire_entreprise.nom`)
          : asc(sql`proprietaire_entreprise.nom`),
      );
      break;

    case "demandeurEntrepriseNom":
      orderByClauses.push(
        filters.orderDir === "desc"
          ? desc(sql`demandeur_entreprise.nom`)
          : asc(sql`demandeur_entreprise.nom`),
      );
      break;

    case "assigneEntrepriseNom":
      orderByClauses.push(
        filters.orderDir === "desc"
          ? desc(sql`assigne_entreprise.nom`)
          : asc(sql`assigne_entreprise.nom`),
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

  // Query avec JOINs pour tri relationnel
  const queryBuilder = db
    .select({
      id: tickets.id,
      occurenceId: tickets.occurenceId,
      occurenceTacheId: tickets.occurenceTacheId,
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
      sql`entreprises AS proprietaire_entreprise`,
      eq(tickets.proprietaireEntrepriseId, sql`proprietaire_entreprise.id`),
    )
    .leftJoin(
      sql`entreprises AS demandeur_entreprise`,
      eq(tickets.demandeurEntrepriseId, sql`demandeur_entreprise.id`),
    )
    .leftJoin(
      sql`entreprises AS assigne_entreprise`,
      eq(tickets.assigneEntrepriseId, sql`assigne_entreprise.id`),
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
