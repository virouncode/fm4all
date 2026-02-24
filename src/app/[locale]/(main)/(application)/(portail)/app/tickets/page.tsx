import { Suspense } from "react";
import { TicketsTable } from "./TicketsTable";

type SearchParams = {
  // Filtres
  search?: string;
  statut?: string;
  priorite?: string;
  type?: string;
  siteId?: string;
  proprietaireEntrepriseId?: string;
  demandeurEntrepriseId?: string;
  assigneEntrepriseId?: string;

  // Tri
  orderBy?: string;
  orderDir?: string;
};

type TicketsPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
  const params = await searchParams;

  return (
    <div className="container mx-auto h-full px-6 py-4">
      <h1 className="mb-6 text-2xl font-bold">Gestion des tickets</h1>

      <Suspense fallback={<div>Chargement...</div>}>
        <TicketsTable searchParams={params} />
      </Suspense>
    </div>
  );
}
