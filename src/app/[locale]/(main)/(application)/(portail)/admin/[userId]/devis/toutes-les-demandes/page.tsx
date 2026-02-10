import { LocaleType } from "@/i18n/routing";
import { RawSearchParams } from "@/normalize/normalizeSearchParams";
import { getClients } from "@/server/queries_a_classer/clients/getClients";
import { getFournisseurs } from "@/server/queries_a_classer/fournisseurs/getFournisseurs";
import { getSites } from "@/server/queries_a_classer/sites/getSites";
import { getAllDevisTickets } from "@/server/queries_a_classer/tickets/getTickets";
import { parseAdminTicketsQuery } from "@/zod-schemas/ticket";
import AdminTicketsFiltersForm from "../../tickets/tous-les-tickets/AdminTicketsFiltersForm";
import AdminTicketsTable from "../../tickets/tous-les-tickets/AdminTicketsTable";
import { adminTicketsIdLabelMap } from "../../tickets/tous-les-tickets/createAdminTicketsColumns";

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string; locale: LocaleType }>;
  searchParams: Promise<RawSearchParams>;
}) => {
  const { userId } = await params;
  const query = parseAdminTicketsQuery(await searchParams);

  // Récupérer tous les clients
  const clients = await getClients();

  // Récupérer tous les sites (pour tous les clients)
  const allSites = await getSites();

  // Récupérer TOUS les fournisseurs (pas filtrés par client)
  const allFournisseurs = await getFournisseurs();

  // fournisseursParClient n'est plus nécessaire car on montre toujours tous les fournisseurs
  const fournisseursParClient: Record<number, typeof allFournisseurs> = {};

  // Utiliser getAllDevisTickets pour ne récupérer que les tickets de type "demande_devis"
  const initialData = await getAllDevisTickets({
    query,
  });

  return (
    <main className="flex h-full w-full flex-col overflow-hidden md:border-x">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">
          Toutes les demandes de devis
        </h1>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b p-4">
          <AdminTicketsFiltersForm
            initialFilters={query}
            clients={clients}
            sites={allSites}
            fournisseursParClient={fournisseursParClient}
            allFournisseurs={allFournisseurs}
            isDevisTickets={true}
          />
        </div>
        <div className="min-h-0 flex-1 p-4">
          <AdminTicketsTable
            initialData={initialData}
            initialQuery={query}
            idLabelMap={adminTicketsIdLabelMap}
            clients={clients}
            sites={allSites}
            fournisseurs={allFournisseurs}
            userId={userId}
            isDevisTickets={true}
          />
        </div>
      </div>
    </main>
  );
};

export default page;
