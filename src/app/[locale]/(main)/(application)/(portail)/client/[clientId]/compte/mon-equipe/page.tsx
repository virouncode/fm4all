import { LocaleType } from "@/i18n/routing";
import { RawSearchParams } from "@/normalize/normalizeSearchParams";
import { getClientUsers } from "@/server/queries_a_classer/clients/getClients";
import { parseClientUsersQuery } from "@/zod-schemas/user";
import ClientUsersFiltersForm from "./ClientUsersFiltersForm";
import ClientUsersTable from "./ClientUsersTable";
import { clientUsersIdLabelMap } from "./clientUsersColumns";

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string; locale: LocaleType }>;
  searchParams: Promise<RawSearchParams>;
}) => {
  const { clientId } = await params;
  const query = parseClientUsersQuery(await searchParams); // <-- Backend type

  const initialData = await getClientUsers({
    clientId: parseInt(clientId),
    query,
  });

  return (
    <main className="flex h-full w-full flex-col overflow-hidden md:border-x">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">Mon équipe</h1>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b p-4">
          <ClientUsersFiltersForm
            initialFilters={query}
            clientId={parseInt(clientId)}
          />
        </div>
        <div className="min-h-0 flex-1 p-4">
          <ClientUsersTable
            items={initialData}
            idLabelMap={clientUsersIdLabelMap}
            clientId={parseInt(clientId)}
          />
        </div>
      </div>
    </main>
  );
};

export default page;
