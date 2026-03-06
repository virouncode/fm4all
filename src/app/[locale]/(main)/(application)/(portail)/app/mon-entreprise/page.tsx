import { Building } from "lucide-react";
import { MonEntrepriseClient } from "./MonEntrepriseClient";

export default function MonEntreprisePage() {
  return (
    <div className="flex h-full flex-col">
      <div className="container mx-auto mb-6 flex flex-shrink-0 items-center gap-2 px-6 pt-4">
        <Building className="text-primary size-6" />
        <h1 className="flex-shrink-0 text-2xl font-bold">Mon entreprise</h1>
      </div>
      <div className="flex-1 overflow-auto">
        <MonEntrepriseClient />
      </div>
    </div>
  );
}
