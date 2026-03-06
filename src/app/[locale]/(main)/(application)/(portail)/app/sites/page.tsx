import { MapPin } from "lucide-react";
import { Suspense } from "react";
import { SitesClient } from "./SitesClient";

export default function SitesPage() {
  return (
    <div className="container mx-auto px-6 py-4">
      <div className="mb-6 flex items-center gap-2">
        <MapPin className="text-primary size-6" />
        <h1 className="text-2xl font-bold">Gestion des sites</h1>
      </div>
      <Suspense fallback={<div>Chargement...</div>}>
        <SitesClient />
      </Suspense>
    </div>
  );
}
