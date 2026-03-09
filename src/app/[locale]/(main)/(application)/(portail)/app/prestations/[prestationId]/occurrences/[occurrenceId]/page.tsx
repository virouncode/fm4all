import { redirect } from "@/i18n/navigation";
import { db } from "@/db";
import { userClientSiteAttributions } from "@/db/schema/users";
import { sitesArborescence } from "@/db/schema/sites";
import { getSession } from "@/server/auth/get-session";
import {
  getOccurrenceTaches,
  getOccurrenceWithDetailsById,
} from "@/server/queries/clientServiceExecutions.query";
import { getPrestationWithJoinsById, prestataireHasExecutionOnPrestation } from "@/server/queries/clientServices.query";
import {
  getUserClientAdhesion,
  getUserPrestataireAdhesion,
} from "@/server/queries/userAdhesions.query";
import {
  getEffectivePlateformeRole,
  resolvePostureAwareSiteRole,
} from "@/server/utils/permissions.utils";
import { getAllPrestataireSiteIds } from "@/server/queries/userPrestataireSiteAttributions.query";
import { and, eq, inArray } from "drizzle-orm";
import { cookies } from "next/headers";
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

  // 3. Lire la posture active
  const cookieStore = await cookies();
  const posture = cookieStore.get("fm4all:postureActive")?.value;

  // 4. Vérifier l'accès (posture-aware)
  const platformRole = await getEffectivePlateformeRole(currentUser.id);
  const isPlateforme = !!platformRole?.role;

  let clientAdhesionRole: string | null = null;
  let prestataireAdhesionRole: string | null = null;
  let prestataireEntrepriseId: string | null = null;

  if (!isPlateforme) {
    if (posture === "prestataire") {
      const pAdhesion = await getUserPrestataireAdhesion({ userId: currentUser.id });
      if (!pAdhesion) notFound();
      prestataireEntrepriseId = pAdhesion.entrepriseId;
      prestataireAdhesionRole = pAdhesion.role;

      const canAccess = await prestataireHasExecutionOnPrestation({
        prestationId,
        prestataireEntrepriseId,
      });
      if (!canAccess) notFound();

      // Non-admin : vérifier que le site de la prestation est dans les sites attribués
      if (pAdhesion.role !== "admin") {
        const attributedSiteIds = await getAllPrestataireSiteIds({ userId: currentUser.id });
        if (!attributedSiteIds.includes(prestation.siteId)) notFound();
      }
    } else {
      // client ou posture par défaut
      const cAdhesion = await getUserClientAdhesion({
        userId: currentUser.id,
        entrepriseId: prestation.entrepriseId,
      });
      if (!cAdhesion) notFound();
      clientAdhesionRole = cAdhesion.role;
    }
  }

  // 5. Charger l'occurrence
  const occurrence = await getOccurrenceWithDetailsById(occurrenceId);
  if (!occurrence || occurrence.clientServiceId !== prestationId) notFound();

  // 6. Calculer les permissions (modePilotage-aware)
  const modePilotage = occurrence.modePilotage ?? "client";

  let canManage = isPlateforme;
  let canExecute = isPlateforme;

  if (!isPlateforme) {
    if (posture === "prestataire") {
      // Prestataire actif seulement si modePilotage = prestataire ou collaboration
      const isActiveMode =
        modePilotage === "prestataire" || modePilotage === "collaboration";
      if (isActiveMode) {
        if (prestataireAdhesionRole === "admin") {
          canManage = true;
          canExecute = true;
        } else {
          const siteRole = await resolvePostureAwareSiteRole({
            userId: currentUser.id,
            siteId: prestation.siteId,
            entrepriseId: prestation.entrepriseId,
          });
          canManage = siteRole === "responsable_site";
          canExecute =
            siteRole === "responsable_site" || siteRole === "intervenant_site";
        }
      }
      // modePilotage=client → prestataire n'a que Voir (canManage=false, canExecute=false)
    } else {
      // Client (posture par défaut)
      // Client actif seulement si modePilotage = client ou collaboration
      const isActiveMode =
        modePilotage === "client" || modePilotage === "collaboration";
      if (isActiveMode) {
        if (clientAdhesionRole === "admin") {
          canManage = true;
          canExecute = true;
        } else {
          const siteRole = await resolvePostureAwareSiteRole({
            userId: currentUser.id,
            siteId: prestation.siteId,
            entrepriseId: prestation.entrepriseId,
          });
          canManage = siteRole === "responsable_site";
          canExecute =
            siteRole === "responsable_site" || siteRole === "demandeur_site";
        }
      }
      // modePilotage=prestataire → client n'a que Voir (canManage=false, canExecute=false)
    }
  }

  // 7. canAssignOccurrence : assigner les intervenants prestataires (posture prestataire ou plateforme seulement)
  // Un client peut gérer l'occurrence (annuler, reprogrammer) mais ne choisit pas les employés prestataires.
  const canAssignOccurrence = isPlateforme || (posture === "prestataire" && canManage);

  // 8. Déterminer le mode de suivi (interne vs prestataire)
  let suiviMode: "interne" | "prestataire" = "interne";
  if (occurrence.prestataireEntrepriseId) {
    const hasPrestataireUsers = await hasPrestataireUsersOnSite(
      occurrence.prestataireEntrepriseId,
      occurrence.siteId,
    );
    if (hasPrestataireUsers) suiviMode = "prestataire";
  }

  // 8. Charger les tâches
  const taches = await getOccurrenceTaches(occurrenceId);

  return (
    <OccurrenceDetailClient
      occurrence={occurrence}
      prestation={prestation}
      taches={taches}
      canManage={canManage}
      canExecute={canExecute}
      canAssignOccurrence={canAssignOccurrence}
      suiviMode={suiviMode}
      currentUserId={currentUser.id}
      currentUserPrenom={currentUser.prenom ?? null}
      currentUserNom={currentUser.nom ?? null}
    />
  );
}
