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

  // Vérifier que c'est un client (pas un prestataire)
  // Si l'entreprise courante est le proprietaire ou demandeur = client
  if (
    ticket.proprietaireEntrepriseId !== entrepriseId &&
    ticket.demandeurEntrepriseId !== entrepriseId
  ) {
    return false; // Pas un client de ce ticket
  }

  // Récupérer rôle effectif sur le site
  const effectiveRole = await resolveUserEffectiveRoleOnSite({
    userId,
    siteId: ticket.siteId,
    entrepriseId,
    tx,
  });

  if (!effectiveRole) return false;

  const userLevel = ROLE_HIERARCHY[effectiveRole];
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

  // Vérifier que c'est un client
  if (
    ticket.proprietaireEntrepriseId !== entrepriseId &&
    ticket.demandeurEntrepriseId !== entrepriseId
  ) {
    return false;
  }

  // Récupérer rôle effectif sur le site
  const effectiveRole = await resolveUserEffectiveRoleOnSite({
    userId,
    siteId: ticket.siteId,
    entrepriseId,
    tx,
  });

  if (!effectiveRole) return false;

  const userLevel = ROLE_HIERARCHY[effectiveRole];
  return userLevel >= 2; // demandeur_site ou responsable_site
}

/**
 * Vérifie si l'utilisateur peut modifier assigneUserId
 *
 * Règles:
 * - UNIQUEMENT prestataire si le ticket est assigné à leur entreprise
 * - Plateforme: ❌ NON
 * - Client: ❌ NON
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
  // Récupérer le ticket
  const { getTicketById } = await import("@/server/queries/tickets.query");
  const ticket = await getTicketById(ticketId);
  if (!ticket) return false;

  // Le ticket doit être assigné à l'entreprise courante
  if (ticket.assigneEntrepriseId !== entrepriseId) {
    return false;
  }

  // L'utilisateur doit avoir un rôle dans cette entreprise prestataire
  const { getUserAdhesion } = await import(
    "@/server/queries/userAdhesions.query"
  );
  const adhesion = await getUserAdhesion({ userId, entrepriseId });

  return !!adhesion; // Si adhesion existe, il peut assigner
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

  // Client (proprietaire ou demandeur)
  if (
    ticket.proprietaireEntrepriseId === entrepriseId ||
    ticket.demandeurEntrepriseId === entrepriseId
  ) {
    // Vérifier rôle sur le site
    const effectiveRole = await resolveUserEffectiveRoleOnSite({
      userId,
      siteId: ticket.siteId,
      entrepriseId,
      tx,
    });

    if (!effectiveRole) return false;

    const userLevel = ROLE_HIERARCHY[effectiveRole];
    return userLevel >= 2; // Client peut si demandeur_site ou +
  }

  // Prestataire (assigné)
  if (ticket.assigneEntrepriseId === entrepriseId) {
    const { getUserAdhesion } = await import(
      "@/server/queries/userAdhesions.query"
    );
    const adhesion = await getUserAdhesion({ userId, entrepriseId });
    return !!adhesion;
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
  // Vérifier si plateforme
  const platformRole = await getUserPlateformeAdhesion(userId);
  if (
    platformRole?.role === "super_admin_plateforme" ||
    platformRole?.role === "operateur_plateforme"
  ) {
    // Plateforme: tous les statuts
    return [
      "nouveau",
      "pris_en_charge",
      "en_attente_fournisseur",
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
    const effectiveRole = await resolveUserEffectiveRoleOnSite({
      userId,
      siteId: ticket.siteId,
      entrepriseId,
      tx,
    });

    if (!effectiveRole) return [];

    const userLevel = ROLE_HIERARCHY[effectiveRole];
    if (userLevel >= 2) {
      // Client: tous les statuts (pour autonomie)
      return [
        "nouveau",
        "pris_en_charge",
        "en_attente_fournisseur",
        "en_attente_client",
        "a_valider",
        "clos",
        "annule",
        "rejete",
      ];
    }
  }

  // Prestataire
  if (ticket.assigneEntrepriseId === entrepriseId) {
    const { getUserAdhesion } = await import(
      "@/server/queries/userAdhesions.query"
    );
    const adhesion = await getUserAdhesion({ userId, entrepriseId });

    if (adhesion) {
      // Prestataire: sous-ensemble
      return ["pris_en_charge", "en_attente_client", "a_valider", "rejete"];
    }
  }

  return [];
}
