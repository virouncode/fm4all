import { Suspense } from "react";
import { UsersClient } from "./UsersClient";

export default function UtilisateursPage() {
  return (
    <div className="container mx-auto px-6 py-4">
      <h1 className="mb-6 text-2xl font-bold">Gestion des utilisateurs</h1>
      <Suspense fallback={<div>Chargement...</div>}>
        <UsersClient />
      </Suspense>
    </div>
  );
}
