import { LocaleType } from "@/i18n/routing";
import { getSession } from "@/server/auth/get-session";
import { getClientSiteById } from "@/server/queries_a_classer/clients/getClients";
import { UpdateSiteFormType } from "@/zod-schemas/site";
import { ReactNode } from "react";
import ClientUpdateSiteForm from "./ClientUpdateSiteForm";

const page = async ({
  params,
}: {
  params: Promise<{
    clientId: string;
    siteId: string;
    locale: LocaleType;
  }>;
}) => {
  const { clientId, siteId } = await params;
  const initialSite = await getClientSiteById(parseInt(siteId));

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
            Modifiez le site
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
        <h1 className="text-center text-xl font-bold">Site introuvable</h1>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex justify-center p-6">
          <div className="w-full max-w-3xl pb-8">
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold tracking-tight">
                Modifiez le site
              </h2>
              <p className="text-muted-foreground text-sm">
                Modifiez les détails du site ci-dessous
              </p>
            </div>
            <div>Le site demandé est introuvable.</div>
          </div>
        </div>
      </div>
    </main>
  );

  if (!initialSite) {
    return errorComponent;
  }

  const defaultValues: UpdateSiteFormType = {
    id: initialSite.id,
    nomSite: initialSite.nomSite,
    adresseLigne1: initialSite.adresseLigne1,
    adresseLigne2: initialSite.adresseLigne2 ?? "",
    codePostal: initialSite.codePostal,
    ville: initialSite.ville,
    surface: initialSite.surface.toString(),
    effectif: initialSite.effectif.toString(),
    typeBatiment: initialSite.typeBatiment,
    typeOccupation: initialSite.typeOccupation,
    commentaires: initialSite.commentaires ?? "",
  };

  const isClientAdmin = currentRole === "client_admin";

  return (
    <main className="flex h-full w-full flex-col overflow-hidden">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">
          Site &quot;{initialSite.nomSite}&quot; (n°{initialSite.id})
        </h1>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex justify-center p-6">
          <div className="w-full max-w-3xl pb-8">
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold tracking-tight">
                {isClientAdmin ? "Modifiez le site" : "Détails du site"}
              </h2>
              <p className={`text-muted-foreground text-sm`}>
                {isClientAdmin
                  ? "Modifiez les détails du site ci-dessous"
                  : "Vous n'avez pas la permission de modifier ce site"}
              </p>
            </div>
            <ClientUpdateSiteForm
              defaultValues={defaultValues}
              clientId={parseInt(clientId)}
              isReadOnly={!isClientAdmin}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default page;
