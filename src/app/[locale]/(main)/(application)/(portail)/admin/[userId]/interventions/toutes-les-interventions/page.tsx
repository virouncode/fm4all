import { LocaleType } from "@/i18n/routing";
import {
  getClientFournisseurs,
  getClients,
  getClientSites,
} from "@/lib/queries/clients/getClients";
import { getAllInterventions } from "@/lib/queries/interventions/getInterventions";
import { RawSearchParams } from "@/normalize/normalizeSearchParams";
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
