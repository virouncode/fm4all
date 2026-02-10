import { LocaleType } from "@/i18n/routing";
import { RawSearchParams } from "@/normalize/normalizeSearchParams";
import {
  getClientDevis,
  getClientFournisseurs,
  getClientSites,
} from "@/server/queries_a_classer/clients/getClients";
import { parseDevisQuery } from "@/zod-schemas/devis";
import { devisIdLabelMap } from "./createDevisColumns";
import DevisFiltersForm from "./DevisFiltersForm";
import DevisTable from "./DevisTable";

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string; locale: LocaleType }>;
  searchParams: Promise<RawSearchParams>;
}) => {
  const { clientId } = await params;
  const query = parseDevisQuery(await searchParams); // <-- Backend type

  const devis = await getClientDevis({
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
        <h1 className="py-2 text-center text-xl font-bold">Mes devis</h1>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b p-4">
          <DevisFiltersForm
            initialFilters={query}
            sites={sites}
            fournisseurs={fournisseurs}
          />
        </div>
        <div className="min-h-0 flex-1 p-4">
          <DevisTable
            items={devis}
            idLabelMap={devisIdLabelMap}
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
