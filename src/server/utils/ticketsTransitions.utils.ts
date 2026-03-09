import "server-only";

import {
  getUserClientAdhesion,
  getUserPrestataireAdhesion,
} from "@/server/queries/userAdhesions.query";
import { getEffectivePlateformeRole } from "@/server/utils/permissions.utils";
import { resolvePostureAwareSiteRole } from "@/server/utils/permissions.utils";
import { TicketStatutType } from "@/zod-schemas/enums";
import { cookies } from "next/headers";

/**
 * Machine d'état des transitions de statut pour les tickets
 *
 * Principes métier:
 * - Plateforme: bypass total
 * - responsable_site requis pour piloter le workflow (niveau ≥ 3)
 * - Transitions côté CLIENT vs côté PRESTATAIRE
 * - États finaux (clos, annule, rejete) verrouillés sauf plateforme
 *
 * Transitions autorisées:
 * - nouveau → pris_en_charge               : assigneEntrepriseId's responsable + plateforme
 * - nouveau → annule                       : responsable (les deux côtés) + plateforme
 * - nouveau → rejete                       : responsable (les deux côtés) + plateforme
 * - pris_en_charge → en_attente_prestataire: CLIENT responsable + plateforme
 * - pris_en_charge → en_attente_client     : PRESTATAIRE responsable + plateforme
 * - pris_en_charge → a_valider             : PRESTATAIRE responsable + plateforme
 * - pris_en_charge → annule                : responsable (les deux côtés) + plateforme
 * - en_attente_prestataire → en_attente_client : PRESTATAIRE responsable + plateforme
 * - en_attente_prestataire → a_valider         : PRESTATAIRE responsable + plateforme
 * - en_attente_prestataire → annule            : responsable + plateforme
 * - en_attente_client → en_attente_prestataire : CLIENT responsable + plateforme
 * - en_attente_client → a_valider              : PRESTATAIRE responsable + plateforme
 * - en_attente_client → annule                 : responsable + plateforme
 * - a_valider → clos                       : CLIENT responsable + plateforme
 * - a_valider → annule                     : responsable + plateforme
 * - clos / annule / rejete → *             : plateforme uniquement
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
  const { getTicketById } = await import("@/server/queries/tickets.query");
  const ticket = await getTicketById(ticketId);
  if (!ticket) return false;

  // Plateforme → bypass total
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) return true;

  // Lire la posture active depuis le cookie
  const cookieStore = await cookies();
  const posture = cookieStore.get("fm4all:postureActive")?.value;

  // Déterminer le côté de l'utilisateur
  const isClientSide =
    posture === "client" || ticket.proprietaireEntrepriseId === entrepriseId;
  const isPrestataireSide =
    posture === "prestataire" ||
    ticket.assigneEntrepriseId === entrepriseId ||
    ticket.demandeurEntrepriseId === entrepriseId;

  // Rôle effectif sur le site (posture-aware)
  // Toujours utiliser ticket.proprietaireEntrepriseId pour la lookup
  const effectiveRoleStr = await resolvePostureAwareSiteRole({
    userId,
    siteId: ticket.siteId,
    entrepriseId: ticket.proprietaireEntrepriseId,
  });

  // Admin entreprise → équivalent responsable_site (bypass site attribution)
  let isEnterpriseAdmin = false;
  if (effectiveRoleStr !== "responsable_site") {
    if (posture === "prestataire") {
      const adhesion = await getUserPrestataireAdhesion({ userId });
      isEnterpriseAdmin = adhesion?.role === "admin";
    } else {
      const adhesion = await getUserClientAdhesion({ userId, entrepriseId });
      isEnterpriseAdmin = adhesion?.role === "admin";
    }
  }

  const isResponsable = effectiveRoleStr === "responsable_site" || isEnterpriseAdmin;

  // ── ÉTATS FINAUX ── verrouillés (plateforme déjà géré ci-dessus)
  if (
    currentStatut === "clos" ||
    currentStatut === "annule" ||
    currentStatut === "rejete"
  ) {
    return false;
  }

  // ── MACHINE D'ÉTAT ──
  switch (currentStatut) {
    case "nouveau": {
      if (newStatut === "pris_en_charge") {
        // Prise en charge : l'entreprise assignée en priorité, sinon tout responsable
        if (ticket.assigneEntrepriseId) {
          return ticket.assigneEntrepriseId === entrepriseId && isResponsable;
        }
        return isResponsable;
      }
      if (newStatut === "annule" || newStatut === "rejete") {
        return isResponsable;
      }
      return false;
    }

    case "pris_en_charge": {
      if (newStatut === "en_attente_prestataire") {
        // Client met la balle chez le prestataire
        return isClientSide && isResponsable;
      }
      if (newStatut === "en_attente_client") {
        // Prestataire met la balle chez le client
        return isPrestataireSide && isResponsable;
      }
      if (newStatut === "a_valider") {
        // Prestataire déclare le travail terminé
        return isPrestataireSide && isResponsable;
      }
      if (newStatut === "annule") {
        return isResponsable;
      }
      return false;
    }

    case "en_attente_prestataire": {
      if (newStatut === "en_attente_client") {
        return isPrestataireSide && isResponsable;
      }
      if (newStatut === "a_valider") {
        return isPrestataireSide && isResponsable;
      }
      if (newStatut === "annule") {
        return isResponsable;
      }
      return false;
    }

    case "en_attente_client": {
      if (newStatut === "en_attente_prestataire") {
        // Client répond, balle retourne chez prestataire
        return isClientSide && isResponsable;
      }
      if (newStatut === "a_valider") {
        return isPrestataireSide && isResponsable;
      }
      if (newStatut === "annule") {
        return isResponsable;
      }
      return false;
    }

    case "a_valider": {
      if (newStatut === "clos") {
        // Seul le client valide et clôt
        return isClientSide && isResponsable;
      }
      if (newStatut === "annule") {
        return isResponsable;
      }
      return false;
    }

    default:
      return false;
  }
}
