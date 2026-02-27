import { redirect } from "@/i18n/navigation";
import { getSession } from "@/server/auth/get-session";
import {
  getOccurrenceTaches,
  getOccurrenceWithDetailsById,
} from "@/server/queries/clientServiceExecutions.query";
import { getPrestationWithJoinsById } from "@/server/queries/clientServices.query";
import { getUserAdhesion } from "@/server/queries/userAdhesions.query";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import { resolveUserEffectiveRoleOnSite } from "@/server/utils/userSiteAttributions.utils";
import { notFound } from "next/navigation";
import { OccurrenceDetailClient } from "./OccurrenceDetailClient";

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

  // 2. Charger la prestation
  const prestation = await getPrestationWithJoinsById(prestationId);
  if (!prestation) notFound();

  // 3. Vérifier l'accès à l'entreprise (plateforme OU adhésion)
  const platformRole = await getUserPlateformeAdhesion(currentUser.id);
  const isPlateforme = !!platformRole?.role;

  if (!isPlateforme) {
    const adhesion = await getUserAdhesion({
      userId: currentUser.id,
      entrepriseId: prestation.entrepriseId,
    });
    if (!adhesion) notFound();
  }

  // 4. Charger l'occurrence
  const occurrence = await getOccurrenceWithDetailsById(occurrenceId);
  if (!occurrence || occurrence.clientServiceId !== prestationId) notFound();

  // 5. Calculer les permissions
  let canManage = isPlateforme;
  if (!canManage) {
    const siteRole = await resolveUserEffectiveRoleOnSite({
      userId: currentUser.id,
      siteId: prestation.siteId,
      entrepriseId: prestation.entrepriseId,
    });
    canManage = siteRole === "responsable_site";
  }

  // 6. Charger les tâches
  const taches = await getOccurrenceTaches(occurrenceId);

  return (
    <OccurrenceDetailClient
      occurrence={occurrence}
      prestation={prestation}
      taches={taches}
      canManage={canManage}
    />
  );
}
