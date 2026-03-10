import { redirect } from "@/i18n/navigation";
import { getSession } from "@/server/auth/get-session";
import { db } from "@/db";
import { devis } from "@/db/schema/devis";
import { eq } from "drizzle-orm";
import { getMesClients } from "@/server/queries/clientServiceExecutions.query";
import {
  getDevisDemandeAttachments,
  getDevisDemandeById,
} from "@/server/queries/devisDemandes.query";
import {
  getUserClientAdhesion,
  getUserPrestataireAdhesion,
} from "@/server/queries/userAdhesions.query";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import type { DevisDemandePermissionsType } from "@/server/utils/devisDemandesPermissions.utils";
import { getDevisDemandePermissions } from "@/server/utils/devisDemandesPermissions.utils";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { DevisDemandeDetailClient } from "./DevisDemandeDetailClient";

export default async function DevisDemandeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ demandeId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { demandeId } = await params;
  const { tab } = await searchParams;
  const backTab =
    tab === "demandes"
      ? ("demandes" as const)
      : tab === "propositions"
        ? ("propositions" as const)
        : undefined;

  // 1. Auth
  const session = await getSession();
  if (!session?.user) {
    redirect({ href: "/auth/login", locale: "fr" });
  }
  const currentUser = session!.user;

  // 2. Load demande
  const demande = await getDevisDemandeById(demandeId);
  if (!demande) notFound();

  // 3. Posture via cookie
  let entrepriseId: string | null = null;
  let posture: "client" | "prestataire" | "plateforme" = "client";

  const cookieStore = await cookies();
  const postureCookie = cookieStore.get("fm4all:postureActive")?.value;

  const platformRole = await getUserPlateformeAdhesion(currentUser.id);
  if (platformRole?.role && postureCookie === "plateforme") {
    posture = "plateforme";
    entrepriseId = demande.demandeurEntrepriseId;
  } else if (postureCookie === "prestataire") {
    const prestataireAdhesion = await getUserPrestataireAdhesion({
      userId: currentUser.id,
    });
    if (prestataireAdhesion) {
      const myClients = await getMesClients(prestataireAdhesion.entrepriseId);
      const clientIds = myClients.map((c) => c.id);
      if (clientIds.includes(demande.demandeurEntrepriseId)) {
        entrepriseId = prestataireAdhesion.entrepriseId;
        posture = "prestataire";
      }
    }
  } else {
    // Client (default)
    const adhesion = await getUserClientAdhesion({
      userId: currentUser.id,
      entrepriseId: demande.demandeurEntrepriseId,
    });
    if (adhesion) {
      entrepriseId = demande.demandeurEntrepriseId;
      posture = "client";
    }
  }

  if (!entrepriseId) notFound();

  // 4. Permissions
  let permissions: DevisDemandePermissionsType;

  if (posture === "plateforme") {
    const [linkedDevis] = await db
      .select({ id: devis.id })
      .from(devis)
      .where(eq(devis.devisDemandeId, demandeId))
      .limit(1);
    permissions = {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: !linkedDevis,
      canChangeStatut: true,
    };
  } else if (posture === "prestataire") {
    permissions = {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canChangeStatut: false,
    };
  } else {
    // client
    permissions = await getDevisDemandePermissions({
      userId: currentUser.id,
      devisDemandeId: demandeId,
      entrepriseId,
    });
    if (!permissions.canView) notFound();
  }

  // 5. Load attachments
  const attachments = await getDevisDemandeAttachments(demandeId);

  return (
    <DevisDemandeDetailClient
      demande={demande}
      entrepriseId={entrepriseId}
      permissions={permissions}
      attachments={attachments}
      posture={posture}
      backTab={backTab}
    />
  );
}
