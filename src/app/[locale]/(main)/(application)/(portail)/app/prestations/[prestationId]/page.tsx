import { redirect } from "@/i18n/navigation";
import { getSession } from "@/server/auth/get-session";
import {
  countNonAssignedOccurrencesByPrestationId,
  countOccurrencesByPrestationId,
  getDistinctSitesForPrestation,
  getExecutionsWithPrixByPrestationId,
  getOccurrencesByPrestationId,
} from "@/server/queries/clientServiceExecutions.query";
import {
  getPrestationWithJoinsById,
  hasClientActiveAdmin,
} from "@/server/queries/clientServices.query";
import { getUserClientAdhesion } from "@/server/queries/userAdhesions.query";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import { resolveUserEffectiveRoleOnSite } from "@/server/utils/userClientSiteAttributions.utils";
import { notFound } from "next/navigation";
import { z } from "zod";
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

  // 2. Valider UUID avant la query (évite une erreur DB si l'ID est invalide)
  if (!z.string().uuid().safeParse(prestationId).success) {
    notFound();
  }

  const prestation = await getPrestationWithJoinsById(prestationId);
  if (!prestation) {
    notFound();
  }

  // 3. Vérifier l'accès à l'entreprise (plateforme OU adhésion)
  const platformRole = await getUserPlateformeAdhesion(currentUser.id);
  const isPlateforme = !!platformRole?.role;

  let clientAdhesion = null;
  if (!isPlateforme) {
    clientAdhesion = await getUserClientAdhesion({
      userId: currentUser.id,
      entrepriseId: prestation.entrepriseId,
    });
    if (!clientAdhesion) {
      notFound();
    }
  }

  // 4. Calculer les permissions
  let canManage = isPlateforme;
  let siteRole = null;
  if (!isPlateforme) {
    siteRole = await resolveUserEffectiveRoleOnSite({
      userId: currentUser.id,
      siteId: prestation.siteId,
      entrepriseId: prestation.entrepriseId,
    });
    canManage = siteRole === "responsable_site";
  }

  const isClientAdmin =
    !isPlateforme && !!clientAdhesion && clientAdhesion.role === "admin";
  const isClientManager =
    !isPlateforme && !!clientAdhesion && clientAdhesion.role === "manager";
  const canChangeModePilotage =
    isPlateforme ||
    isClientAdmin ||
    (canManage && !isPlateforme && !isClientManager);

  // 5. Charger les exécutions et leurs prix
  const executions = await getExecutionsWithPrixByPrestationId(prestationId);

  // 6. Charger les interventions (première page) + totaux + sites disponibles + hasActiveAdmin
  const [occurrences, totalOccurrences, totalNonAssigned, availableSites, clientHasActiveAdmin] =
    await Promise.all([
      getOccurrencesByPrestationId(prestationId, { limit: 50, sortDir: "asc" }),
      countOccurrencesByPrestationId(prestationId),
      countNonAssignedOccurrencesByPrestationId(prestationId),
      getDistinctSitesForPrestation(prestationId),
      hasClientActiveAdmin(prestation.entrepriseId),
    ]);

  return (
    <PrestationDetailsClient
      prestation={prestation}
      canManage={canManage}
      isPlateforme={isPlateforme}
      canChangeModePilotage={canChangeModePilotage}
      clientHasActiveAdmin={clientHasActiveAdmin}
      executions={executions}
      occurrences={occurrences}
      totalOccurrences={totalOccurrences}
      totalNonAssigned={totalNonAssigned}
      availableSites={availableSites}
      defaultTab={defaultTab}
    />
  );
}
