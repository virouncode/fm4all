import "server-only";

import { db } from "@/db";
import { getUserClientSiteAttributions } from "@/server/queries/userSiteAttributions.query";

type DbOrTransaction =
  | typeof db
  | Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Récupère les IDs des sites accessibles pour l'utilisateur (pour tickets)
 *
 * Utilise getUserClientSiteAttributions qui gère déjà:
 * - Le scope (self/subtree)
 * - Le mode (inclure/exclure)
 * - La closure table pour les hiérarchies
 *
 * @param userId - ID de l'utilisateur
 * @param entrepriseId - ID de l'entreprise
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
  tx?: DbOrTransaction;
}): Promise<string[]> {
  const { attributions } = await getUserClientSiteAttributions({
    userId,
    entrepriseId,
  });

  // Filtrer les sites où l'utilisateur a un rôle effectif
  // (les attributions avec mode=exclure sont déjà filtrées par resolveUserEffectiveRoleOnSite)
  const siteIds = attributions
    .filter((attr) => attr.role !== null)
    .map((attr) => attr.siteId);

  // Dédupliquer
  return Array.from(new Set(siteIds));
}

/**
 * Vérifie si un utilisateur a accès à un ticket via périmètre
 *
 * Logique selon posture:
 * - Plateforme: accès total
 * - Fournisseur: tickets assignés à son entreprise ou à lui
 * - Client: tickets des sites du périmètre effectif
 *
 * @param userId - ID de l'utilisateur
 * @param ticketId - ID du ticket
 * @param entrepriseId - ID de l'entreprise active
 * @param posture - Posture (optionnel, sera calculée si non fournie)
 * @returns true si l'utilisateur a accès au ticket
 */
export async function canUserAccessTicket({
  userId,
  ticketId,
  entrepriseId,
  posture,
}: {
  userId: string;
  ticketId: string;
  entrepriseId: string;
  posture?: "client" | "prestataire" | "plateforme";
}): Promise<boolean> {
  const { getTicketById } = await import("@/server/queries/tickets.query");
  const ticket = await getTicketById(ticketId);

  if (!ticket) return false;

  // Vérifier ownership entreprise
  if (ticket.proprietaireEntrepriseId !== entrepriseId) return false;

  // Déterminer posture si non fournie
  let userPosture = posture;

  if (!userPosture) {
    const { getUserPlateformeAdhesion } = await import(
      "@/server/queries/userPlateformeAdhesions.query"
    );
    const { getEntrepriseById } = await import(
      "@/server/queries/entreprise.query"
    );

    const platformRole = await getUserPlateformeAdhesion(userId);
    const entreprise = await getEntrepriseById(entrepriseId);

    if (platformRole?.role) {
      userPosture = "plateforme";
    } else if (entreprise?.roles.includes("prestataire")) {
      userPosture = "prestataire";
    } else {
      userPosture = "client";
    }
  }

  // Vérifier selon posture
  if (userPosture === "plateforme") {
    return true; // Plateforme a accès à tout
  }

  if (userPosture === "prestataire") {
    // Prestataire: ticket assigné à son entreprise ou à lui
    return (
      ticket.assigneEntrepriseId === entrepriseId ||
      ticket.assigneUserId === userId
    );
  }

  if (userPosture === "client") {
    // Client: site dans périmètre effectif
    const accessibleSiteIds = await getUserAccessibleSiteIdsForTickets({
      userId,
      entrepriseId,
    });

    return accessibleSiteIds.includes(ticket.siteId);
  }

  return false;
}
