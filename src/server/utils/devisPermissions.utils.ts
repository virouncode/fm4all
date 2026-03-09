import "server-only";

import { db } from "@/db";
import { devis } from "@/db/schema/devis";
import { userClientAdhesions, userPrestataireAdhesions } from "@/db/schema/users";
import { getEffectivePlateformeRole } from "@/server/utils/permissions.utils";
import { and, eq } from "drizzle-orm";

type DevisPermissions = {
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
export async function getDevisPermissions({
  userId,
  devisId,
}: {
  userId: string;
  devisId: string;
}): Promise<DevisPermissions> {
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

  return {
    canView: isEmetteur || isProprietaire,
    canCreate: isEmetteur,
    canEdit: isEmetteur && isBrouillon,
    canEmettre: isEmetteur && isBrouillon,
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
  const perms = await getDevisPermissions({ userId, devisId });
  return perms.canEdit;
}

export async function canUserEmettreDevis(
  userId: string,
  devisId: string,
): Promise<boolean> {
  const perms = await getDevisPermissions({ userId, devisId });
  return perms.canEmettre;
}
