import { interventionStatusCT, toCodeTableName } from "@/constants/codeTables";
import { LocaleType } from "@/i18n/routing";
import {
  getClientFournisseurs,
  getClientSites,
} from "@/lib/queries/clients/getClients";
import { getIntervention } from "@/lib/queries/interventions/getInterventions";
import {
  ClientUpdateInterventionFormType,
  InterventionStatusType,
} from "@/zod-schemas/intervention";
import { ReactNode } from "react";
import ClientUpdateInterventionForm from "./ClientUpdateInterventionForm";

const page = async ({
  params,
}: {
  params: Promise<{
    clientId: string;
    interventionId: string;
    locale: LocaleType;
  }>;
}) => {
  const { clientId, interventionId } = await params;
  const [sites, fournisseurs, initialIntervention] = await Promise.all([
    getClientSites({
      clientId: parseInt(clientId),
      query: {
        nomSite: undefined,
        codePostal: undefined,
        ville: undefined,
        typeBatiment: undefined,
        typeOccupation: undefined,
        orderBy: "nomSite",
        orderDir: "asc",
      },
    }),
    getClientFournisseurs(parseInt(clientId)),
    getIntervention(parseInt(interventionId)),
  ]);

  const errorComponent: ReactNode = (
    <main className="flex h-full w-full flex-col overflow-hidden">
      <div className="bg-background/95 shrink-0 border-b p-2">
        <h1 className="text-center text-xl font-bold">
          Intervention introuvable
        </h1>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex justify-center p-6">
          <div className="w-full max-w-3xl pb-8">
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold tracking-tight">
                Modifiez l'intervention
              </h2>
              <p className="text-muted-foreground text-sm">
                Modifiez les détails de l'intervention ci-dessous
              </p>
            </div>
            <div>
              {sites.length === 0
                ? "Vous n'avez pas encore ajouté de site pour votre entreprise"
                : !initialIntervention
                  ? `L'intervention ${interventionId} n'existe pas`
                  : "Vous n'avez pas encore ajouté de fournisseur pour votre entreprise"}
            </div>
          </div>
        </div>
      </div>
    </main>
  );

  if (sites.length === 0 || fournisseurs.length === 0 || !initialIntervention) {
    return errorComponent;
  }

  const defaultValues: ClientUpdateInterventionFormType = {
    id: initialIntervention.id,
    titre: initialIntervention.titre,
    description: initialIntervention.description,
    dateDebutPrevue: initialIntervention.dateDebutPrevue
      ? initialIntervention.dateDebutPrevue.toISOString()
      : "",
    dateFinPrevue: initialIntervention.dateFinPrevue
      ? initialIntervention.dateFinPrevue.toISOString()
      : "",
    type: initialIntervention.type,
    status: initialIntervention.status,
    confirmeeClient: true,
    confirmeeFournisseur: initialIntervention.confirmeeFournisseur,
    siteId: initialIntervention.siteId,
    fournisseurId: initialIntervention.fournisseurId,
  };

  const isReadOnly =
    defaultValues.status === "annulee" ||
    defaultValues.status === "en_cours" ||
    defaultValues.status === "realisee" ||
    defaultValues.status === "non_honoree";

  return (
    <main className="flex h-full w-full flex-col overflow-hidden">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">
          Intervention "{initialIntervention.titre}" (n°{initialIntervention.id}
          )
        </h1>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex justify-center p-6">
          <div className="w-full max-w-3xl pb-8">
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold tracking-tight">
                {isReadOnly
                  ? "Détails de l'intervention"
                  : "Modifiez l'intervention"}
              </h2>
              <p
                className={`text-muted-foreground text-sm ${isReadOnly ? "text-red-500" : undefined}`}
              >
                {isReadOnly
                  ? `L'intervention ne peut être modifiée (lecture seule). Etat de l'intervention : ${toCodeTableName(defaultValues.status as InterventionStatusType, interventionStatusCT)}`
                  : "Modifiez les détails de l'intervention ci-dessous"}
              </p>
            </div>
            <ClientUpdateInterventionForm
              defaultValues={defaultValues}
              clientId={parseInt(clientId)}
              sites={sites}
              fournisseurs={fournisseurs}
              isReadOnly={isReadOnly}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default page;
