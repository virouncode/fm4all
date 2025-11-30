import { LocaleType } from "@/i18n/routing";
import {
  getClientFournisseurs,
  getClientSites,
} from "@/lib/queries/clients/getClients";
import { getInterventions } from "@/lib/queries/interventions/getInterventions";
import { RawSearchParams } from "@/normalize/normalizeSearchParams";
import { parseInterventionsQuery } from "@/zod-schemas/intervention";
import { ticketsIdLabelMap } from "../../tickets/tickets-en-cours/ticketsColumns";
import ClientInterventionsFiltersForm from "./ClientInterventionsFiltersForm";
import ClientInterventionsTable from "./ClientInterventionsTable";

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string; locale: LocaleType }>;
  searchParams: Promise<RawSearchParams>;
}) => {
  const { clientId } = await params;
  const query = parseInterventionsQuery(await searchParams); // <-- Backend type

  const initialData = await getInterventions({
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
          Mes interventions
        </h1>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b p-4">
          <ClientInterventionsFiltersForm
            clientId={parseInt(clientId)}
            sites={sites}
            fournisseurs={fournisseurs}
          />
        </div>
        <div className="min-h-0 flex-1 p-4">
          <ClientInterventionsTable
            initialQuery={query}
            initialData={initialData}
            idLabelMap={ticketsIdLabelMap}
            clientId={parseInt(clientId, 10)}
          />
        </div>
      </div>
    </main>
  );
};

export default page;
