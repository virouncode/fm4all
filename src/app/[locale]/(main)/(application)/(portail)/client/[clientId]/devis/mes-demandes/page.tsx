import { LocaleType } from "@/i18n/routing";
import {
  getClientFournisseurs,
  getClientSites,
} from "@/lib/queries/clients/getClients";
import { getDevisTickets } from "@/lib/queries/tickets/getTickets";
import { RawSearchParams } from "@/normalize/normalizeSearchParams";
import { parseTicketsQuery } from "@/zod-schemas/ticket";
import { ticketsIdLabelMap } from "../../tickets/mes-tickets/createTicketsColumns";
import TicketsFiltersForm from "../../tickets/mes-tickets/TicketsFiltersForm";
import TicketsTable from "../../tickets/mes-tickets/TicketsTable";

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string; locale: LocaleType }>;
  searchParams: Promise<RawSearchParams>;
}) => {
  const { clientId } = await params;
  const query = parseTicketsQuery(await searchParams); // <-- Backend type

  const initialData = await getDevisTickets({
    clientId: parseInt(clientId),
    query,
  });

  const [sites, fournisseurs] = await Promise.all([
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
  ]);

  return (
    <main className="flex h-full w-full flex-col overflow-hidden md:border-x">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">
          Mes demandes de devis en cours
        </h1>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b p-4">
          <TicketsFiltersForm
            initialFilters={query}
            isDevisTickets={true}
            sites={sites}
            fournisseurs={fournisseurs}
          />
        </div>
        <div className="min-h-0 flex-1 p-4">
          <TicketsTable
            initialData={initialData}
            initialQuery={query}
            idLabelMap={ticketsIdLabelMap}
            clientId={parseInt(clientId)}
            isDevisTickets={true}
            sites={sites}
            fournisseurs={fournisseurs}
          />
        </div>
      </div>
    </main>
  );
};

export default page;
