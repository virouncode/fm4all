import { Users } from "lucide-react";
import { Suspense } from "react";
import { UsersClient } from "./UsersClient";

export default function UtilisateursPage() {
  return (
    <div className="container mx-auto px-6 py-4">
      <div className="mb-6 flex items-center gap-2">
        <Users className="text-primary size-6" />
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
      </div>
      <Suspense fallback={<div>Chargement...</div>}>
        <UsersClient />
      </Suspense>
    </div>
  );
}
