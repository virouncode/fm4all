import { LocaleType } from "@/i18n/routing";
import { getSession } from "@/lib/auth-session";
import {
  getClientFournisseurs,
  getClientSites,
} from "@/lib/queries/clients/getClients";
import { getTicket } from "@/lib/queries/tickets/getTickets";
import { UpdateTicketFormType } from "@/zod-schemas/ticket";
import { ReactNode } from "react";
import UpdateTicketForm from "./UpdateTicketForm";

const page = async ({
  params,
}: {
  params: Promise<{ clientId: string; ticketId: string; locale: LocaleType }>;
}) => {
  const { clientId, ticketId } = await params;
  const [sites, fournisseurs, initialTicket] = await Promise.all([
    getClientSites({
      clientId: parseInt(clientId),
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
    getClientFournisseurs(parseInt(clientId)),
    getTicket(parseInt(ticketId)),
  ]);

  const currentSession = await getSession();
  const currentRole = currentSession?.user?.role;

  if (
    !currentRole ||
    (currentRole !== "client_admin" && currentRole !== "admin")
  ) {
    return (
      <main className="flex h-full w-full flex-col overflow-hidden md:border-x">
        <div className="bg-background/95 shrink-0 border-b">
          <h1 className="py-2 text-center text-xl font-bold">
            Modifiez le ticket
          </h1>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 items-center justify-center p-4">
            <p className="text-muted-foreground">
              Vous n'avez pas la permission d'accéder à cette page.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const isClientAdmin = currentRole === "client_admin";

  const errorComponent: ReactNode = (
    <main className="flex h-full w-full flex-col overflow-hidden">
      <div className="bg-background/95 shrink-0 border-b p-2">
        <h1 className="text-center text-xl font-bold">Ticket introuvable</h1>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex justify-center p-6">
          <div className="w-full max-w-3xl pb-8">
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold tracking-tight">
                Modifiez le ticket
              </h2>
              <p className="text-muted-foreground text-sm">
                Modifiez les détails du ticket ci-dessous
              </p>
            </div>
            <div>
              {sites.length === 0
                ? "Vous n'avez pas encore ajouté de site pour votre entreprise"
                : !initialTicket
                  ? `Le ticket ${ticketId} n'existe pas`
                  : "Vous n'avez pas encore ajouté de fournisseur pour votre entreprise"}
            </div>
          </div>
        </div>
      </div>
    </main>
  );

  if (sites.length === 0 || fournisseurs.length === 0 || !initialTicket) {
    return errorComponent;
  }

  const defaultValues: UpdateTicketFormType = {
    id: initialTicket.id,
    titre: initialTicket.titre,
    categorie: initialTicket.categorie,
    fournisseurId:
      initialTicket.fournisseurId?.toString() ?? fournisseurs[0].id.toString(),
    description: initialTicket.description ?? "",
    priorite: initialTicket.priorite,
    status: initialTicket.status,
    attachments: initialTicket.attachments ?? [],
    siteId: initialTicket.siteId?.toString() ?? sites[0].id.toString(),
  };

  return (
    <main className="flex h-full w-full flex-col overflow-hidden">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">
          Ticket "{initialTicket.titre}" (n°{initialTicket.id})
        </h1>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex justify-center p-6">
          <div className="w-full max-w-3xl pb-8">
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold tracking-tight">
                {isClientAdmin ? "Modifiez le ticket" : "Détails du ticket"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {isClientAdmin
                  ? "Modifiez les détails du ticket ci-dessous"
                  : "Vous n'avez pas la permission de modifier ce ticket"}
              </p>
            </div>
            <UpdateTicketForm
              defaultValues={defaultValues}
              clientId={parseInt(clientId)}
              sites={sites}
              fournisseurs={fournisseurs}
              isReadOnly={!isClientAdmin}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default page;
