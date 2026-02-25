import "server-only";

import { db } from "@/db";
import { ticketMessages } from "@/db/schema/tickets";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import { SelectTicketMessageType } from "@/zod-schemas/ticket.schema";
import { eq, asc } from "drizzle-orm";

/**
 * Récupère les messages d'un ticket avec filtrage par visibilité
 *
 * Règles de visibilité selon posture:
 * - public: client + prestataire + plateforme
 * - client_only: client + plateforme
 * - prestataire_only: prestataire + plateforme
 * - fm4all_only: plateforme uniquement
 *
 * @param ticketId - ID du ticket
 * @param userId - ID de l'utilisateur
 * @param entrepriseId - ID de l'entreprise active
 * @returns Messages filtrés par visibilité
 */
export async function getTicketMessagesFiltered({
  ticketId,
  userId,
  entrepriseId,
}: {
  ticketId: string;
  userId: string;
  entrepriseId: string;
}): Promise<SelectTicketMessageType[]> {
  // Récupérer tous les messages du ticket
  const allMessages = await db.query.ticketMessages.findMany({
    where: eq(ticketMessages.ticketId, ticketId),
    orderBy: [asc(ticketMessages.createdAt)],
  });

  // Déterminer posture
  const platformRole = await getUserPlateformeAdhesion(userId);
  const { getEntrepriseById } = await import(
    "@/server/queries/entreprise.query"
  );
  const entreprise = await getEntrepriseById(entrepriseId);

  let posture: "client" | "prestataire" | "plateforme" = "client";

  if (platformRole?.role) {
    posture = "plateforme";
  } else if (entreprise?.roles.includes("prestataire")) {
    posture = "prestataire";
  }

  // Filtrer par visibilité
  const filtered = allMessages.filter((msg) => {
    if (msg.visibilite === "public") return true;
    if (msg.visibilite === "fm4all_only") return posture === "plateforme";
    if (msg.visibilite === "client_only")
      return posture === "client" || posture === "plateforme";
    if (msg.visibilite === "prestataire_only")
      return posture === "prestataire" || posture === "plateforme";
    return false;
  });

  return filtered;
}
