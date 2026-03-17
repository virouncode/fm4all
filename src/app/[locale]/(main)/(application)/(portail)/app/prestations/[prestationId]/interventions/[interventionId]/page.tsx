import { db } from "@/db";
import {
  clientServiceExecutions,
  clientServiceReglesRecurrence,
  tacheListeItems,
} from "@/db/schema/services";
import { redirect } from "@/i18n/navigation";
import { getSession } from "@/server/auth/get-session";
import {
  getOccurrenceTaches,
  getOccurrenceWithDetailsById,
} from "@/server/queries/clientServiceExecutions.query";
import {
  getPrestationWithJoinsById,
  prestataireHasExecutionOnPrestation,
} from "@/server/queries/clientServices.query";
import {
  getUserClientAdhesion,
  getUserPrestataireAdhesion,
} from "@/server/queries/userAdhesions.query";
import { getAllPrestataireSiteIds } from "@/server/queries/userPrestataireSiteAttributions.query";
import {
  getEffectivePlateformeRole,
  resolvePostureAwareSiteRole,
} from "@/server/utils/permissions.utils";
import { and, asc, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { z } from "zod";
import { OccurrenceDetailClient } from "./OccurrenceDetailClient";


export default async function OccurrenceDetailPage({
  params,
}: {
  params: Promise<{ prestationId: string; interventionId: string }>;
}) {
  const resolvedParams = await params;
  const { prestationId, interventionId } = resolvedParams;
  const occurrenceId = interventionId;

  // 1. Auth
  const session = await getSession();
  if (!session?.user) {
    redirect({ href: "/auth/login", locale: "fr" });
  }
  const currentUser = session!.user;

  // 2. Valider les UUID avant les queries (évite une erreur DB si les IDs sont invalides)
  const uuidSchema = z.uuid();
  if (
    !uuidSchema.safeParse(prestationId).success ||
    !uuidSchema.safeParse(interventionId).success
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
      const pAdhesion = await getUserPrestataireAdhesion({
        userId: currentUser.id,
      });
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
        const attributedSiteIds = await getAllPrestataireSiteIds({
          userId: currentUser.id,
        });
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
          canExecute = siteRole === "responsable_site";
        }
      }
      // modePilotage=prestataire → client n'a que Voir (canManage=false, canExecute=false)
    }
  }

  // 7. canAssignOccurrence : assigner les intervenants prestataires (posture prestataire ou plateforme seulement)
  // Un client peut gérer l'occurrence (annuler, reprogrammer) mais ne choisit pas les employés prestataires.
  const canAssignOccurrence =
    isPlateforme || (posture === "prestataire" && canManage);

  // 8. Charger les tâches
  const taches = await getOccurrenceTaches(occurrenceId);

  // 9. Si aucune tâche réelle, résoudre le template pour afficher les tâches virtuelles
  let virtualTacheItems: { id: string; titre: string; description: string | null; emoji: string | null; ordre: number; dureeEstimeeMinutes: number | null }[] = [];
  if (taches.length === 0) {
    // Résolution prioritaire : occurrence override → règle → exécution
    let resolvedTemplateId: string | null = occurrence.tacheListeTemplateId ?? null;

    if (!resolvedTemplateId && occurrence.regleRecurrenceId) {
      const regleRow = await db
        .select({ tacheListeTemplateId: clientServiceReglesRecurrence.tacheListeTemplateId })
        .from(clientServiceReglesRecurrence)
        .where(eq(clientServiceReglesRecurrence.id, occurrence.regleRecurrenceId))
        .limit(1);
      resolvedTemplateId = regleRow[0]?.tacheListeTemplateId ?? null;
    }

    if (!resolvedTemplateId && occurrence.executionId) {
      const execRow = await db
        .select({ tacheListeTemplateId: clientServiceExecutions.tacheListeTemplateId })
        .from(clientServiceExecutions)
        .where(eq(clientServiceExecutions.id, occurrence.executionId))
        .limit(1);
      resolvedTemplateId = execRow[0]?.tacheListeTemplateId ?? null;
    }

    if (resolvedTemplateId) {
      const items = await db
        .select({
          id: tacheListeItems.id,
          titre: tacheListeItems.titre,
          description: tacheListeItems.description,
          emoji: tacheListeItems.emoji,
          ordre: tacheListeItems.ordre,
          dureeEstimeeMinutes: tacheListeItems.dureeEstimeeMinutes,
        })
        .from(tacheListeItems)
        .where(
          and(
            eq(tacheListeItems.listeTemplateId, resolvedTemplateId),
            eq(tacheListeItems.actif, true),
          ),
        )
        .orderBy(asc(tacheListeItems.ordre));
      virtualTacheItems = items;
    }
  }

  return (
    <OccurrenceDetailClient
      occurrence={occurrence}
      prestation={prestation}
      taches={taches}
      virtualTacheItems={virtualTacheItems}
      canManage={canManage}
      canExecute={canExecute}
      canAssignOccurrence={canAssignOccurrence}
      modePilotage={modePilotage}
      currentUserId={currentUser.id}
      currentUserPrenom={currentUser.prenom ?? null}
      currentUserNom={currentUser.nom ?? null}
    />
  );
}
