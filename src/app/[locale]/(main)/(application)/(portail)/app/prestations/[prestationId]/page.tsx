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
  prestataireHasExecutionOnPrestation,
} from "@/server/queries/clientServices.query";
import {
  getUserClientAdhesion,
  getUserPrestataireAdhesion,
} from "@/server/queries/userAdhesions.query";
import {
  getEffectivePlateformeRole,
  resolvePostureAwareSiteRole,
} from "@/server/utils/permissions.utils";
import { getAllPrestataireSiteIds } from "@/server/queries/userPrestataireSiteAttributions.query";
import { cookies } from "next/headers";
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

  // 3. Lire la posture active
  const cookieStore = await cookies();
  const posture = cookieStore.get("fm4all:postureActive")?.value;

  // 4. Vérifier l'accès (posture-aware)
  const platformRole = await getEffectivePlateformeRole(currentUser.id);
  const isPlateforme = !!platformRole?.role;

  let prestataireEntrepriseId: string | null = null;

  if (!isPlateforme) {
    if (posture === "prestataire") {
      // Accès prestataire : son entreprise doit avoir une exécution sur cette prestation
      const prestataireAdhesion = await getUserPrestataireAdhesion({
        userId: currentUser.id,
      });
      if (!prestataireAdhesion) notFound();
      prestataireEntrepriseId = prestataireAdhesion.entrepriseId;

      const canAccess = await prestataireHasExecutionOnPrestation({
        prestationId,
        prestataireEntrepriseId,
      });
      if (!canAccess) notFound();

      // Non-admin : vérifier que le site de la prestation est dans les sites attribués
      if (prestataireAdhesion.role !== "admin") {
        const attributedSiteIds = await getAllPrestataireSiteIds({ userId: currentUser.id });
        if (!attributedSiteIds.includes(prestation.siteId)) notFound();
      }
    } else {
      // client ou posture par défaut
      const clientAdhesion = await getUserClientAdhesion({
        userId: currentUser.id,
        entrepriseId: prestation.entrepriseId,
      });
      if (!clientAdhesion) notFound();
    }
  }

  // 5. Calculer les permissions
  // clientAdhesion peut être null si l'utilisateur est prestataire (pas client)
  const clientAdhesion =
    isPlateforme || posture === "prestataire"
      ? null
      : await getUserClientAdhesion({
          userId: currentUser.id,
          entrepriseId: prestation.entrepriseId,
        });

  let canManage = isPlateforme;
  if (!isPlateforme) {
    if (clientAdhesion?.role === "admin") {
      canManage = true;
    } else {
      const siteRole = await resolvePostureAwareSiteRole({
        userId: currentUser.id,
        siteId: prestation.siteId,
        entrepriseId: prestation.entrepriseId,
      });
      canManage = siteRole === "responsable_site";
    }
  }

  const isClientAdmin =
    !isPlateforme && !!clientAdhesion && clientAdhesion.role === "admin";
  const isClientManager =
    !isPlateforme && !!clientAdhesion && clientAdhesion.role === "manager";
  const canChangeModePilotage =
    isPlateforme ||
    isClientAdmin ||
    (canManage && !isPlateforme && !isClientManager);

  // 6. Charger les exécutions et leurs prix
  const executions = await getExecutionsWithPrixByPrestationId(prestationId);

  // 7. Charger les interventions (première page) + totaux + sites disponibles + hasActiveAdmin
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
