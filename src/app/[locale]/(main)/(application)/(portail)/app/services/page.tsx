import { Suspense } from "react";
import { ServicesClient } from "./ServicesClient";

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-6 py-4">
      <h1 className="mb-6 text-2xl font-bold">Catalogue des services</h1>
      <Suspense fallback={<div>Chargement...</div>}>
        <ServicesClient />
      </Suspense>
    </div>
  );
}
