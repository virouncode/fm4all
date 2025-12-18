import { LocaleType } from "@/i18n/routing";
import {
  getClientFournisseurs,
  getClients,
  getClientSites,
} from "@/lib/queries/clients/getClients";
import { getAllDevisTickets } from "@/lib/queries/tickets/getTickets";
import { RawSearchParams } from "@/normalize/normalizeSearchParams";
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

  // Récupérer tous les sites de tous les clients
  const allSites = await Promise.all(
    clients.map((client) =>
      getClientSites({
        clientId: client.id,
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
    ),
  ).then((results) => results.flat());

  // Récupérer les fournisseurs par client (Record pour sérialisation)
  const fournisseursParClientEntries = await Promise.all(
    clients.map(async (client) => {
      const fournisseurs = await getClientFournisseurs(client.id);
      return [client.id, fournisseurs] as const;
    }),
  );
  // Utiliser un Record au lieu de Map pour la sérialisation Server -> Client
  const fournisseursParClient: Record<
    number,
    (typeof fournisseursParClientEntries)[0][1]
  > = {};
  for (const [clientId, fournisseurs] of fournisseursParClientEntries) {
    fournisseursParClient[clientId] = fournisseurs;
  }

  // Tous les fournisseurs (flat)
  const allFournisseurs = fournisseursParClientEntries.flatMap(([, f]) => f);

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
