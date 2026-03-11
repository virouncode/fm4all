import "server-only";

import { db } from "@/db";
import { factures } from "@/db/schema/factures";
import { userClientAdhesions, userPrestataireAdhesions } from "@/db/schema/users";
import { getEffectivePlateformeRole } from "@/server/utils/permissions.utils";
import { and, eq } from "drizzle-orm";

type FacturePermissionsType = {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean; // brouillon uniquement
  canEmettre: boolean; // brouillon → emise
  canAnnuler: boolean; // emise → annulee
};

/**
 * Retourne les permissions sur une facture selon la posture active.
 *
 * Règles métier :
 * - Plateforme : lecture seule
 * - admin ou manager de emetteurEntrepriseId : créer, éditer brouillon, émettre, annuler
 * - Membre de destinataireEntrepriseId : voir uniquement (toutes factures)
 */
export async function getFacturePermissionsType({
  userId,
  factureId,
}: {
  userId: string;
  factureId: string;
}): Promise<FacturePermissionsType> {
  const [factureRow, plateformeRole] = await Promise.all([
    db.query.factures.findFirst({ where: eq(factures.id, factureId) }),
    getEffectivePlateformeRole(userId),
  ]);

  if (!factureRow) {
    return {
      canView: false,
      canCreate: false,
      canEdit: false,
      canEmettre: false,
      canAnnuler: false,
    };
  }

  // Plateforme = lecture seule
  if (plateformeRole?.role) {
    return {
      canView: true,
      canCreate: false,
      canEdit: false,
      canEmettre: false,
      canAnnuler: false,
    };
  }

  const [emetteurRole, isDestinataire] = await Promise.all([
    getAdhesionRoleForEntreprise(userId, factureRow.emetteurEntrepriseId),
    isMemberOfEntreprise(userId, factureRow.destinataireEntrepriseId),
  ]);

  const isAdminOrManagerEmetteur =
    emetteurRole === "admin" || emetteurRole === "manager";
  const isBrouillon = factureRow.statut === "brouillon";
  const isEmise = factureRow.statut === "emise";

  return {
    canView: isAdminOrManagerEmetteur || isDestinataire,
    canCreate: isAdminOrManagerEmetteur,
    canEdit: isAdminOrManagerEmetteur && isBrouillon,
    canEmettre: isAdminOrManagerEmetteur && isBrouillon,
    canAnnuler: isAdminOrManagerEmetteur && isEmise,
  };
}

/**
 * Retourne le rôle de l'utilisateur dans une entreprise
 * en vérifiant les deux tables d'adhésion (prestataire puis client).
 */
async function getAdhesionRoleForEntreprise(
  userId: string,
  entrepriseId: string,
): Promise<string | null> {
  const [prestAdh, clientAdh] = await Promise.all([
    db.query.userPrestataireAdhesions.findFirst({
      where: and(
        eq(userPrestataireAdhesions.userId, userId),
        eq(userPrestataireAdhesions.entrepriseId, entrepriseId),
        eq(userPrestataireAdhesions.statut, "actif"),
      ),
    }),
    db.query.userClientAdhesions.findFirst({
      where: and(
        eq(userClientAdhesions.userId, userId),
        eq(userClientAdhesions.entrepriseId, entrepriseId),
        eq(userClientAdhesions.statut, "actif"),
      ),
    }),
  ]);
  return prestAdh?.role ?? clientAdh?.role ?? null;
}

/**
 * Vérifie si l'utilisateur est membre actif d'une entreprise
 * (prestataire ou client).
 */
async function isMemberOfEntreprise(
  userId: string,
  entrepriseId: string,
): Promise<boolean> {
  const [prestAdh, clientAdh] = await Promise.all([
    db.query.userPrestataireAdhesions.findFirst({
      where: and(
        eq(userPrestataireAdhesions.userId, userId),
        eq(userPrestataireAdhesions.entrepriseId, entrepriseId),
        eq(userPrestataireAdhesions.statut, "actif"),
      ),
    }),
    db.query.userClientAdhesions.findFirst({
      where: and(
        eq(userClientAdhesions.userId, userId),
        eq(userClientAdhesions.entrepriseId, entrepriseId),
        eq(userClientAdhesions.statut, "actif"),
      ),
    }),
  ]);
  return !!(prestAdh || clientAdh);
}

export async function canUserEditFacture(
  userId: string,
  factureId: string,
): Promise<boolean> {
  const perms = await getFacturePermissionsType({ userId, factureId });
  return perms.canEdit;
}

export async function canUserEmettreFacture(
  userId: string,
  factureId: string,
): Promise<boolean> {
  const perms = await getFacturePermissionsType({ userId, factureId });
  return perms.canEmettre;
}

export async function canUserAnnulerFacture(
  userId: string,
  factureId: string,
): Promise<boolean> {
  const perms = await getFacturePermissionsType({ userId, factureId });
  return perms.canAnnuler;
}
