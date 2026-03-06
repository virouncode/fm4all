import { Ticket } from "lucide-react";
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
    <div className="container mx-auto flex h-full flex-col px-6 py-4">
      <div className="mb-6 flex flex-shrink-0 items-center gap-2">
        <Ticket className="text-primary size-6" />
        <h1 className="flex-shrink-0 text-2xl font-bold">Tickets</h1>
      </div>

      <div className="flex-1 overflow-hidden">
        <Suspense fallback={<div>Chargement...</div>}>
          <TicketsTable searchParams={params} />
        </Suspense>
      </div>
    </div>
  );
}
