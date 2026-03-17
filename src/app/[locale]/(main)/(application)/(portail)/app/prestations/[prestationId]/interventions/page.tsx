import { redirect } from "@/i18n/navigation";
import { getSession } from "@/server/auth/get-session";
import {
  countOccurrencesByPrestationId,
  getDistinctSitesForPrestation,
  getOccurrencesByPrestationId,
} from "@/server/queries/clientServiceExecutions.query";
import {
  getPrestationWithJoinsById,
  getQuotaInfoForPrestation,
  prestataireHasExecutionOnPrestation,
} from "@/server/queries/clientServices.query";
import {
  getUserClientAdhesion,
  getUserPrestataireAdhesion,
} from "@/server/queries/userAdhesions.query";
import { getUserClientSiteAttributions } from "@/server/queries/userSiteAttributions.query";
import { getAllPrestataireSiteIds } from "@/server/queries/userPrestataireSiteAttributions.query";
import {
  getEffectivePlateformeRole,
  resolvePostureAwareSiteRole,
} from "@/server/utils/permissions.utils";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { z } from "zod";
import { InterventionsPageClient } from "./InterventionsPageClient";

export default async function InterventionsPage({
  params,
}: {
  params: Promise<{ prestationId: string }>;
}) {
  const resolvedParams = await params;
  const { prestationId } = resolvedParams;

  // 1. Auth
  const session = await getSession();
  if (!session?.user) {
    redirect({ href: "/auth/login", locale: "fr" });
  }
  const currentUser = session!.user;

  // 2. Valider UUID
  if (!z.string().uuid().safeParse(prestationId).success) {
    notFound();
  }

  const prestation = await getPrestationWithJoinsById(prestationId);
  if (!prestation) {
    notFound();
  }

  // Seule une prestation active a des interventions
  if (prestation.statut !== "actif") {
    notFound();
  }

  // 3. Posture active
  const cookieStore = await cookies();
  const posture = cookieStore.get("fm4all:postureActive")?.value;

  // 4. Vérifier l'accès
  const platformRole = await getEffectivePlateformeRole(currentUser.id);
  const isPlateforme = !!platformRole?.role;

  let prestataireAdhesionRole: string | null = null;

  if (!isPlateforme) {
    if (posture === "prestataire") {
      const prestataireAdhesion = await getUserPrestataireAdhesion({
        userId: currentUser.id,
      });
      if (!prestataireAdhesion) notFound();
      prestataireAdhesionRole = prestataireAdhesion.role;

      const canAccess = await prestataireHasExecutionOnPrestation({
        prestationId,
        prestataireEntrepriseId: prestataireAdhesion.entrepriseId,
      });
      if (!canAccess) notFound();

      if (prestataireAdhesion.role !== "admin") {
        const attributedSiteIds = await getAllPrestataireSiteIds({
          userId: currentUser.id,
        });
        if (!attributedSiteIds.includes(prestation.siteId)) notFound();
      }
    } else {
      const clientAdhesion = await getUserClientAdhesion({
        userId: currentUser.id,
        entrepriseId: prestation.entrepriseId,
      });
      if (!clientAdhesion) notFound();

      if (clientAdhesion.role !== "admin") {
        const { attributions } = await getUserClientSiteAttributions({
          userId: currentUser.id,
          entrepriseId: prestation.entrepriseId,
        });
        const hasAttribution = attributions.some(
          (a) => a.siteId === prestation.siteId && a.mode === "inclure",
        );
        if (!hasAttribution) notFound();
      }
    }
  }

  // 5. Calculer les permissions
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
    } else if (
      posture === "prestataire" &&
      prestataireAdhesionRole === "admin"
    ) {
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

  // 6. Charger les données
  const [occurrences, totalOccurrences, availableSites, quotaInfo] =
    await Promise.all([
      getOccurrencesByPrestationId(prestationId, { limit: 50, sortDir: "asc" }),
      countOccurrencesByPrestationId(prestationId),
      getDistinctSitesForPrestation(prestationId),
      prestation.famillePlanification === "quota_manuel"
        ? getQuotaInfoForPrestation(prestationId)
        : Promise.resolve(null),
    ]);

  return (
    <InterventionsPageClient
      prestation={prestation}
      initialOccurrences={occurrences}
      totalOccurrences={totalOccurrences}
      availableSites={availableSites}
      canManage={canManage}
      quotaInfo={quotaInfo}
    />
  );
}
