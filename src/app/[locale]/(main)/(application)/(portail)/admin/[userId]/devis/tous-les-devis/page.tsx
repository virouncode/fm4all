import { LocaleType } from "@/i18n/routing";
import { RawSearchParams } from "@/normalize/normalizeSearchParams";
import { getClients } from "@/server/queries_a_classer/clients/getClients";
import { getAllDevis } from "@/server/queries_a_classer/devis/getDevis";
import { getFournisseurs } from "@/server/queries_a_classer/fournisseurs/getFournisseurs";
import { getSites } from "@/server/queries_a_classer/sites/getSites";
import { parseAdminDevisQuery } from "@/zod-schemas/devis";
import AdminDevisFiltersForm from "./AdminDevisFiltersForm";
import AdminDevisTable from "./AdminDevisTable";
import { adminDevisIdLabelMap } from "./createAdminDevisColumns";

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string; locale: LocaleType }>;
  searchParams: Promise<RawSearchParams>;
}) => {
  const { userId } = await params;
  const query = parseAdminDevisQuery(await searchParams);

  // Récupérer tous les clients
  const clients = await getClients();

  // Récupérer tous les sites (pour tous les clients)
  const allSites = await getSites();

  // Récupérer TOUS les fournisseurs (pas filtrés par client)
  const allFournisseurs = await getFournisseurs();

  const devis = await getAllDevis({
    query,
  });

  return (
    <main className="flex h-full w-full flex-col overflow-hidden md:border-x">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">Tous les devis</h1>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b p-4">
          <AdminDevisFiltersForm
            initialFilters={query}
            clients={clients}
            sites={allSites}
            allFournisseurs={allFournisseurs}
          />
        </div>
        <div className="min-h-0 flex-1 p-4">
          <AdminDevisTable
            items={devis}
            idLabelMap={adminDevisIdLabelMap}
            userId={userId}
            clients={clients}
            sites={allSites}
            fournisseurs={allFournisseurs}
          />
        </div>
      </div>
    </main>
  );
};

export default page;
