import { Suspense } from "react";
import { TicketsTable } from "./TicketsTable";

export default function TicketsPage() {
  return (
    <div className="container mx-auto h-full px-6 py-4">
      <h1 className="mb-6 text-2xl font-bold">Gestion des tickets</h1>

      <Suspense fallback={<div>Chargement...</div>}>
        <TicketsTable />
      </Suspense>
    </div>
  );
}
