import "server-only";

import { db } from "@/db";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import { resolveUserEffectiveRoleOnSite } from "@/server/utils/userSiteAttributions.utils";

type DbOrTransaction =
  | typeof db
  | Parameters<Parameters<typeof db.transaction>[0]>[0];

// Hiérarchie des rôles site pour permissions
const ROLE_HIERARCHY = {
  responsable_site: 3,
  demandeur_site: 2,
  observateur_site: 1,
  intervenant_site: 0,
} as const;

/**
 * Vérifie si un utilisateur peut créer un ticket sur un site
 *
 * Règle métier:
 * - Plateforme (operateur/super_admin): ✅ OUI
 * - responsable_site: ✅ OUI (niveau 3)
 * - demandeur_site: ✅ OUI (niveau 2)
 * - observateur_site: ❌ NON (niveau 1)
 * - intervenant_site: ❌ NON (niveau 0)
 *
 * @param userId - ID de l'utilisateur
 * @param siteId - ID du site
 * @param entrepriseId - ID de l'entreprise
 * @param tx - Transaction optionnelle
 * @returns true si l'utilisateur peut créer un ticket
 */
export async function canUserCreateTicket({
  userId,
  siteId,
  entrepriseId,
  tx,
}: {
  userId: string;
  siteId: string;
  entrepriseId: string;
  tx?: DbOrTransaction;
}): Promise<boolean> {
  // Vérifier si plateforme
  const platformRole = await getUserPlateformeAdhesion(userId);
  if (
    platformRole?.role === "super_admin_plateforme" ||
    platformRole?.role === "operateur_plateforme"
  ) {
    return true;
  }

  // Récupérer rôle effectif sur le site
  const effectiveRole = await resolveUserEffectiveRoleOnSite({
    userId,
    siteId,
    entrepriseId,
    tx,
  });

  if (!effectiveRole) return false;

  // Peut créer si rôle ≥ demandeur_site (niveau 2)
  const userLevel = ROLE_HIERARCHY[effectiveRole];
  return userLevel >= 2;
}

/**
 * Vérifie si un utilisateur peut mettre à jour un ticket
 *
 * Règle métier:
 * - Plateforme: ✅ OUI (tout)
 * - Champs généraux (titre, description, type, priorite):
 *   - demandeur_site ou + (niveau ≥ 2)
 * - Assignation (assigneEntrepriseId, assigneUserId):
 *   - responsable_site ou plateforme (niveau ≥ 3)
 *
 * @param userId - ID de l'utilisateur
 * @param ticketId - ID du ticket
 * @param entrepriseId - ID de l'entreprise
 * @param updateData - Données à mettre à jour
 * @param tx - Transaction optionnelle
 * @returns true si l'utilisateur peut mettre à jour
 */
export async function canUserUpdateTicket({
  userId,
  ticketId,
  entrepriseId,
  updateData,
  tx,
}: {
  userId: string;
  ticketId: string;
  entrepriseId: string;
  updateData: any;
  tx?: DbOrTransaction;
}): Promise<boolean> {
  // Vérifier si plateforme
  const platformRole = await getUserPlateformeAdhesion(userId);
  if (
    platformRole?.role === "super_admin_plateforme" ||
    platformRole?.role === "operateur_plateforme"
  ) {
    return true; // Plateforme peut tout modifier
  }

  // Récupérer le ticket
  const { getTicketById } = await import("@/server/queries/tickets.query");
  const ticket = await getTicketById(ticketId);
  if (!ticket) return false;

  // Récupérer rôle effectif sur le site du ticket
  const effectiveRole = await resolveUserEffectiveRoleOnSite({
    userId,
    siteId: ticket.siteId,
    entrepriseId,
    tx,
  });

  if (!effectiveRole) return false;

  const userLevel = ROLE_HIERARCHY[effectiveRole];

  // Vérifier selon les champs modifiés
  const hasAssignFields =
    "assigneEntrepriseId" in updateData || "assigneUserId" in updateData;

  if (hasAssignFields) {
    // Assignation requiert responsable_site (niveau 3) ou plateforme
    return userLevel >= 3;
  }

  // Champs généraux: demandeur_site ou + (niveau 2)
  return userLevel >= 2;
}

/**
 * Vérifie si un utilisateur peut assigner un ticket
 *
 * Règle métier:
 * - Plateforme (operateur/super_admin): ✅ OUI
 * - responsable_site: ✅ OUI
 * - Autres: ❌ NON
 *
 * @param userId - ID de l'utilisateur
 * @param ticketId - ID du ticket
 * @param entrepriseId - ID de l'entreprise
 * @param tx - Transaction optionnelle
 * @returns true si l'utilisateur peut assigner
 */
export async function canUserAssignTicket({
  userId,
  ticketId,
  entrepriseId,
  tx,
}: {
  userId: string;
  ticketId: string;
  entrepriseId: string;
  tx?: DbOrTransaction;
}): Promise<boolean> {
  // Vérifier si plateforme
  const platformRole = await getUserPlateformeAdhesion(userId);
  if (
    platformRole?.role === "super_admin_plateforme" ||
    platformRole?.role === "operateur_plateforme"
  ) {
    return true;
  }

  // Récupérer le ticket
  const { getTicketById } = await import("@/server/queries/tickets.query");
  const ticket = await getTicketById(ticketId);
  if (!ticket) return false;

  // Récupérer rôle effectif sur le site du ticket
  const effectiveRole = await resolveUserEffectiveRoleOnSite({
    userId,
    siteId: ticket.siteId,
    entrepriseId,
    tx,
  });

  // Peut assigner si responsable_site
  return effectiveRole === "responsable_site";
}
