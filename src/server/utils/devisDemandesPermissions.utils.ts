import "server-only";

import { db } from "@/db";
import { devis, devisDemandes } from "@/db/schema/devis";
import { and, eq, inArray } from "drizzle-orm";
import { getUserClientAdhesion } from "@/server/queries/userAdhesions.query";
import { getAccessibleSitesByUser } from "@/server/queries/sites.query";
import {
  resolveUserEffectiveRoleOnSite,
  resolveUserEffectiveRolesOnSites,
} from "@/server/utils/userClientSiteAttributions.utils";

// ============================= TYPES ==============================//

export type DevisDemandePermissionsType = {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canChangeStatut: boolean;
};

// ============================= HELPERS ==============================//

/**
 * Retourne la liste des siteIds accessibles à l'utilisateur.
 *
 * - admin → null (pas de restriction — tous les sites de l'entreprise)
 * - autres → liste des siteIds attribués
 */
export async function getAccessibleSiteIdsForUser({
  userId,
  entrepriseId,
}: {
  userId: string;
  entrepriseId: string;
}): Promise<string[] | null> {
  const adhesion = await getUserClientAdhesion({ userId, entrepriseId });

  if (!adhesion) return [];

  // Admin voit tout
  if (adhesion.role === "admin") return null;

  // Non-admin : uniquement les sites attribués
  const sitesAccessibles = await getAccessibleSitesByUser({
    userId,
    entrepriseId,
  });

  return sitesAccessibles.map((s) => s.id);
}

/**
 * Retourne le rôle effectif de l'utilisateur sur une demande de devis donnée.
 *
 * - null si l'utilisateur n'a pas accès à la demande
 * - "admin" si l'utilisateur est admin de l'entreprise
 * - "responsable_site" | "demandeur_site" | "observateur_site" sinon
 */
async function getEffectiveRoleOnDemande({
  userId,
  devisDemandeId,
  entrepriseId,
}: {
  userId: string;
  devisDemandeId: string;
  entrepriseId: string;
}): Promise<"admin" | "responsable_site" | "demandeur_site" | "observateur_site" | null> {
  const adhesion = await getUserClientAdhesion({ userId, entrepriseId });
  if (!adhesion) return null;

  if (adhesion.role === "admin") return "admin";

  const demande = await db.query.devisDemandes.findFirst({
    where: eq(devisDemandes.id, devisDemandeId),
    columns: { siteId: true },
  });

  if (!demande) return null;

  const siteRole = await resolveUserEffectiveRoleOnSite({
    userId,
    siteId: demande.siteId,
    entrepriseId,
  });

  return siteRole ?? null;
}

// ============================= PERMISSIONS ==============================//

/**
 * Calcule les permissions sur une demande de devis spécifique.
 *
 * Règles :
 * - admin : canView + canEdit + canDelete + canChangeStatut (tous ses sites)
 * - responsable_site : canView + canEdit + canDelete + canChangeStatut (ses sites)
 * - demandeur_site : canView + canCreate + canEdit (ses demandes uniquement) + canDelete (ses demandes)
 * - observateur_site : canView uniquement
 *
 * canDelete est bloqué si au moins un devis est lié (statut quelconque).
 */
export async function getDevisDemandePermissions({
  userId,
  devisDemandeId,
  entrepriseId,
}: {
  userId: string;
  devisDemandeId: string;
  entrepriseId: string;
}): Promise<DevisDemandePermissionsType> {
  const role = await getEffectiveRoleOnDemande({
    userId,
    devisDemandeId,
    entrepriseId,
  });

  if (!role) {
    return {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canChangeStatut: false,
    };
  }

  // Vérifier si un devis est lié (bloque la suppression)
  const [linkedDevis] = await db
    .select({ id: devis.id })
    .from(devis)
    .where(eq(devis.devisDemandeId, devisDemandeId))
    .limit(1);

  const hasLinkedDevis = !!linkedDevis;

  if (role === "admin") {
    return {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: !hasLinkedDevis,
      canChangeStatut: true,
    };
  }

  if (role === "responsable_site") {
    return {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: !hasLinkedDevis,
      canChangeStatut: true,
    };
  }

  if (role === "demandeur_site") {
    // demandeur_site : canEdit et canDelete seulement sur ses propres demandes
    const demande = await db.query.devisDemandes.findFirst({
      where: eq(devisDemandes.id, devisDemandeId),
      columns: { createdById: true },
    });
    const isAuthor = demande?.createdById === userId;

    return {
      canView: true,
      canCreate: true,
      canEdit: isAuthor,
      canDelete: isAuthor && !hasLinkedDevis,
      canChangeStatut: false,
    };
  }

  // observateur_site
  return {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canChangeStatut: false,
  };
}

/**
 * Vérifie rapidement si l'utilisateur peut créer une demande sur un site donné.
 */
export async function canUserCreateDevisDemande({
  userId,
  siteId,
  entrepriseId,
}: {
  userId: string;
  siteId: string;
  entrepriseId: string;
}): Promise<boolean> {
  const adhesion = await getUserClientAdhesion({ userId, entrepriseId });
  if (!adhesion) return false;

  if (adhesion.role === "admin") return true;

  const siteRole = await resolveUserEffectiveRoleOnSite({
    userId,
    siteId,
    entrepriseId,
  });

  return siteRole === "responsable_site" || siteRole === "demandeur_site";
}

/**
 * Retourne les IDs de sites sur lesquels l'utilisateur peut créer une demande.
 * null = tous les sites (admin).
 */
export async function getCreatableSiteIds({
  userId,
  entrepriseId,
}: {
  userId: string;
  entrepriseId: string;
}): Promise<string[] | null> {
  const adhesion = await getUserClientAdhesion({ userId, entrepriseId });
  if (!adhesion) return [];
  if (adhesion.role === "admin") return null;

  const sitesAccessibles = await getAccessibleSitesByUser({
    userId,
    entrepriseId,
  });

  if (sitesAccessibles.length === 0) return [];

  // Résoudre les rôles en batch (2 queries max)
  const siteIds = sitesAccessibles.map((s) => s.id);
  const rolesMap = await resolveUserEffectiveRolesOnSites({
    userId,
    siteIds,
    entrepriseId,
  });

  return siteIds.filter((id) => {
    const role = rolesMap.get(id);
    return role === "responsable_site" || role === "demandeur_site";
  });
}

/**
 * Vérifie si une demande existe et appartient à l'entreprise donnée.
 */
export async function assertDevisDemandeOwnership({
  devisDemandeId,
  entrepriseId,
}: {
  devisDemandeId: string;
  entrepriseId: string;
}): Promise<boolean> {
  const row = await db.query.devisDemandes.findFirst({
    where: and(
      eq(devisDemandes.id, devisDemandeId),
      eq(devisDemandes.demandeurEntrepriseId, entrepriseId),
    ),
    columns: { id: true },
  });
  return !!row;
}
