import "server-only";

import { db } from "@/db";
import { clientPrestataireRelations } from "@/db/schema/entreprises";
import { sites } from "@/db/schema/sites";
import { getUserPrestataireSiteRole } from "@/server/queries/userPrestataireSiteAttributions.query";
import { getEffectivePlateformeRole } from "@/server/utils/permissions.utils";
import { resolvePostureAwareSiteRole } from "@/server/utils/permissions.utils";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";

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
 * - Plateforme: ✅ OUI
 * - Client (responsable_site, demandeur_site ≥ 2): ✅ OUI
 * - Prestataire: ✅ OUI si relation client-prestataire + rôle site ≥ demandeur_site
 * - observateur_site / intervenant_site: ❌ NON
 *
 * @param userId - ID de l'utilisateur
 * @param siteId - ID du site
 * @param entrepriseId - ID de l'entreprise courante (client ou prestataire selon posture)
 * @param tx - Transaction optionnelle
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
  // Plateforme → accès total
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) return true;

  const cookieStore = await cookies();
  const posture = cookieStore.get("fm4all:postureActive")?.value;

  // Branche prestataire
  if (posture === "prestataire") {
    const dbClient = tx || db;

    // Récupérer le site pour avoir le client propriétaire
    const site = await dbClient.query.sites.findFirst({
      where: eq(sites.id, siteId),
      columns: { entrepriseId: true },
    });
    if (!site) return false;

    const clientEntrepriseId = site.entrepriseId;

    // Vérifier relation client-prestataire
    const relation = await dbClient.query.clientPrestataireRelations.findFirst({
      where: and(
        eq(clientPrestataireRelations.clientEntrepriseId, clientEntrepriseId),
        eq(
          clientPrestataireRelations.prestataireEntrepriseId,
          entrepriseId, // entrepriseId = prestataire ici
        ),
      ),
      columns: { id: true },
    });
    if (!relation) return false;

    // Vérifier rôle prestataire sur le site ≥ demandeur_site
    const siteRole = await getUserPrestataireSiteRole({
      userId,
      siteId,
      clientEntrepriseId,
    });
    if (!siteRole) return false;

    const userLevel = ROLE_HIERARCHY[siteRole as keyof typeof ROLE_HIERARCHY];
    return userLevel >= 2;
  }

  // Branche client (défaut)
  const effectiveRoleStr = await resolvePostureAwareSiteRole({
    userId,
    siteId,
    entrepriseId,
  });

  if (!effectiveRoleStr || !(effectiveRoleStr in ROLE_HIERARCHY)) return false;

  const userLevel =
    ROLE_HIERARCHY[effectiveRoleStr as keyof typeof ROLE_HIERARCHY];
  return userLevel >= 2;
}

/**
 * Vérifie si un utilisateur peut mettre à jour un ticket (champs de base)
 *
 * - Plateforme: ✅ (tout)
 * - Champs assignation: responsable_site (niveau ≥ 3)
 * - Autres champs: demandeur_site ou + (niveau ≥ 2)
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
  updateData: Record<string, unknown>;
  tx?: DbOrTransaction;
}): Promise<boolean> {
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) return true;

  const { getTicketById } = await import("@/server/queries/tickets.query");
  const ticket = await getTicketById(ticketId);
  if (!ticket) return false;

  const effectiveRoleStr = await resolvePostureAwareSiteRole({
    userId,
    siteId: ticket.siteId,
    entrepriseId: ticket.proprietaireEntrepriseId,
  });

  if (!effectiveRoleStr || !(effectiveRoleStr in ROLE_HIERARCHY)) return false;

  const userLevel =
    ROLE_HIERARCHY[effectiveRoleStr as keyof typeof ROLE_HIERARCHY];

  const hasAssignFields =
    "assigneEntrepriseId" in updateData || "assigneUserId" in updateData;

  if (hasAssignFields) return userLevel >= 3;
  return userLevel >= 2;
}

/**
 * Vérifie si l'utilisateur peut éditer le titre et la description du ticket
 * (niveau ≥ 2 — demandeur_site ou supérieur, des deux côtés)
 *
 * - Plateforme: ✅
 * - responsable_site / demandeur_site (client ou prestataire): ✅
 * - observateur_site / intervenant_site: ❌
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
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) return true;

  const { getTicketById } = await import("@/server/queries/tickets.query");
  const ticket = await getTicketById(ticketId);
  if (!ticket) return false;

  const isInvolved =
    ticket.proprietaireEntrepriseId === entrepriseId ||
    ticket.demandeurEntrepriseId === entrepriseId ||
    ticket.assigneEntrepriseId === entrepriseId;

  if (!isInvolved) return false;

  const effectiveRoleStr = await resolvePostureAwareSiteRole({
    userId,
    siteId: ticket.siteId,
    entrepriseId: ticket.proprietaireEntrepriseId,
  });

  if (!effectiveRoleStr || !(effectiveRoleStr in ROLE_HIERARCHY)) return false;

  const userLevel =
    ROLE_HIERARCHY[effectiveRoleStr as keyof typeof ROLE_HIERARCHY];
  return userLevel >= 2;
}

/**
 * Vérifie si l'utilisateur peut éditer le type et la priorité du ticket
 * (niveau ≥ 3 — responsable_site uniquement)
 *
 * - Plateforme: ✅
 * - responsable_site: ✅
 * - demandeur_site et inférieurs: ❌
 */
export async function canUserEditTypeAndPriorite({
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
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) return true;

  const { getTicketById } = await import("@/server/queries/tickets.query");
  const ticket = await getTicketById(ticketId);
  if (!ticket) return false;

  const isInvolved =
    ticket.proprietaireEntrepriseId === entrepriseId ||
    ticket.demandeurEntrepriseId === entrepriseId ||
    ticket.assigneEntrepriseId === entrepriseId;

  if (!isInvolved) return false;

  const effectiveRoleStr = await resolvePostureAwareSiteRole({
    userId,
    siteId: ticket.siteId,
    entrepriseId: ticket.proprietaireEntrepriseId,
  });

  if (!effectiveRoleStr || !(effectiveRoleStr in ROLE_HIERARCHY)) return false;

  const userLevel =
    ROLE_HIERARCHY[effectiveRoleStr as keyof typeof ROLE_HIERARCHY];
  return userLevel >= 3;
}

/**
 * Vérifie si l'utilisateur peut modifier assigneEntrepriseId
 *
 * - Plateforme: ✅ (tous les prestataires)
 * - Client responsable_site (niveau ≥ 3): ✅ (leurs prestataires uniquement)
 * - Prestataire: ❌
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
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) return true;

  const { getTicketById } = await import("@/server/queries/tickets.query");
  const ticket = await getTicketById(ticketId);
  if (!ticket) return false;

  // Seul le côté client peut changer le prestataire assigné
  if (
    ticket.proprietaireEntrepriseId !== entrepriseId &&
    ticket.demandeurEntrepriseId !== entrepriseId
  ) {
    return false;
  }

  const effectiveRoleStr = await resolvePostureAwareSiteRole({
    userId,
    siteId: ticket.siteId,
    entrepriseId: ticket.proprietaireEntrepriseId,
  });

  if (!effectiveRoleStr || !(effectiveRoleStr in ROLE_HIERARCHY)) return false;

  const userLevel =
    ROLE_HIERARCHY[effectiveRoleStr as keyof typeof ROLE_HIERARCHY];
  return userLevel >= 3;
}

/**
 * Vérifie si l'utilisateur peut modifier assigneUserId
 *
 * - Plateforme: ✅
 * - responsable_site (client ou prestataire assigné): ✅
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
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) return true;

  const { getTicketById } = await import("@/server/queries/tickets.query");
  const ticket = await getTicketById(ticketId);
  if (!ticket) return false;

  const isInvolved =
    ticket.proprietaireEntrepriseId === entrepriseId ||
    ticket.demandeurEntrepriseId === entrepriseId ||
    ticket.assigneEntrepriseId === entrepriseId;

  if (!isInvolved) return false;

  const effectiveRoleStr = await resolvePostureAwareSiteRole({
    userId,
    siteId: ticket.siteId,
    entrepriseId: ticket.proprietaireEntrepriseId,
  });

  if (!effectiveRoleStr || !(effectiveRoleStr in ROLE_HIERARCHY)) return false;

  const userLevel =
    ROLE_HIERARCHY[effectiveRoleStr as keyof typeof ROLE_HIERARCHY];
  return userLevel >= 3;
}

/**
 * Vérifie si l'utilisateur peut modifier le statut du ticket
 *
 * - Plateforme: ✅
 * - responsable_site (niveau ≥ 3) des deux côtés: ✅
 * - demandeur_site et inférieurs: ❌
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
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) return true;

  const { getTicketById } = await import("@/server/queries/tickets.query");
  const ticket = await getTicketById(ticketId);
  if (!ticket) return false;

  const isInvolved =
    ticket.proprietaireEntrepriseId === entrepriseId ||
    ticket.demandeurEntrepriseId === entrepriseId ||
    ticket.assigneEntrepriseId === entrepriseId;

  if (!isInvolved) return false;

  const effectiveRoleStr = await resolvePostureAwareSiteRole({
    userId,
    siteId: ticket.siteId,
    entrepriseId: ticket.proprietaireEntrepriseId,
  });

  if (!effectiveRoleStr || !(effectiveRoleStr in ROLE_HIERARCHY)) return false;

  const userLevel =
    ROLE_HIERARCHY[effectiveRoleStr as keyof typeof ROLE_HIERARCHY];
  return userLevel >= 3;
}

/**
 * Retourne les statuts disponibles pour un utilisateur sur un ticket.
 *
 * Retourne le superset des statuts accessibles (niveau permission).
 * La machine d'état dans isStatusTransitionAllowed valide la transition exacte.
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
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) {
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

  const { getTicketById } = await import("@/server/queries/tickets.query");
  const ticket = await getTicketById(ticketId);
  if (!ticket) return [];

  const isInvolved =
    ticket.proprietaireEntrepriseId === entrepriseId ||
    ticket.demandeurEntrepriseId === entrepriseId ||
    ticket.assigneEntrepriseId === entrepriseId;

  if (!isInvolved) return [];

  const effectiveRoleStr = await resolvePostureAwareSiteRole({
    userId,
    siteId: ticket.siteId,
    entrepriseId: ticket.proprietaireEntrepriseId,
  });

  if (!effectiveRoleStr || !(effectiveRoleStr in ROLE_HIERARCHY)) return [];

  const userLevel =
    ROLE_HIERARCHY[effectiveRoleStr as keyof typeof ROLE_HIERARCHY];

  if (userLevel >= 3) {
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

  return [];
}

/**
 * Vérifie si l'utilisateur peut assigner un ticket
 * Alias de canUserEditAssigneEntrepriseId
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
  return canUserEditAssigneEntrepriseId({
    userId,
    ticketId,
    entrepriseId,
    tx,
  });
}
