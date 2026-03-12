import "server-only";

import { db } from "@/db";
import { clientPrestataireRelations } from "@/db/schema/entreprises";
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

  const [isEmetteurRaw, clientRole] = await Promise.all([
    isUserPrestataireDe(userId, devisRow.emetteurEntrepriseId),
    getClientRoleForDevis(userId, devisRow.proprietaireEntrepriseId, devisRow.siteId),
  ]);

  // Vérifier que la relation clientPrestataireRelations existe
  let isEmetteur = isEmetteurRaw;
  if (isEmetteurRaw) {
    const relation = await db.query.clientPrestataireRelations.findFirst({
      where: and(
        eq(clientPrestataireRelations.prestataireEntrepriseId, devisRow.emetteurEntrepriseId),
        eq(clientPrestataireRelations.clientEntrepriseId, devisRow.proprietaireEntrepriseId),
      ),
    });
    if (!relation) {
      isEmetteur = false;
    }
  }

  const isBrouillon = devisRow.statut === "brouillon";
  const isEmis = devisRow.statut === "emis";

  // Côté émetteur : restreindre les rôles de site observateur/intervenant
  let hasRestrictedSiteRoleOnly = false;
  if (isEmetteur) {
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

  // Côté client : seuls admin et responsable_site peuvent signer/refuser
  const isProprietaire = !!clientRole;
  const canSignRefuse =
    (clientRole === "admin" || clientRole === "responsable_site") && isEmis;

  return {
    canView: isEmetteur || isProprietaire,
    canCreate: isEmetteur,
    canEdit: isEmetteur && isBrouillon && !hasRestrictedSiteRoleOnly,
    canEmettre: isEmetteur && isBrouillon && !hasRestrictedSiteRoleOnly,
    canSigner: canSignRefuse,
    canRefuser: canSignRefuse,
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

/**
 * Retourne le rôle effectif d'un utilisateur en tant que client sur un devis.
 *
 * Règles (regles_metier.md §A) :
 * - admin → accès total (voir + signer/refuser)
 * - responsable_site → voir ses sites + signer/refuser
 * - demandeur_site, observateur_site → voir ses sites uniquement
 * - manager, collaborateur sans rôle de site qualifiant → aucun accès
 */
async function getClientRoleForDevis(
  userId: string,
  proprietaireEntrepriseId: string,
  siteId: string | null,
): Promise<"admin" | "responsable_site" | "demandeur_site" | "observateur_site" | null> {
  const clientAdh = await db.query.userClientAdhesions.findFirst({
    where: and(
      eq(userClientAdhesions.userId, userId),
      eq(userClientAdhesions.entrepriseId, proprietaireEntrepriseId),
      eq(userClientAdhesions.statut, "actif"),
    ),
  });

  if (!clientAdh) return null;
  if (clientAdh.role === "admin") return "admin";

  // manager et collaborateur n'ont accès aux devis que via un rôle de site qualifiant
  if (!siteId) return null; // sans siteId, seul admin peut accéder

  const siteRole = await resolvePostureAwareSiteRole({
    userId,
    siteId,
    entrepriseId: proprietaireEntrepriseId,
  });

  if (
    siteRole === "responsable_site" ||
    siteRole === "demandeur_site" ||
    siteRole === "observateur_site"
  ) {
    return siteRole;
  }

  return null;
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
