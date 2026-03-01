import { redirect } from "@/i18n/navigation";
import { getSession } from "@/server/auth/get-session";
import {
  countNonAssignedOccurrencesByPrestationId,
  countOccurrencesByPrestationId,
  getDistinctSitesForPrestation,
  getExecutionsWithPrixByPrestationId,
  getOccurrencesByPrestationId,
} from "@/server/queries/clientServiceExecutions.query";
import { getPrestationWithJoinsById } from "@/server/queries/clientServices.query";
import { getUserAdhesion } from "@/server/queries/userAdhesions.query";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import { resolveUserEffectiveRoleOnSite } from "@/server/utils/userSiteAttributions.utils";
import { notFound } from "next/navigation";
import { PrestationDetailsClient } from "./PrestationDetailsClient";

export default async function PrestationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ prestationId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const resolvedParams = await params;
  const { prestationId } = resolvedParams;
  const resolvedSearchParams = await searchParams;
  const defaultTab = resolvedSearchParams.tab ?? "parametres";

  // 1. Auth
  const session = await getSession();
  if (!session?.user) {
    redirect({ href: "/auth/login", locale: "fr" });
  }
  const currentUser = session!.user;

  // 2. Charger la prestation
  const prestation = await getPrestationWithJoinsById(prestationId);
  if (!prestation) {
    notFound();
  }

  // 3. Vérifier l'accès à l'entreprise (plateforme OU adhésion)
  const platformRole = await getUserPlateformeAdhesion(currentUser.id);
  const isPlateforme = !!platformRole?.role;

  if (!isPlateforme) {
    const adhesion = await getUserAdhesion({
      userId: currentUser.id,
      entrepriseId: prestation.entrepriseId,
    });
    if (!adhesion) {
      notFound();
    }
  }

  // 4. Calculer les permissions
  let canManage = isPlateforme;
  if (!canManage) {
    const siteRole = await resolveUserEffectiveRoleOnSite({
      userId: currentUser.id,
      siteId: prestation.siteId,
      entrepriseId: prestation.entrepriseId,
    });
    canManage = siteRole === "responsable_site";
  }

  // 5. Charger les exécutions et leurs prix
  const executions = await getExecutionsWithPrixByPrestationId(prestationId);

  // 6. Charger les interventions (première page) + totaux + sites disponibles
  const [occurrences, totalOccurrences, totalNonAssigned, availableSites] =
    await Promise.all([
      getOccurrencesByPrestationId(prestationId, { limit: 50, sortDir: "asc" }),
      countOccurrencesByPrestationId(prestationId),
      countNonAssignedOccurrencesByPrestationId(prestationId),
      getDistinctSitesForPrestation(prestationId),
    ]);

  return (
    <PrestationDetailsClient
      prestation={prestation}
      canManage={canManage}
      isPlateforme={isPlateforme}
      executions={executions}
      occurrences={occurrences}
      totalOccurrences={totalOccurrences}
      totalNonAssigned={totalNonAssigned}
      availableSites={availableSites}
      defaultTab={defaultTab}
    />
  );
}
