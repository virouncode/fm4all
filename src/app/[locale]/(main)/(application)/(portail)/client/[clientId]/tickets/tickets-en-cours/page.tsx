import { LocaleType } from "@/i18n/routing";
import { getTickets } from "@/lib/queries/tickets/getTickets";
import { RawSearchParams } from "@/normalize/normalizeSearchParams";
import { parseTicketsQuery } from "@/zod-schemas/ticket";
import TicketsFiltersForm from "./TicketsFiltersForm";
import TicketsTable from "./TicketsTable";
import { ticketsIdLabelMap } from "./ticketsColumns";

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
    clientId: parseInt(clientId),
    query,
  });

  return (
    <main className="flex h-full w-full flex-col overflow-hidden md:border-x">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">
          Mes tickets en cours
        </h1>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b p-4">
          <TicketsFiltersForm initialFilters={query} />
        </div>
        <div className="min-h-0 flex-1 p-4">
          <TicketsTable
            initialData={initialData}
            initialQuery={query}
            idLabelMap={ticketsIdLabelMap}
            clientId={parseInt(clientId)}
          />
        </div>
      </div>
    </main>
  );
};

export default page;
