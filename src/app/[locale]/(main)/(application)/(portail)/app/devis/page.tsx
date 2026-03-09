import { Handshake } from "lucide-react";
import { Suspense } from "react";
import { DevisTable } from "./DevisTable";

type SearchParamsType = {
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

  return (
    <div className="container mx-auto flex h-full flex-col px-6 py-4">
      <div className="mb-6 flex flex-shrink-0 items-center gap-2">
        <Handshake className="text-primary size-6" />
        <h1 className="flex-shrink-0 text-2xl font-bold">Devis</h1>
      </div>

      <div className="flex-1 overflow-hidden">
        <Suspense fallback={<div>Chargement...</div>}>
          <DevisTable searchParams={params} />
        </Suspense>
      </div>
    </div>
  );
}
