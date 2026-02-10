import { LocaleType } from "@/i18n/routing";
import { RawSearchParams } from "@/normalize/normalizeSearchParams";
import {
  getAllClientsWithPagination,
  getClients,
} from "@/server/queries_a_classer/clients/getClients";
import { parseClientsQuery } from "@/zod-schemas/client.schema";
import AdminClientsFiltersForm from "./AdminClientsFiltersForm";
import AdminClientsTable from "./AdminClientsTable";
import { adminClientsIdLabelMap } from "./createAdminClientsColumns";

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string; locale: LocaleType }>;
  searchParams: Promise<RawSearchParams>;
}) => {
  const { userId } = await params;
  const query = parseClientsQuery(await searchParams);

  // Récupérer tous les clients (pour le select du formulaire de filtres)
  const allClients = await getClients();

  // Récupérer les données paginées selon les filtres
  const initialData = await getAllClientsWithPagination({
    query,
  });

  return (
    <main className="flex h-full w-full flex-col overflow-hidden md:border-x">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">Tous les clients</h1>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b p-4">
          <AdminClientsFiltersForm
            initialFilters={query}
            clients={allClients}
          />
        </div>
        <div className="min-h-0 flex-1 p-4">
          <AdminClientsTable
            initialData={initialData}
            initialQuery={query}
            idLabelMap={adminClientsIdLabelMap}
            userId={userId}
          />
        </div>
      </div>
    </main>
  );
};

export default page;
