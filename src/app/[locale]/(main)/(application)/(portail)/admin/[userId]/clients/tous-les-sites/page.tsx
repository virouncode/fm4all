import { LocaleType } from "@/i18n/routing";
import { RawSearchParams } from "@/normalize/normalizeSearchParams";
import { getClients } from "@/server/queries_a_classer/clients/getClients";
import {
  getAllSitesWithPagination,
  getSites,
} from "@/server/queries_a_classer/sites/getSites";
import { parseAdminSitesQuery } from "@/zod-schemas/site";
import AdminSitesFiltersForm from "./AdminSitesFiltersForm";
import AdminSitesTable from "./AdminSitesTable";
import { adminSitesIdLabelMap } from "./createAdminSitesColumns";

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string; locale: LocaleType }>;
  searchParams: Promise<RawSearchParams>;
}) => {
  const { userId } = await params;
  const query = parseAdminSitesQuery(await searchParams);

  // Récupérer tous les clients (pour les filtres et pour afficher les noms)
  const allClients = await getClients();

  // Récupérer tous les sites (pour le select nomSite dans les filtres)
  const allSites = await getSites();

  // Récupérer les données paginées selon les filtres
  const initialData = await getAllSitesWithPagination({
    query,
  });

  return (
    <main className="flex h-full w-full flex-col overflow-hidden md:border-x">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">Tous les sites</h1>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b p-4">
          <AdminSitesFiltersForm
            initialFilters={query}
            clients={allClients}
            allSites={allSites}
          />
        </div>
        <div className="min-h-0 flex-1 p-4">
          <AdminSitesTable
            initialData={initialData}
            initialQuery={query}
            idLabelMap={adminSitesIdLabelMap}
            userId={userId}
            clients={allClients}
          />
        </div>
      </div>
    </main>
  );
};

export default page;
