import { Handshake } from "lucide-react";
import { DevisPageClient } from "./DevisPageClient";

type SearchParamsType = {
  tab?: string;
  statut?: string;
  siteId?: string;
  search?: string;
  orderBy?: string;
  orderDir?: string;
};

type DevisPageProps = {
  searchParams: Promise<SearchParamsType>;
};

export default async function DevisPage({ searchParams }: DevisPageProps) {
  const params = await searchParams;
  const activeTab =
    params.tab === "propositions" ? "propositions" : "demandes";

  return (
    <div className="container mx-auto flex h-full flex-col px-6 py-4">
      <div className="mb-6 flex flex-shrink-0 items-center gap-2">
        <Handshake className="text-primary size-6" />
        <h1 className="flex-shrink-0 text-2xl font-bold">Devis</h1>
      </div>

      <DevisPageClient activeTab={activeTab} searchParams={params} />
    </div>
  );
}
