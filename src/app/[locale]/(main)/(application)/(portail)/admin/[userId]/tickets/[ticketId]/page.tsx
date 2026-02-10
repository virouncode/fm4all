import { LocaleType } from "@/i18n/routing";
import {
  getClient,
  getClientSites,
} from "@/server/queries_a_classer/clients/getClients";
import { getFournisseurs } from "@/server/queries_a_classer/fournisseurs/getFournisseurs";
import { getTicket } from "@/server/queries_a_classer/tickets/getTickets";
import { UpdateTicketFormType } from "@/zod-schemas/ticket";
import { ReactNode } from "react";
import AdminUpdateTicketForm from "./AdminUpdateTicketForm";

const page = async ({
  params,
}: {
  params: Promise<{ userId: string; ticketId: string; locale: LocaleType }>;
}) => {
  const { userId, ticketId } = await params;

  // Récupérer le ticket d'abord pour avoir le clientId
  const initialTicket = await getTicket(parseInt(ticketId));

  if (!initialTicket) {
    return (
      <main className="flex h-full w-full flex-col overflow-hidden md:border-x">
        <div className="bg-background/95 shrink-0 border-b">
          <h1 className="py-2 text-center text-xl font-bold">
            Ticket introuvable
          </h1>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 items-center justify-center p-4">
            <p className="text-muted-foreground">
              Le ticket n°{ticketId} n&apos;existe pas.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const clientId = initialTicket.clientId;

  // Récupérer les données liées au client du ticket + tous les fournisseurs
  const [client, sites, fournisseurs] = await Promise.all([
    getClient(clientId),
    getClientSites({
      clientId,
      query: {
        nomSite: undefined,
        codePostal: undefined,
        ville: undefined,
        typeBatiment: undefined,
        typeOccupation: undefined,
        orderBy: "nomSite",
        orderDir: "asc",
      },
    }),
    getFournisseurs(), // Tous les fournisseurs pour l'admin
  ]);

  const errorComponent: ReactNode = (
    <main className="flex h-full w-full flex-col overflow-hidden">
      <div className="bg-background/95 shrink-0 border-b p-2">
        <h1 className="text-center text-xl font-bold">Erreur</h1>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex justify-center p-6">
          <div className="w-full max-w-3xl pb-8">
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold tracking-tight">
                Modifiez le ticket
              </h2>
              <p className="text-muted-foreground text-sm">
                Une erreur s&apos;est produite
              </p>
            </div>
            <div>
              {!client
                ? "Le client associé à ce ticket n'existe pas"
                : sites.length === 0
                  ? "Ce client n'a pas de site configuré"
                  : "Aucun fournisseur disponible"}
            </div>
          </div>
        </div>
      </div>
    </main>
  );

  if (!client || sites.length === 0 || fournisseurs.length === 0) {
    return errorComponent;
  }

  const defaultValues: UpdateTicketFormType = {
    id: initialTicket.id,
    titre: initialTicket.titre,
    type: initialTicket.type,
    categorie: initialTicket.categorie,
    fournisseurId: initialTicket.fournisseurId.toString(),
    description: initialTicket.description ?? "",
    priorite: initialTicket.priorite,
    status: initialTicket.status,
    attachments: initialTicket.attachments ?? [],
    siteId: initialTicket.siteId.toString(),
  };

  return (
    <main className="flex h-full w-full flex-col overflow-hidden">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">
          Ticket &quot;{initialTicket.titre}&quot; (n°{initialTicket.id})
        </h1>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex justify-center p-6">
          <div className="w-full max-w-3xl pb-8">
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold tracking-tight">
                Modifiez le ticket
              </h2>
              <p className="text-muted-foreground text-sm">
                Modifier les détails du ticket ci-dessous
              </p>
            </div>
            <AdminUpdateTicketForm
              defaultValues={defaultValues}
              clientId={clientId}
              clientName={client.nomEntreprise}
              sites={sites}
              fournisseurs={fournisseurs}
              userId={userId}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default page;
