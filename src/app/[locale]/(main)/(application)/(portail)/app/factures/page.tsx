import { Euro } from "lucide-react";
import { FacturesPageClient } from "./FacturesPageClient";

type SearchParamsType = {
  tab?: string;
  statut?: string;
  modeCommercialSnapshot?: string;
  siteId?: string;
  clientId?: string;
  emetteurId?: string;
  serviceId?: string;
  search?: string;
  orderBy?: string;
  orderDir?: string;
};

type FacturesPageProps = {
  searchParams: Promise<SearchParamsType>;
};

export default async function FacturesPage({ searchParams }: FacturesPageProps) {
  const params = await searchParams;
  const activeTab = params.tab === "recues" ? "recues" : "emises";

  return (
    <div className="container mx-auto flex h-full flex-col px-6 py-4">
      <div className="mb-6 flex flex-shrink-0 items-center gap-2">
        <Euro className="text-primary size-6" />
        <h1 className="flex-shrink-0 text-2xl font-bold">Factures</h1>
      </div>

      <FacturesPageClient activeTab={activeTab} searchParams={params} />
    </div>
  );
}
