import { LocaleType } from "@/i18n/routing";
import { getClientSites } from "@/lib/queries/clients/getClients";
import { RawSearchParams } from "@/normalize/normalizeSearchParams";
import { parseSitesQuery } from "@/zod-schemas/site";
import ClientSitesFiltersForm from "./ClientSitesFiltersForm";
import ClientSitesTable from "./ClientSitesTable";
import { sitesIdLabelMap } from "./sitesColumns";

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string; locale: LocaleType }>;
  searchParams: Promise<RawSearchParams>;
}) => {
  const { clientId } = await params;
  const query = parseSitesQuery(await searchParams);
  const initialData = await getClientSites({
    clientId: parseInt(clientId),
    query,
  });

  console.log("initialData", initialData);

  return (
    <main className="flex h-full w-full flex-col overflow-hidden md:border-x">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">Mes sites</h1>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b p-4">
          <ClientSitesFiltersForm clientId={parseInt(clientId)} />
        </div>
        <div className="min-h-0 flex-1 p-4">
          <ClientSitesTable
            initialQuery={query}
            initialData={initialData}
            idLabelMap={sitesIdLabelMap}
            clientId={parseInt(clientId, 10)}
          />
        </div>
      </div>
    </main>
  );
};

export default page;
