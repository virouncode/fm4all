import { interventionStatusCT, toCodeTableName } from "@/constants/codeTables";
import { LocaleType } from "@/i18n/routing";
import { getSession } from "@/server/auth/get-session";
import {
  getClientFournisseurs,
  getClientSites,
} from "@/server/queries_a_classer/clients/getClients";
import { getIntervention } from "@/server/queries_a_classer/interventions/getInterventions";
import { InterventionStatusType } from "@/zod-schemas/enums";
import { UpdateInterventionFormType } from "@/zod-schemas/intervention";
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

  const currentSession = await getSession();
  const currentRole = currentSession?.user?.role;

  if (
    !currentRole ||
    (currentRole !== "client_admin" && currentRole !== "admin")
  ) {
    return (
      <main className="flex h-full w-full flex-col overflow-hidden md:border-x">
        <div className="bg-background/95 shrink-0 border-b">
          <h1 className="py-2 text-center text-xl font-bold">
            Modifiez l&apos;intervention
          </h1>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 items-center justify-center p-4">
            <p className="text-muted-foreground">
              Vous n&apos;avez pas la permission d&apos;accéder à cette page.
            </p>
          </div>
        </div>
      </main>
    );
  }

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
                Modifiez l&apos;intervention
              </h2>
              <p className="text-muted-foreground text-sm">
                Modifiez les détails de l&apos;intervention ci-dessous
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

  const defaultValues: UpdateInterventionFormType = {
    id: initialIntervention.id,
    titre: initialIntervention.titre,
    description: initialIntervention.description ?? "",
    dateDebutPrevue: initialIntervention.dateDebutPrevue
      ? initialIntervention.dateDebutPrevue.toISOString()
      : "",
    dateFinPrevue: initialIntervention.dateFinPrevue
      ? initialIntervention.dateFinPrevue.toISOString()
      : "",
    type: initialIntervention.type,
    siteId: initialIntervention.siteId.toString(),
    clientId: initialIntervention.clientId.toString(),
    fournisseurId: initialIntervention.fournisseurId.toString(),
  };

  const isClientAdmin = currentRole === "client_admin";

  const isReadOnly =
    initialIntervention.status === "annulee" ||
    initialIntervention.status === "en_cours" ||
    initialIntervention.status === "realisee" ||
    initialIntervention.status === "non_honoree" ||
    !isClientAdmin;

  return (
    <main className="flex h-full w-full flex-col overflow-hidden">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">
          Intervention &quot;{initialIntervention.titre}&quot; (n°
          {initialIntervention.id})
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
                  ? `L'intervention ne peut être modifiée (lecture seule). Etat de l'intervention : ${toCodeTableName(initialIntervention.status as InterventionStatusType, interventionStatusCT)}`
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
