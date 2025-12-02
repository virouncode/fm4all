import { LocaleType } from "@/i18n/routing";
import { getClientSiteById } from "@/lib/queries/clients/getClients";
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
            <div>"Le site demandé est introuvable."</div>
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

  return (
    <main className="flex h-full w-full flex-col overflow-hidden">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">
          Site "{initialSite.nomSite}" (n°{initialSite.id})
        </h1>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex justify-center p-6">
          <div className="w-full max-w-3xl pb-8">
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold tracking-tight">
                Modifiez le site
              </h2>
              <p className={`text-muted-foreground text-sm`}>
                {" "}
                Modifiez les détails du site ci-dessous
              </p>
            </div>
            <ClientUpdateSiteForm
              defaultValues={defaultValues}
              clientId={parseInt(clientId)}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default page;
