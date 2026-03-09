import "server-only";

import { db } from "@/db";
import { clientPrestataireRelations } from "@/db/schema/entreprises";
import { sites } from "@/db/schema/sites";
import { getUserPrestataireSiteRole } from "@/server/queries/userPrestataireSiteAttributions.query";
import {
  getUserClientAdhesion,
  getUserPrestataireAdhesion,
} from "@/server/queries/userAdhesions.query";
import { getEffectivePlateformeRole } from "@/server/utils/permissions.utils";
import { resolvePostureAwareSiteRole } from "@/server/utils/permissions.utils";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";

type DbOrTransactionType =
  | typeof db
  | Parameters<Parameters<typeof db.transaction>[0]>[0];

// Hiérarchie des rôles site pour permissions
const ROLE_HIERARCHY = {
  responsable_site: 3,
  demandeur_site: 2,
  observateur_site: 1,
  intervenant_site: 0,
} as const;

const ALL_STATUTS = [
  "nouveau",
  "pris_en_charge",
  "en_attente_prestataire",
  "en_attente_client",
  "a_valider",
  "clos",
  "annule",
  "rejete",
] as const;

/**
 * Helper: vérifie si l'utilisateur est admin de son entreprise (bypass rôle site).
 *
 * Pattern identique à canManageOccurrence / canExecuteOccurrence :
 * admin entreprise → accès sans restriction de site attribution.
 */
async function isTicketsEnterpriseAdmin(
  userId: string,
  entrepriseId: string,
): Promise<boolean> {
  const cookieStore = await cookies();
  const posture = cookieStore.get("fm4all:postureActive")?.value;

  if (posture === "prestataire") {
    const adhesion = await getUserPrestataireAdhesion({ userId });
    return adhesion?.role === "admin";
  }

  // client (défaut)
  const adhesion = await getUserClientAdhesion({ userId, entrepriseId });
  return adhesion?.role === "admin";
}

/**
 * Vérifie si un utilisateur peut créer un ticket sur un site
 *
 * Règle métier:
 * - Plateforme: ✅ OUI
 * - Client admin: ✅ OUI (tous les sites de son entreprise)
 * - Client responsable_site / demandeur_site (≥ 2): ✅ OUI sur ses sites
 * - Prestataire admin: ✅ OUI sur n'importe quel site client lié
 * - Prestataire responsable_site / demandeur_site (≥ 2): ✅ OUI sur ses sites liés
 * - observateur_site / intervenant_site: ❌ NON
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
  tx?: DbOrTransactionType;
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

    // Admin prestataire → accès à tous les sites liés
    const prestataireAdhesion = await getUserPrestataireAdhesion({ userId });
    if (prestataireAdhesion?.role === "admin") return true;

    // Non-admin : vérifier rôle prestataire sur le site ≥ demandeur_site
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
  // Admin client → accès à tous les sites de son entreprise
  const clientAdhesion = await getUserClientAdhesion({ userId, entrepriseId });
  if (clientAdhesion?.role === "admin") return true;

  // Non-admin : vérifier rôle site ≥ demandeur_site
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
 * - Champs assignation: responsable_site ou admin (niveau ≥ 3)
 * - Autres champs: demandeur_site, responsable_site ou admin (niveau ≥ 2)
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
  tx?: DbOrTransactionType;
}): Promise<boolean> {
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) return true;

  const { getTicketById } = await import("@/server/queries/tickets.query");
  const ticket = await getTicketById(ticketId);
  if (!ticket) return false;

  const hasAssignFields =
    "assigneEntrepriseId" in updateData || "assigneUserId" in updateData;

  const effectiveRoleStr = await resolvePostureAwareSiteRole({
    userId,
    siteId: ticket.siteId,
    entrepriseId: ticket.proprietaireEntrepriseId,
  });

  const userLevel =
    effectiveRoleStr && effectiveRoleStr in ROLE_HIERARCHY
      ? ROLE_HIERARCHY[effectiveRoleStr as keyof typeof ROLE_HIERARCHY]
      : -1;

  const requiredLevel = hasAssignFields ? 3 : 2;
  if (userLevel >= requiredLevel) return true;

  // Fallback: admin entreprise
  return await isTicketsEnterpriseAdmin(userId, entrepriseId);
}

/**
 * Vérifie si l'utilisateur peut éditer le titre et la description du ticket
 * (niveau ≥ 2 — demandeur_site, responsable_site ou admin entreprise)
 *
 * - Plateforme: ✅
 * - Admin entreprise: ✅ (tous les tickets impliquant son entreprise)
 * - responsable_site / demandeur_site: ✅
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
  tx?: DbOrTransactionType;
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

  const userLevel =
    effectiveRoleStr && effectiveRoleStr in ROLE_HIERARCHY
      ? ROLE_HIERARCHY[effectiveRoleStr as keyof typeof ROLE_HIERARCHY]
      : -1;

  if (userLevel >= 2) return true;

  // Fallback: admin entreprise (bypass site restrictions)
  return await isTicketsEnterpriseAdmin(userId, entrepriseId);
}

/**
 * Vérifie si l'utilisateur peut éditer le type et la priorité du ticket
 * (niveau ≥ 3 — responsable_site ou admin entreprise)
 *
 * - Plateforme: ✅
 * - Admin entreprise: ✅
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
  tx?: DbOrTransactionType;
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

  const userLevel =
    effectiveRoleStr && effectiveRoleStr in ROLE_HIERARCHY
      ? ROLE_HIERARCHY[effectiveRoleStr as keyof typeof ROLE_HIERARCHY]
      : -1;

  if (userLevel >= 3) return true;

  // Fallback: admin entreprise
  return await isTicketsEnterpriseAdmin(userId, entrepriseId);
}

/**
 * Vérifie si l'utilisateur peut modifier assigneEntrepriseId
 *
 * - Plateforme: ✅ (tous les prestataires)
 * - Client admin ou responsable_site (niveau ≥ 3): ✅ (leurs prestataires uniquement)
 * - Prestataire: ❌ (le client choisit son prestataire)
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
  tx?: DbOrTransactionType;
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

  const userLevel =
    effectiveRoleStr && effectiveRoleStr in ROLE_HIERARCHY
      ? ROLE_HIERARCHY[effectiveRoleStr as keyof typeof ROLE_HIERARCHY]
      : -1;

  if (userLevel >= 3) return true;

  // Fallback: admin client
  return await isTicketsEnterpriseAdmin(userId, entrepriseId);
}

/**
 * Vérifie si l'utilisateur peut modifier assigneUserId
 *
 * - Plateforme: ✅
 * - Admin entreprise: ✅
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
  tx?: DbOrTransactionType;
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

  const userLevel =
    effectiveRoleStr && effectiveRoleStr in ROLE_HIERARCHY
      ? ROLE_HIERARCHY[effectiveRoleStr as keyof typeof ROLE_HIERARCHY]
      : -1;

  if (userLevel >= 3) return true;

  // Fallback: admin entreprise
  return await isTicketsEnterpriseAdmin(userId, entrepriseId);
}

/**
 * Vérifie si l'utilisateur peut modifier le statut du ticket
 *
 * - Plateforme: ✅
 * - Admin entreprise: ✅
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
  tx?: DbOrTransactionType;
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

  const userLevel =
    effectiveRoleStr && effectiveRoleStr in ROLE_HIERARCHY
      ? ROLE_HIERARCHY[effectiveRoleStr as keyof typeof ROLE_HIERARCHY]
      : -1;

  if (userLevel >= 3) return true;

  // Fallback: admin entreprise
  return await isTicketsEnterpriseAdmin(userId, entrepriseId);
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
  tx?: DbOrTransactionType;
}): Promise<string[]> {
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) return [...ALL_STATUTS];

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

  const userLevel =
    effectiveRoleStr && effectiveRoleStr in ROLE_HIERARCHY
      ? ROLE_HIERARCHY[effectiveRoleStr as keyof typeof ROLE_HIERARCHY]
      : -1;

  if (userLevel >= 3) return [...ALL_STATUTS];

  // Fallback: admin entreprise
  if (await isTicketsEnterpriseAdmin(userId, entrepriseId)) return [...ALL_STATUTS];

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
  tx?: DbOrTransactionType;
}): Promise<boolean> {
  return canUserEditAssigneEntrepriseId({
    userId,
    ticketId,
    entrepriseId,
    tx,
  });
}
