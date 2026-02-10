import { LocaleType } from "@/i18n/routing";
import { RawSearchParams } from "@/normalize/normalizeSearchParams";
import {
  getAllFournisseursWithPagination,
  getFournisseurs,
} from "@/server/queries_a_classer/fournisseurs/getFournisseurs";
import { parseAdminFournisseursQuery } from "@/zod-schemas/fournisseur";
import AdminFournisseursFiltersForm from "./AdminFournisseursFiltersForm";
import AdminFournisseursTable from "./AdminFournisseursTable";
import { adminFournisseursIdLabelMap } from "./createAdminFournisseursColumns";

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string; locale: LocaleType }>;
  searchParams: Promise<RawSearchParams>;
}) => {
  const { userId } = await params;
  const query = parseAdminFournisseursQuery(await searchParams);

  // Récupérer tous les fournisseurs (pour la liste dans les filtres)
  const allFournisseurs = await getFournisseurs();

  // Récupérer les données paginées selon les filtres
  const initialData = await getAllFournisseursWithPagination({
    query,
  });

  return (
    <main className="flex h-full w-full flex-col overflow-hidden md:border-x">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">
          Tous les fournisseurs
        </h1>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b p-4">
          <AdminFournisseursFiltersForm
            initialFilters={query}
            allFournisseurs={allFournisseurs}
          />
        </div>
        <div className="min-h-0 flex-1 p-4">
          <AdminFournisseursTable
            initialData={initialData}
            initialQuery={query}
            idLabelMap={adminFournisseursIdLabelMap}
            userId={userId}
          />
        </div>
      </div>
    </main>
  );
};

export default page;
