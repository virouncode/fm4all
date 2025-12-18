import { getClients } from "@/lib/queries/clients/getClients";
import { getFournisseurs } from "@/lib/queries/fournisseurs/getFournisseurs";
import { InsertInterventionFormType } from "@/zod-schemas/intervention";
import { ReactNode } from "react";
import NouveauInterventionForm from "./NouveauInterventionForm";

const page = async () => {
  const [clients, fournisseurs] = await Promise.all([
    getClients(),
    getFournisseurs(),
  ]);

  const errorComponent: ReactNode = (
    <main className="flex h-full w-full flex-col overflow-hidden">
      <div className="bg-background/95 shrink-0 border-b p-2">
        <h1 className="text-center text-xl font-bold">Nouvelle intervention</h1>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex justify-center p-6">
          <div className="w-full max-w-3xl pb-8">
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold tracking-tight">
                Ajoutez une nouvelle intervention
              </h2>
              <p className="text-muted-foreground text-sm">
                Ajoutez les détails de la nouvelle intervention ci-dessous
              </p>
            </div>
            <div>
              {clients.length === 0
                ? "Clients introuvables"
                : "Fournisseurs introuvables"}
            </div>
          </div>
        </div>
      </div>
    </main>
  );

  if (clients.length === 0 || fournisseurs.length === 0) {
    return errorComponent;
  }

  const defaultValues: InsertInterventionFormType = {
    titre: "",
    type: "corrective",
    siteId: "0",
    clientId: "",
    ticketId: "0",
    fournisseurId: "0",
    dateDebutPrevue: "",
    dateFinPrevue: "",
    description: "",
  };

  return (
    <main className="flex h-full w-full flex-col overflow-hidden">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">
          Nouvelle intervention
        </h1>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex justify-center p-6">
          <div className="w-full max-w-3xl pb-8">
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold tracking-tight">
                Ajoutez une nouvelle intervention
              </h2>
              <p className="text-muted-foreground text-sm">
                Ajoutez les détails de la nouvelle intervention ci-dessous
              </p>
            </div>
            <NouveauInterventionForm
              defaultValues={defaultValues}
              clients={clients}
              fournisseurs={fournisseurs}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default page;
