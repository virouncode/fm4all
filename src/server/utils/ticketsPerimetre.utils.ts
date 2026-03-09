import "server-only";

import { db } from "@/db";
import { userPrestataireAdhesions } from "@/db/schema/users";
import { getUserClientSiteAttributions } from "@/server/queries/userSiteAttributions.query";
import {
  getAllPrestataireSiteIds,
  getUserPrestataireSiteAttributions,
} from "@/server/queries/userPrestataireSiteAttributions.query";
import { getEffectivePlateformeRole } from "@/server/utils/permissions.utils";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";

type DbOrTransactionType =
  | typeof db
  | Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Récupère les IDs des sites accessibles pour l'utilisateur (pour tickets)
 *
 * - Posture client: utilise getUserClientSiteAttributions
 * - Posture prestataire: utilise getUserPrestataireSiteAttributions (clientEntrepriseId requis)
 *
 * @param userId - ID de l'utilisateur
 * @param entrepriseId - ID de l'entreprise (client pour posture client, client aussi pour prestataire)
 * @param tx - Transaction optionnelle
 * @returns Array des siteIds accessibles
 */
export async function getUserAccessibleSiteIdsForTickets({
  userId,
  entrepriseId,
  tx,
}: {
  userId: string;
  entrepriseId: string;
  tx?: DbOrTransactionType;
}): Promise<string[]> {
  const cookieStore = await cookies();
  const posture = cookieStore.get("fm4all:postureActive")?.value;

  if (posture === "prestataire") {
    const { attributions } = await getUserPrestataireSiteAttributions({
      userId,
      clientEntrepriseId: entrepriseId,
    });

    const siteIds = attributions
      .filter((attr) => attr.mode === "inclure")
      .map((attr) => attr.siteId);

    return Array.from(new Set(siteIds));
  }

  // client (défaut)
  const { attributions } = await getUserClientSiteAttributions({
    userId,
    entrepriseId,
  });

  // Filtrer les sites où l'utilisateur a un rôle effectif
  const siteIds = attributions
    .filter((attr) => attr.role !== null)
    .map((attr) => attr.siteId);

  // Dédupliquer
  return Array.from(new Set(siteIds));
}

/**
 * Vérifie si un utilisateur a accès à un ticket via périmètre
 *
 * Logique selon posture (lue depuis cookie):
 * - Plateforme: accès total
 * - Prestataire: tickets assignés à son entreprise ou à lui
 * - Client: tickets des sites du périmètre effectif
 *
 * @param userId - ID de l'utilisateur
 * @param ticketId - ID du ticket
 * @param entrepriseId - ID de l'entreprise active (client ou prestataire selon posture)
 * @returns true si l'utilisateur a accès au ticket
 */
export async function canUserAccessTicket({
  userId,
  ticketId,
  entrepriseId,
}: {
  userId: string;
  ticketId: string;
  entrepriseId: string;
}): Promise<boolean> {
  const { getTicketById } = await import("@/server/queries/tickets.query");
  const ticket = await getTicketById(ticketId);

  if (!ticket) return false;

  // Déterminer posture depuis cookie
  const platformRole = await getEffectivePlateformeRole(userId);

  if (platformRole?.role) {
    return true; // Plateforme a accès à tout
  }

  const cookieStore = await cookies();
  const posture = cookieStore.get("fm4all:postureActive")?.value;

  if (posture === "prestataire") {
    // Seuls les tickets assignés à l'entreprise sont visibles
    if (ticket.assigneEntrepriseId !== entrepriseId) return false;

    // Admin → accès total aux tickets de l'entreprise
    const prestataireAdhesion = await db.query.userPrestataireAdhesions.findFirst({
      where: and(
        eq(userPrestataireAdhesions.userId, userId),
        eq(userPrestataireAdhesions.entrepriseId, entrepriseId),
        eq(userPrestataireAdhesions.statut, "actif"),
      ),
      columns: { role: true },
    });

    if (!prestataireAdhesion) return false;
    if (prestataireAdhesion.role === "admin") return true;

    // Non-admin: vérifier attribution sur le site du ticket
    const siteIds = await getAllPrestataireSiteIds({ userId });
    return siteIds.includes(ticket.siteId);
  }

  // client (défaut)
  // Vérifier que le ticket appartient à l'entreprise cliente
  if (ticket.proprietaireEntrepriseId !== entrepriseId) return false;

  // Vérifier que le site est dans le périmètre effectif du client
  const accessibleSiteIds = await getUserAccessibleSiteIdsForTickets({
    userId,
    entrepriseId,
  });

  return accessibleSiteIds.includes(ticket.siteId);
}
