import "server-only";

import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import { resolveUserEffectiveRoleOnSite } from "@/server/utils/userClientSiteAttributions.utils";
import { TicketStatutType } from "@/zod-schemas/enums";

/**
 * Matrix des transitions de statut autorisées
 *
 * Règles métier:
 * - nouveau → pris_en_charge: responsable/plateforme
 * - pris_en_charge → en_attente_prestataire: responsable/plateforme
 * - en_attente_prestataire → en_attente_client: intervenant assigné/plateforme
 * - en_attente_prestataire → a_valider: intervenant assigné/plateforme
 * - a_valider → clos: responsable/plateforme
 * - nouveau → annule: demandeur (créateur)/responsable/plateforme
 * - nouveau → rejete: responsable/plateforme
 *
 * @param userId - ID de l'utilisateur
 * @param ticketId - ID du ticket
 * @param entrepriseId - ID de l'entreprise
 * @param currentStatut - Statut actuel du ticket
 * @param newStatut - Nouveau statut souhaité
 * @returns true si la transition est autorisée
 */
export async function isStatusTransitionAllowed({
  userId,
  ticketId,
  entrepriseId,
  currentStatut,
  newStatut,
}: {
  userId: string;
  ticketId: string;
  entrepriseId: string;
  currentStatut: TicketStatutType;
  newStatut: TicketStatutType;
}): Promise<boolean> {
  // Récupérer le ticket
  const { getTicketById } = await import("@/server/queries/tickets.query");
  const ticket = await getTicketById(ticketId);
  if (!ticket) return false;

  // Vérifier si plateforme
  const platformRole = await getUserPlateformeAdhesion(userId);
  const isPlateforme =
    platformRole?.role === "super_admin_plateforme" ||
    platformRole?.role === "operateur_plateforme";

  // Récupérer rôle effectif sur le site du ticket
  const effectiveRole = await resolveUserEffectiveRoleOnSite({
    userId,
    siteId: ticket.siteId,
    entrepriseId,
  });

  // Flags de permissions
  const isResponsable = effectiveRole === "responsable_site";
  const isDemandeur = effectiveRole === "demandeur_site";
  const isIntervenant = false; // intervenant_site retiré du scope client
  const isCreator = ticket.createdById === userId;
  const isAssignedUser = ticket.assigneUserId === userId;

  // Vérifier transitions selon matrix métier
  switch (currentStatut) {
    case "nouveau":
      if (newStatut === "pris_en_charge") {
        return isPlateforme || isResponsable;
      }
      if (newStatut === "annule") {
        return isPlateforme || isResponsable || (isDemandeur && isCreator);
      }
      if (newStatut === "rejete") {
        return isPlateforme || isResponsable;
      }
      break;

    case "pris_en_charge":
      if (newStatut === "en_attente_prestataire") {
        return isPlateforme || isResponsable;
      }
      break;

    case "en_attente_prestataire":
      if (newStatut === "en_attente_client") {
        return isPlateforme || (isIntervenant && isAssignedUser);
      }
      if (newStatut === "a_valider") {
        return isPlateforme || (isIntervenant && isAssignedUser);
      }
      break;

    case "a_valider":
      if (newStatut === "clos") {
        return isPlateforme || isResponsable;
      }
      break;

    default:
      break;
  }

  return false;
}
