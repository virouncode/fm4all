import { redirect } from "@/i18n/navigation";
import { db } from "@/db";
import { userClientSiteAttributions } from "@/db/schema/users";
import { sitesArborescence } from "@/db/schema/sites";
import { getSession } from "@/server/auth/get-session";
import {
  getOccurrenceTaches,
  getOccurrenceWithDetailsById,
} from "@/server/queries/clientServiceExecutions.query";
import { getPrestationWithJoinsById } from "@/server/queries/clientServices.query";
import { getUserClientAdhesion } from "@/server/queries/userAdhesions.query";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import { resolveUserEffectiveRoleOnSite } from "@/server/utils/userClientSiteAttributions.utils";
import { and, eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { OccurrenceDetailClient } from "./OccurrenceDetailClient";

/**
 * Vérifie si le prestataire a au moins un utilisateur attribué (mode=inclure)
 * au site de l'occurrence ou à un ancêtre de ce site (scope=subtree).
 */
async function hasPrestataireUsersOnSite(
  prestataireEntrepriseId: string,
  siteId: string,
): Promise<boolean> {
  // Récupérer les ancêtres du site (y compris lui-même)
  const ancestors = await db
    .select({ ancetreId: sitesArborescence.ancetreId })
    .from(sitesArborescence)
    .where(eq(sitesArborescence.descendantId, siteId));

  const ancestorIds = ancestors.map((a) => a.ancetreId);
  if (ancestorIds.length === 0) return false;

  const rows = await db
    .select({ id: userClientSiteAttributions.id })
    .from(userClientSiteAttributions)
    .where(
      and(
        eq(userClientSiteAttributions.entrepriseId, prestataireEntrepriseId),
        eq(userClientSiteAttributions.mode, "inclure"),
        inArray(userClientSiteAttributions.siteId, ancestorIds),
      ),
    )
    .limit(1);

  return rows.length > 0;
}

export default async function OccurrenceDetailPage({
  params,
}: {
  params: Promise<{ prestationId: string; occurrenceId: string }>;
}) {
  const resolvedParams = await params;
  const { prestationId, occurrenceId } = resolvedParams;

  // 1. Auth
  const session = await getSession();
  if (!session?.user) {
    redirect({ href: "/auth/login", locale: "fr" });
  }
  const currentUser = session!.user;

  // 2. Valider les UUID avant les queries (évite une erreur DB si les IDs sont invalides)
  const uuidSchema = z.string().uuid();
  if (
    !uuidSchema.safeParse(prestationId).success ||
    !uuidSchema.safeParse(occurrenceId).success
  ) {
    notFound();
  }

  const prestation = await getPrestationWithJoinsById(prestationId);
  if (!prestation) notFound();

  // 3. Vérifier l'accès à l'entreprise (plateforme OU adhésion)
  const platformRole = await getUserPlateformeAdhesion(currentUser.id);
  const isPlateforme = !!platformRole?.role;

  if (!isPlateforme) {
    const adhesion = await getUserClientAdhesion({
      userId: currentUser.id,
      entrepriseId: prestation.entrepriseId,
    });
    if (!adhesion) notFound();
  }

  // 4. Charger l'occurrence
  const occurrence = await getOccurrenceWithDetailsById(occurrenceId);
  if (!occurrence || occurrence.clientServiceId !== prestationId) notFound();

  // 5. Calculer les permissions
  let canManage = isPlateforme;   // contrôle total (annulation, non-honorée)
  let canInteract = isPlateforme; // travail terrain (démarrer, terminer, tâches)
  if (!isPlateforme) {
    const siteRole = await resolveUserEffectiveRoleOnSite({
      userId: currentUser.id,
      siteId: prestation.siteId,
      entrepriseId: prestation.entrepriseId,
    });
    canManage = siteRole === "responsable_site";
    canInteract = siteRole === "responsable_site";
  }

  // Permission d'assigner l'intervenant de l'occurrence (côté prestataire)
  let canAssignOccurrence = isPlateforme;
  if (!isPlateforme && occurrence.prestataireEntrepriseId) {
    const prestataireRole = await resolveUserEffectiveRoleOnSite({
      userId: currentUser.id,
      siteId: prestation.siteId,
      entrepriseId: occurrence.prestataireEntrepriseId,
    });
    canAssignOccurrence = prestataireRole === "responsable_site";
  }

  // 6. Déterminer le mode de suivi (interne vs prestataire)
  let suiviMode: "interne" | "prestataire" = "interne";
  if (occurrence.prestataireEntrepriseId) {
    const hasPrestataireUsers = await hasPrestataireUsersOnSite(
      occurrence.prestataireEntrepriseId,
      occurrence.siteId,
    );
    if (hasPrestataireUsers) suiviMode = "prestataire";
  }

  // 7. Charger les tâches
  const taches = await getOccurrenceTaches(occurrenceId);

  return (
    <OccurrenceDetailClient
      occurrence={occurrence}
      prestation={prestation}
      taches={taches}
      canManage={canManage}
      canInteract={canInteract}
      canAssignOccurrence={canAssignOccurrence}
      suiviMode={suiviMode}
      currentUserId={currentUser.id}
      currentUserPrenom={currentUser.prenom ?? null}
      currentUserNom={currentUser.nom ?? null}
    />
  );
}
