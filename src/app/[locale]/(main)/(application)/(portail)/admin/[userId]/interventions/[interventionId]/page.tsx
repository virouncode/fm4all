import { interventionStatusCT, toCodeTableName } from "@/constants/codeTables";
import { LocaleType } from "@/i18n/routing";
import { getClients } from "@/server/queries_a_classer/clients/getClients";
import { getFournisseurs } from "@/server/queries_a_classer/fournisseurs/getFournisseurs";
import { getIntervention } from "@/server/queries_a_classer/interventions/getInterventions";
import { getSites } from "@/server/queries_a_classer/sites/getSites";
import { getAllTicketsSimple } from "@/server/queries_a_classer/tickets/getTickets";
import { InterventionStatusType } from "@/zod-schemas/enums";
import { UpdateInterventionFormType } from "@/zod-schemas/intervention";
import { ReactNode } from "react";
import AdminUpdateInterventionForm from "./AdminUpdateInterventionForm";

const page = async ({
  params,
}: {
  params: Promise<{
    userId: string;
    interventionId: string;
    locale: LocaleType;
  }>;
}) => {
  const { interventionId } = await params;
  const [clients, sites, fournisseurs, tickets, initialIntervention] =
    await Promise.all([
      getClients(),
      getSites(),
      getFournisseurs(),
      getAllTicketsSimple(),
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
                Modifiez l&apos;intervention
              </h2>
              <p className="text-muted-foreground text-sm">
                Modifiez les détails de l&apos;intervention ci-dessous
              </p>
            </div>
            <div>
              {sites.length === 0
                ? "Aucun site trouvé"
                : fournisseurs.length === 0
                  ? "Aucun fournisseur trouvé"
                  : clients.length === 0
                    ? "Aucun client trouvé"
                    : `L'intervention ${interventionId} n'existe pas`}
            </div>
          </div>
        </div>
      </div>
    </main>
  );

  if (
    sites.length === 0 ||
    fournisseurs.length === 0 ||
    clients.length === 0 ||
    !initialIntervention
  ) {
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
    ticketId: initialIntervention.ticketId.toString(),
    fournisseurId: initialIntervention.fournisseurId.toString(),
  };

  // L'admin peut modifier sauf si l'intervention est terminée
  const isReadOnly =
    initialIntervention.status === "annulee" ||
    initialIntervention.status === "realisee" ||
    initialIntervention.status === "non_honoree";

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
                  ? `L'intervention ne peut être modifiée (lecture seule). État : ${toCodeTableName(initialIntervention.status as InterventionStatusType, interventionStatusCT)}`
                  : "Modifiez les détails de l'intervention ci-dessous"}
              </p>
            </div>
            <AdminUpdateInterventionForm
              defaultValues={defaultValues}
              clients={clients}
              tickets={tickets}
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
