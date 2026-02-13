import { Suspense } from "react";
import { SitesClient } from "./SitesClient";

export default function SitesPage() {
  return (
    <div className="container mx-auto px-6 py-4">
      <h1 className="mb-6 text-2xl font-bold">Gestion des sites</h1>
      <Suspense fallback={<div>Chargement...</div>}>
        <SitesClient />
      </Suspense>
    </div>
  );
}
