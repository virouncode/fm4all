import { redirect } from "@/i18n/navigation";
import { getSession } from "@/server/auth/get-session";
import { getClientPrestataires } from "@/server/queries/clientServiceExecutions.query";
import { getDocumentsByTicketId } from "@/server/queries/documents.query";
import {
  getEntrepriseById,
  getEntreprisesPrestataires,
} from "@/server/queries/entreprises.query";
import { getSiteById, getSiteResponsables, type SiteResponsable } from "@/server/queries/sites.query";
import {
  getTicketById,
  getTicketMessagesWithAttachments,
} from "@/server/queries/tickets.query";
import { getUserClientAdhesion, getUserPrestataireAdhesion } from "@/server/queries/userAdhesions.query";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import { cookies } from "next/headers";
import { getUsersByEntrepriseId } from "@/server/queries/users.query";
import { canUserAccessTicket } from "@/server/utils/ticketsPerimetre.utils";
import {
  canUserEditAssigneEntrepriseId,
  canUserEditAssigneUserId,
  canUserEditStatut,
  canUserEditTicketBasicFields,
  canUserEditTypeAndPriorite,
  getAvailableStatutsForUser,
} from "@/server/utils/ticketsPermissions.utils";
import { notFound } from "next/navigation";
import { TicketDetailsClient } from "./TicketDetailsClient";

export default async function TicketDetailsPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const resolvedParams = await params;
  const { ticketId } = resolvedParams;

  // 1. Auth
  const session = await getSession();
  if (!session || !session.user) {
    redirect({ href: "/auth/login", locale: "fr" });
  }

  const currentUser = session!.user; // Non-null après check

  // 2. Récupérer le ticket
  const ticket = await getTicketById(ticketId);

  if (!ticket) {
    notFound();
  }

  // 3. Déterminer l'entreprise courante et la posture via le cookie
  let entrepriseId: string | null = null;
  let posture: "client" | "prestataire" | "plateforme" = "client";

  const cookieStore = await cookies();
  const postureCookie = cookieStore.get("fm4all:postureActive")?.value;

  // Branche plateforme
  const platformRole = await getUserPlateformeAdhesion(currentUser.id);
  if (platformRole?.role && postureCookie === "plateforme") {
    posture = "plateforme";
    entrepriseId = ticket.proprietaireEntrepriseId;
  } else if (postureCookie === "prestataire") {
    // Branche prestataire : ticket doit être assigné à l'entreprise du prestataire
    const prestataireAdhesion = await getUserPrestataireAdhesion({ userId: currentUser.id });
    if (prestataireAdhesion && ticket.assigneEntrepriseId === prestataireAdhesion.entrepriseId) {
      entrepriseId = prestataireAdhesion.entrepriseId;
      posture = "prestataire";
    }
  } else {
    // Branche client (défaut) : vérifier adhesion client
    const proprietaireAdhesion = await getUserClientAdhesion({
      userId: currentUser.id,
      entrepriseId: ticket.proprietaireEntrepriseId,
    });

    if (proprietaireAdhesion) {
      entrepriseId = ticket.proprietaireEntrepriseId;
      posture = "client";
    } else if (ticket.demandeurEntrepriseId) {
      // Cas où un autre client est le demandeur
      const demandeurAdhesion = await getUserClientAdhesion({
        userId: currentUser.id,
        entrepriseId: ticket.demandeurEntrepriseId,
      });

      if (demandeurAdhesion) {
        entrepriseId = ticket.demandeurEntrepriseId;
        posture = "client";
      }
    }
  }

  if (!entrepriseId) {
    notFound();
  }

  // 4. Vérifier permission d'accès au ticket (périmètre site)
  const hasAccess = await canUserAccessTicket({
    userId: currentUser.id,
    ticketId,
    entrepriseId,
  });

  if (!hasAccess) {
    notFound();
  }

  // 5. Calculer les permissions field-level
  const canEditBasicFields = await canUserEditTicketBasicFields({
    userId: currentUser.id,
    ticketId,
    entrepriseId,
  });

  const canEditTypeAndPriorite = await canUserEditTypeAndPriorite({
    userId: currentUser.id,
    ticketId,
    entrepriseId,
  });

  const canEditAssigneEntreprise = await canUserEditAssigneEntrepriseId({
    userId: currentUser.id,
    ticketId,
    entrepriseId,
  });

  const canEditAssigneUser = await canUserEditAssigneUserId({
    userId: currentUser.id,
    ticketId,
    entrepriseId,
  });

  const canEditStatut = await canUserEditStatut({
    userId: currentUser.id,
    ticketId,
    entrepriseId,
  });

  const availableStatuts = await getAvailableStatutsForUser({
    userId: currentUser.id,
    ticketId,
    entrepriseId,
  });

  // 6. Charger les prestataires disponibles (selon posture)
  let availablePrestataires: Array<{ id: string; nom: string }> = [];

  if (canEditAssigneEntreprise) {
    if (posture === "plateforme") {
      availablePrestataires = await getEntreprisesPrestataires();
    } else if (posture === "client") {
      availablePrestataires = await getClientPrestataires(entrepriseId);
    }
  }

  // 7. Charger les utilisateurs du prestataire (si éditable)
  let availableUsers: Array<{ id: string; prenom: string; nom: string }> = [];

  if (canEditAssigneUser && ticket.assigneEntrepriseId) {
    const users = await getUsersByEntrepriseId(ticket.assigneEntrepriseId);

    availableUsers = users.map((u) => ({
      id: u.id,
      prenom: u.prenom,
      nom: u.nom,
    }));
  }

  // 8. Charger le site, ses responsables et les entreprises pour afficher les noms
  const site = await getSiteById(ticket.siteId);
  const siteResponsables: SiteResponsable[] = site
    ? await getSiteResponsables(site.id)
    : [];

  const proprietaireEntreprise = await getEntrepriseById(
    ticket.proprietaireEntrepriseId,
  );
  const demandeurEntreprise = ticket.demandeurEntrepriseId
    ? await getEntrepriseById(ticket.demandeurEntrepriseId)
    : null;
  const assigneEntreprise = ticket.assigneEntrepriseId
    ? await getEntrepriseById(ticket.assigneEntrepriseId)
    : null;

  // 9. Charger les pièces jointes du ticket
  const attachments = await getDocumentsByTicketId(ticketId);

  // 10. Charger les messages (filtrés côté serveur selon la posture)
  const messages = await getTicketMessagesWithAttachments(ticketId, posture);

  // 11. Passer à TicketDetailsClient
  return (
    <TicketDetailsClient
      ticket={ticket}
      entrepriseId={entrepriseId}
      currentUserId={currentUser.id}
      posture={posture}
      permissions={{
        canEditBasicFields,
        canEditTypeAndPriorite,
        canEditAssigneEntreprise,
        canEditAssigneUser,
        canEditStatut,
      }}
      availableStatuts={availableStatuts}
      availablePrestataires={availablePrestataires}
      availableUsers={availableUsers}
      site={site}
      siteResponsables={siteResponsables}
      proprietaireEntreprise={proprietaireEntreprise}
      demandeurEntreprise={demandeurEntreprise}
      assigneEntreprise={assigneEntreprise}
      attachments={attachments}
      messages={messages}
    />
  );
}
