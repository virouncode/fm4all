import "server-only";

import { db } from "@/db";
import { getEffectivePlateformeRole } from "@/server/utils/permissions.utils";
import { resolvePostureAwareSiteRole } from "@/server/utils/permissions.utils";

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
 * - demandeur_site: ✅ OUI (niveau 2, client uniquement)
 * - observateur_site: ❌ NON (niveau 1)
 * - intervenant_site: ❌ NON (niveau 0)
 *
 * @param userId - ID de l'utilisateur
 * @param siteId - ID du site
 * @param entrepriseId - ID de l'entreprise (client propriétaire du site)
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
  // Vérifier si plateforme (posture-aware)
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) {
    return true;
  }

  // Récupérer rôle effectif sur le site (posture-aware)
  // entrepriseId = entreprise cliente propriétaire du site
  const effectiveRoleStr = await resolvePostureAwareSiteRole({
    userId,
    siteId,
    entrepriseId,
  });

  if (!effectiveRoleStr || !(effectiveRoleStr in ROLE_HIERARCHY)) return false;

  // Peut créer si rôle ≥ demandeur_site (niveau 2)
  const userLevel =
    ROLE_HIERARCHY[effectiveRoleStr as keyof typeof ROLE_HIERARCHY];
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
 * @param entrepriseId - ID de l'entreprise courante
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
  // Vérifier si plateforme (posture-aware)
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) {
    return true; // Plateforme peut tout modifier
  }

  // Récupérer le ticket
  const { getTicketById } = await import("@/server/queries/tickets.query");
  const ticket = await getTicketById(ticketId);
  if (!ticket) return false;

  // Récupérer rôle effectif sur le site du ticket (posture-aware)
  // Toujours utiliser ticket.proprietaireEntrepriseId pour la lookup de site
  const effectiveRoleStr = await resolvePostureAwareSiteRole({
    userId,
    siteId: ticket.siteId,
    entrepriseId: ticket.proprietaireEntrepriseId,
  });

  if (!effectiveRoleStr || !(effectiveRoleStr in ROLE_HIERARCHY)) return false;

  const userLevel =
    ROLE_HIERARCHY[effectiveRoleStr as keyof typeof ROLE_HIERARCHY];

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
 * @param entrepriseId - ID de l'entreprise courante
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
  // Vérifier si plateforme (posture-aware)
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) {
    return true;
  }

  // Récupérer le ticket
  const { getTicketById } = await import("@/server/queries/tickets.query");
  const ticket = await getTicketById(ticketId);
  if (!ticket) return false;

  // Récupérer rôle effectif sur le site du ticket (posture-aware)
  const effectiveRoleStr = await resolvePostureAwareSiteRole({
    userId,
    siteId: ticket.siteId,
    entrepriseId: ticket.proprietaireEntrepriseId,
  });

  // Peut assigner si responsable_site
  return effectiveRoleStr === "responsable_site";
}

/**
 * NOUVELLES PERMISSIONS - Ticket Details Page
 * Basées sur la matrice de permissions 2026-02-24
 */

/**
 * Vérifie si l'utilisateur peut éditer les champs de base du ticket
 * (titre, description, type, priorite)
 *
 * Règles:
 * - Plateforme: ✅ OUI
 * - Client (demandeur_site ou responsable_site): ✅ OUI
 * - Prestataire: ❌ NON
 */
export async function canUserEditTicketBasicFields({
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
  // Vérifier si plateforme (posture-aware)
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) {
    return true;
  }

  // Récupérer le ticket
  const { getTicketById } = await import("@/server/queries/tickets.query");
  const ticket = await getTicketById(ticketId);
  if (!ticket) return false;

  // Vérifier que c'est un client (pas un prestataire)
  // Si l'entreprise courante est le proprietaire ou demandeur = client
  if (
    ticket.proprietaireEntrepriseId !== entrepriseId &&
    ticket.demandeurEntrepriseId !== entrepriseId
  ) {
    return false; // Pas un client de ce ticket (prestataire → NON)
  }

  // Récupérer rôle effectif sur le site (posture-aware)
  const effectiveRoleStr = await resolvePostureAwareSiteRole({
    userId,
    siteId: ticket.siteId,
    entrepriseId: ticket.proprietaireEntrepriseId,
  });

  if (!effectiveRoleStr || !(effectiveRoleStr in ROLE_HIERARCHY)) return false;

  const userLevel =
    ROLE_HIERARCHY[effectiveRoleStr as keyof typeof ROLE_HIERARCHY];
  return userLevel >= 2; // demandeur_site (2) ou responsable_site (3)
}

/**
 * Vérifie si l'utilisateur peut modifier assigneEntrepriseId
 *
 * Règles:
 * - Plateforme: ✅ OUI (tous les prestataires)
 * - Client (demandeur_site ou responsable_site): ✅ OUI (leurs prestataires uniquement)
 * - Prestataire: ❌ NON
 */
export async function canUserEditAssigneEntrepriseId({
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
  // Vérifier si plateforme (posture-aware)
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) {
    return true;
  }

  // Récupérer le ticket
  const { getTicketById } = await import("@/server/queries/tickets.query");
  const ticket = await getTicketById(ticketId);
  if (!ticket) return false;

  // Vérifier que c'est un client
  if (
    ticket.proprietaireEntrepriseId !== entrepriseId &&
    ticket.demandeurEntrepriseId !== entrepriseId
  ) {
    return false;
  }

  // Récupérer rôle effectif sur le site (posture-aware)
  const effectiveRoleStr = await resolvePostureAwareSiteRole({
    userId,
    siteId: ticket.siteId,
    entrepriseId: ticket.proprietaireEntrepriseId,
  });

  if (!effectiveRoleStr || !(effectiveRoleStr in ROLE_HIERARCHY)) return false;

  const userLevel =
    ROLE_HIERARCHY[effectiveRoleStr as keyof typeof ROLE_HIERARCHY];
  return userLevel >= 2; // demandeur_site ou responsable_site
}

/**
 * Vérifie si l'utilisateur peut modifier assigneUserId
 *
 * Règles:
 * - Plateforme (super_admin_plateforme, operateur_plateforme): ✅ OUI
 * - Client (proprietaire ou demandeur) avec role >= demandeur_site: ✅ OUI
 * - Prestataire / autres: ❌ NON
 */
export async function canUserEditAssigneUserId({
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
  // Vérifier si plateforme (posture-aware)
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) {
    return true;
  }

  // Récupérer le ticket
  const { getTicketById } = await import("@/server/queries/tickets.query");
  const ticket = await getTicketById(ticketId);
  if (!ticket) return false;

  // Vérifier que l'entreprise courante est bien le propriétaire ou le demandeur (côté client)
  if (
    ticket.proprietaireEntrepriseId !== entrepriseId &&
    ticket.demandeurEntrepriseId !== entrepriseId
  ) {
    return false;
  }

  // Récupérer le rôle effectif sur le site du ticket (posture-aware)
  const effectiveRoleStr = await resolvePostureAwareSiteRole({
    userId,
    siteId: ticket.siteId,
    entrepriseId: ticket.proprietaireEntrepriseId,
  });

  if (!effectiveRoleStr || !(effectiveRoleStr in ROLE_HIERARCHY)) return false;

  const userLevel =
    ROLE_HIERARCHY[effectiveRoleStr as keyof typeof ROLE_HIERARCHY];
  // Requiert au minimum demandeur_site (niveau 2) ou responsable_site (niveau 3)
  return userLevel >= 2;
}

/**
 * Vérifie si l'utilisateur peut modifier le statut du ticket
 *
 * Règles:
 * - Plateforme: ✅ OUI (tous les statuts)
 * - Client: ✅ OUI (tous les statuts, pour autonomie)
 * - Prestataire: ✅ OUI (sous-ensemble: pris_en_charge, en_attente_client, a_valider, rejete)
 */
export async function canUserEditStatut({
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
  // Vérifier si plateforme (posture-aware)
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) {
    return true;
  }

  // Récupérer le ticket
  const { getTicketById } = await import("@/server/queries/tickets.query");
  const ticket = await getTicketById(ticketId);
  if (!ticket) return false;

  // Client (proprietaire ou demandeur)
  if (
    ticket.proprietaireEntrepriseId === entrepriseId ||
    ticket.demandeurEntrepriseId === entrepriseId
  ) {
    // Vérifier rôle sur le site (posture-aware)
    const effectiveRoleStr = await resolvePostureAwareSiteRole({
      userId,
      siteId: ticket.siteId,
      entrepriseId: ticket.proprietaireEntrepriseId,
    });

    if (!effectiveRoleStr || !(effectiveRoleStr in ROLE_HIERARCHY))
      return false;

    const userLevel =
      ROLE_HIERARCHY[effectiveRoleStr as keyof typeof ROLE_HIERARCHY];
    return userLevel >= 2; // Client peut si demandeur_site ou +
  }

  // Prestataire (assigné à ce ticket)
  if (ticket.assigneEntrepriseId === entrepriseId) {
    // Le prestataire assigné peut modifier le statut (sous-ensemble dans getAvailableStatutsForUser)
    return true;
  }

  return false;
}

/**
 * Retourne les statuts disponibles pour un utilisateur sur un ticket
 *
 * @param userId - ID de l'utilisateur
 * @param ticketId - ID du ticket
 * @param entrepriseId - ID de l'entreprise courante
 * @returns Array des statuts possibles
 */
export async function getAvailableStatutsForUser({
  userId,
  ticketId,
  entrepriseId,
  tx,
}: {
  userId: string;
  ticketId: string;
  entrepriseId: string;
  tx?: DbOrTransaction;
}): Promise<string[]> {
  // Vérifier si plateforme (posture-aware)
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) {
    // Plateforme: tous les statuts
    return [
      "nouveau",
      "pris_en_charge",
      "en_attente_prestataire",
      "en_attente_client",
      "a_valider",
      "clos",
      "annule",
      "rejete",
    ];
  }

  // Récupérer le ticket
  const { getTicketById } = await import("@/server/queries/tickets.query");
  const ticket = await getTicketById(ticketId);
  if (!ticket) return [];

  // Client
  if (
    ticket.proprietaireEntrepriseId === entrepriseId ||
    ticket.demandeurEntrepriseId === entrepriseId
  ) {
    const effectiveRoleStr = await resolvePostureAwareSiteRole({
      userId,
      siteId: ticket.siteId,
      entrepriseId: ticket.proprietaireEntrepriseId,
    });

    if (!effectiveRoleStr || !(effectiveRoleStr in ROLE_HIERARCHY)) return [];

    const userLevel =
      ROLE_HIERARCHY[effectiveRoleStr as keyof typeof ROLE_HIERARCHY];
    if (userLevel >= 2) {
      // Client: tous les statuts (pour autonomie)
      return [
        "nouveau",
        "pris_en_charge",
        "en_attente_prestataire",
        "en_attente_client",
        "a_valider",
        "clos",
        "annule",
        "rejete",
      ];
    }
  }

  // Prestataire (assigné)
  if (ticket.assigneEntrepriseId === entrepriseId) {
    // Prestataire: sous-ensemble
    return ["pris_en_charge", "en_attente_client", "a_valider", "rejete"];
  }

  return [];
}
