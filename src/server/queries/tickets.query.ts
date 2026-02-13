import "server-only";

import { db } from "@/db";
import { tickets } from "@/db/schema/tickets";
import { getUserAccessibleSiteIdsForTickets } from "@/server/utils/ticketsPerimetre.utils";
import {
  SelectTicketType,
  TicketsQueryType,
} from "@/zod-schemas/ticket.schema";
import { eq, and, or, desc, asc, like, inArray, sql, count } from "drizzle-orm";

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
 * - Plateforme: tous les tickets de l'entreprise
 * - Client: tickets des sites du périmètre effectif
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

  if (posture === "plateforme") {
    // Plateforme: tous les sites de l'entreprise
    const { sites } = await import("@/db/schema/sites");
    const allSites = await db.query.sites.findMany({
      where: eq(sites.entrepriseId, entrepriseId),
      columns: { id: true },
    });
    accessibleSiteIds = allSites.map((s) => s.id);
  } else if (posture === "client") {
    // Client: sites du périmètre effectif
    accessibleSiteIds = await getUserAccessibleSiteIdsForTickets({
      userId,
      entrepriseId,
    });
  }

  // 2. Construire WHERE clause
  const conditions: any[] = [];

  // Filtre périmètre
  if (posture === "plateforme" || posture === "client") {
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

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // 3. Compter le total
  const countResult = await db
    .select({ count: count() })
    .from(tickets)
    .where(whereClause);

  const total = countResult[0]?.count || 0;

  // 4. Récupérer les items avec pagination + tri
  const orderByClause =
    filters.orderDir === "desc"
      ? desc(tickets[filters.orderBy])
      : asc(tickets[filters.orderBy]);

  const items = await db
    .select()
    .from(tickets)
    .where(whereClause)
    .orderBy(orderByClause)
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
