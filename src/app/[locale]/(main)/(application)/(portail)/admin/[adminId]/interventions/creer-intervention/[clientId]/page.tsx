import { LocaleType } from "@/i18n/routing";
import {
  getClientFournisseurs,
  getClientSites,
} from "@/lib/queries/clients/getClients";
import { ReactNode } from "react";
import NouveauInterventionForm from "./NouveauInterventionForm";
import { InsertInterventionType } from "@/zod-schemas/intervention";

const page = async ({
  params,
}: {
  params: Promise<{ clientId: string; locale: LocaleType }>;
}) => {
  const { clientId } = await params;

  const [sites, fournisseurs] = await Promise.all([
    getClientSites(parseInt(clientId)),
    getClientFournisseurs(parseInt(clientId)),
  ]);

  const errorComponent: ReactNode = (
    <main className="flex h-full w-full flex-col overflow-hidden">
      <div className="bg-background/95 shrink-0 border-b p-2">
        <h1 className="text-center text-xl font-bold">
          Programmer une intervention
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
            <div>
              {sites.length === 0
                ? "Vous n'avez pas encore ajouté de site pour votre entreprise"
                : "Vous n'avez pas encore ajouté de fournisseur pour votre entreprise"}
            </div>
          </div>
        </div>
      </div>
    </main>
  );

  if (sites.length === 0 || fournisseurs.length === 0) {
    return errorComponent;
  }

  const defaultValues: InsertInterventionType = {
    titre: "",
    description: "",
    type: "corrective",
    siteId: sites[0].id,
    fournisseurId: fournisseurs[0].id,
    clientId: parseInt(clientId),
  };

  return (
    <main className="flex h-full w-full flex-col overflow-hidden">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">
          Programmer une intervention
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
              clientId={parseInt(clientId, 10)}
              sites={sites}
              fournisseurs={fournisseurs}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default page;
