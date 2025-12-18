import { LocaleType } from "@/i18n/routing";
import {
  getClientFournisseurs,
  getClientSites,
} from "@/lib/queries/clients/getClients";
import { getTickets } from "@/lib/queries/tickets/getTickets";
import { RawSearchParams } from "@/normalize/normalizeSearchParams";
import { parseTicketsQuery } from "@/zod-schemas/ticket";
import { ticketsIdLabelMap } from "../mes-tickets/createTicketsColumns";
import TicketsTable from "../mes-tickets/TicketsTable";

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string; locale: LocaleType }>;
  searchParams: Promise<RawSearchParams>;
}) => {
  const { clientId } = await params;
  const query = parseTicketsQuery(await searchParams); // <-- Backend type

  const initialData = await getTickets({
    clientId: parseInt(clientId, 10),
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
          Mes tickets à valider
        </h1>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 p-4">
          <TicketsTable
            initialQuery={query}
            initialData={initialData}
            idLabelMap={ticketsIdLabelMap}
            clientId={parseInt(clientId)}
            sites={sites}
            fournisseurs={fournisseurs}
          />
        </div>
      </div>
    </main>
  );
};

export default page;
