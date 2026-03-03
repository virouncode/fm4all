import { Suspense } from "react";
import PrestationsClient from "./PrestationsClient";

type SearchParams = {
  statut?: string;
  serviceId?: string;
  siteId?: string;
  modeCommercial?: string;
  clientEntrepriseId?: string;
  orderBy?: string;
  orderDir?: string;
};

type PrestationsPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function PrestationsPage({
  searchParams,
}: PrestationsPageProps) {
  const params = await searchParams;

  return (
    <div className="container mx-auto flex h-full flex-col px-6 py-4">
      <h1 className="mb-6 flex-shrink-0 text-2xl font-bold">Prestations</h1>

      <div className="flex-1 overflow-hidden">
        <Suspense fallback={<div>Chargement...</div>}>
          <PrestationsClient searchParams={params} />
        </Suspense>
      </div>
    </div>
  );
}
