import { LocaleType } from "@/i18n/routing";
import { RawSearchParams } from "@/normalize/normalizeSearchParams";
import { getClients } from "@/server/queries_a_classer/clients/getClients";
import { getFournisseurs } from "@/server/queries_a_classer/fournisseurs/getFournisseurs";
import { getAllInterventions } from "@/server/queries_a_classer/interventions/getInterventions";
import { getSites } from "@/server/queries_a_classer/sites/getSites";
import { parseAdminInterventionsQuery } from "@/zod-schemas/intervention";
import AdminInterventionsFiltersForm from "./AdminInterventionsFiltersForm";
import AdminInterventionsTable from "./AdminInterventionsTable";
import { adminInterventionsIdLabelMap } from "./createAdminInterventionsColumns";

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string; locale: LocaleType }>;
  searchParams: Promise<RawSearchParams>;
}) => {
  const { userId } = await params;
  const query = parseAdminInterventionsQuery(await searchParams);

  // Récupérer tous les clients
  const clients = await getClients();

  // Récupérer tous les sites (pour tous les clients)
  const allSites = await getSites();

  // Récupérer TOUS les fournisseurs (pas filtrés par client)
  const allFournisseurs = await getFournisseurs();

  // fournisseursParClient n'est plus nécessaire car on montre toujours tous les fournisseurs
  const fournisseursParClient: Record<number, typeof allFournisseurs> = {};

  const initialData = await getAllInterventions({
    query,
  });

  return (
    <main className="flex h-full w-full flex-col overflow-hidden md:border-x">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">
          Toutes les interventions
        </h1>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b p-4">
          <AdminInterventionsFiltersForm
            initialFilters={query}
            clients={clients}
            sites={allSites}
            fournisseursParClient={fournisseursParClient}
            allFournisseurs={allFournisseurs}
          />
        </div>
        <div className="min-h-0 flex-1 p-4">
          <AdminInterventionsTable
            initialData={initialData}
            initialQuery={query}
            idLabelMap={adminInterventionsIdLabelMap}
            clients={clients}
            sites={allSites}
            fournisseurs={allFournisseurs}
            userId={userId}
          />
        </div>
      </div>
    </main>
  );
};

export default page;
