import { getProspects } from "@/lib/queries/prospects/getProspects";
import { RawSearchParams } from "@/normalize/normalizeSearchParams";
import { parseProspectsQuery } from "@/zod-schemas/prospect";
import { ticketsIdLabelMap } from "../../../../client/[clientId]/tickets/tickets-en-cours/createTicketsColumns";
import ProspectsFiltersForm from "./ProspectsFiltersForm";
import ProspectsTable from "./ProspectsTable";

const page = async ({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) => {
  const query = parseProspectsQuery(await searchParams);
  const initialData = await getProspects({
    query,
  });

  return (
    <main className="flex h-full w-full flex-col overflow-hidden md:border-x">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">
          Tous les prospects
        </h1>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b p-4">
          <ProspectsFiltersForm initialFilters={query} />
        </div>
        <div className="min-h-0 flex-1 p-4">
          <ProspectsTable
            initialData={initialData}
            initialQuery={query}
            idLabelMap={ticketsIdLabelMap}
          />
        </div>
      </div>
    </main>
  );
};

export default page;
