import "server-only";

import { db } from "@/db";
import { devis } from "@/db/schema/devis";
import { userClientAdhesions, userPrestataireAdhesions } from "@/db/schema/users";
import { getEffectivePlateformeRole, resolvePostureAwareSiteRole } from "@/server/utils/permissions.utils";
import { getUserPrestataireSiteRole } from "@/server/queries/userPrestataireSiteAttributions.query";
import { and, eq } from "drizzle-orm";

type DevisPermissionsType = {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean; // brouillon uniquement
  canEmettre: boolean;
  canSigner: boolean; // côté client
  canRefuser: boolean; // côté client
};

/**
 * Retourne les permissions sur un devis selon la posture active.
 *
 * Règles métier :
 * - Plateforme : lecture seule (ne peut ni créer ni modifier)
 * - Prestataire (emetteurEntrepriseId) : créer, éditer brouillon, émettre
 * - Client (proprietaireEntrepriseId) : voir, signer ou refuser les devis émis
 */
export async function getDevisPermissionsType({
  userId,
  devisId,
}: {
  userId: string;
  devisId: string;
}): Promise<DevisPermissionsType> {
  const [devisRow, plateformeRole] = await Promise.all([
    db.query.devis.findFirst({ where: eq(devis.id, devisId) }),
    getEffectivePlateformeRole(userId),
  ]);

  if (!devisRow) {
    return {
      canView: false,
      canCreate: false,
      canEdit: false,
      canEmettre: false,
      canSigner: false,
      canRefuser: false,
    };
  }

  // Plateforme = lecture seule
  if (plateformeRole?.role) {
    return {
      canView: true,
      canCreate: false,
      canEdit: false,
      canEmettre: false,
      canSigner: false,
      canRefuser: false,
    };
  }

  const [isEmetteur, isProprietaire] = await Promise.all([
    isUserPrestataireDe(userId, devisRow.emetteurEntrepriseId),
    isUserClientDe(userId, devisRow.proprietaireEntrepriseId),
  ]);

  const isBrouillon = devisRow.statut === "brouillon";
  const isEmis = devisRow.statut === "emis";

  // BUG-6 fix: Les rôles site observateur_site et intervenant_site ne peuvent pas modifier/émettre.
  // Vérifier si l'utilisateur a un rôle site restreint sur le site du devis.
  let hasRestrictedSiteRoleOnly = false;
  if (isEmetteur) {
    // Cas prestataire (emetteur) : vérifier via userPrestataireSiteAttributions
    const prestataireAdh = await db.query.userPrestataireAdhesions.findFirst({
      where: and(
        eq(userPrestataireAdhesions.userId, userId),
        eq(userPrestataireAdhesions.entrepriseId, devisRow.emetteurEntrepriseId),
        eq(userPrestataireAdhesions.statut, "actif"),
      ),
    });
    if (prestataireAdh && prestataireAdh.role !== "admin") {
      const siteRole = await getUserPrestataireSiteRole({
        userId,
        siteId: devisRow.siteId,
        clientEntrepriseId: devisRow.proprietaireEntrepriseId,
      });
      if (!siteRole || siteRole === "observateur_site" || siteRole === "intervenant_site") {
        hasRestrictedSiteRoleOnly = true;
      }
    }
  }
  if (!hasRestrictedSiteRoleOnly && isProprietaire) {
    // Cas client (peut aussi être émetteur si même entreprise) : vérifier via userClientSiteAttributions
    const clientAdh = await db.query.userClientAdhesions.findFirst({
      where: and(
        eq(userClientAdhesions.userId, userId),
        eq(userClientAdhesions.entrepriseId, devisRow.emetteurEntrepriseId),
        eq(userClientAdhesions.statut, "actif"),
      ),
    });
    if (clientAdh && clientAdh.role !== "admin" && clientAdh.role !== "manager") {
      const siteRole = await resolvePostureAwareSiteRole({
        userId,
        siteId: devisRow.siteId,
        entrepriseId: devisRow.emetteurEntrepriseId,
      });
      if (!siteRole || siteRole === "observateur_site" || siteRole === "intervenant_site") {
        hasRestrictedSiteRoleOnly = true;
      }
    }
  }

  return {
    canView: isEmetteur || isProprietaire,
    canCreate: isEmetteur,
    canEdit: isEmetteur && isBrouillon && !hasRestrictedSiteRoleOnly,
    canEmettre: isEmetteur && isBrouillon && !hasRestrictedSiteRoleOnly,
    canSigner: isProprietaire && isEmis,
    canRefuser: isProprietaire && isEmis,
  };
}

async function isUserPrestataireDe(
  userId: string,
  prestataireEntrepriseId: string,
): Promise<boolean> {
  const row = await db.query.userPrestataireAdhesions.findFirst({
    where: and(
      eq(userPrestataireAdhesions.userId, userId),
      eq(userPrestataireAdhesions.entrepriseId, prestataireEntrepriseId),
      eq(userPrestataireAdhesions.statut, "actif"),
    ),
  });
  return !!row;
}

async function isUserClientDe(
  userId: string,
  clientEntrepriseId: string,
): Promise<boolean> {
  const row = await db.query.userClientAdhesions.findFirst({
    where: and(
      eq(userClientAdhesions.userId, userId),
      eq(userClientAdhesions.entrepriseId, clientEntrepriseId),
      eq(userClientAdhesions.statut, "actif"),
    ),
  });
  return !!row;
}

export async function canUserEditDevis(
  userId: string,
  devisId: string,
): Promise<boolean> {
  const perms = await getDevisPermissionsType({ userId, devisId });
  return perms.canEdit;
}

export async function canUserEmettreDevis(
  userId: string,
  devisId: string,
): Promise<boolean> {
  const perms = await getDevisPermissionsType({ userId, devisId });
  return perms.canEmettre;
}
