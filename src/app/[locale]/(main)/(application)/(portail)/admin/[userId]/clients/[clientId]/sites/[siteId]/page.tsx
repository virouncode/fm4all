import { LocaleType } from "@/i18n/routing";
import { getClient, getClientSiteById } from "@/lib/queries/clients/getClients";
import { UpdateSiteFormType } from "@/zod-schemas/site";
import { notFound } from "next/navigation";
import AdminUpdateSiteForm from "./AdminUpdateSiteForm";

const page = async ({
  params,
}: {
  params: Promise<{
    userId: string;
    clientId: string;
    siteId: string;
    locale: LocaleType;
  }>;
}) => {
  const { userId, clientId, siteId } = await params;
  const clientIdNum = parseInt(clientId, 10);
  const siteIdNum = parseInt(siteId, 10);

  if (isNaN(clientIdNum) || isNaN(siteIdNum)) {
    notFound();
  }

  const client = await getClient(clientIdNum);
  const site = await getClientSiteById(siteIdNum);

  if (!client || !site) {
    notFound();
  }

  // Vérifier que le site appartient bien au client
  if (site.clientId !== clientIdNum) {
    notFound();
  }

  const defaultValues: UpdateSiteFormType = {
    id: site.id,
    nomSite: site.nomSite,
    adresseLigne1: site.adresseLigne1,
    adresseLigne2: site.adresseLigne2 ?? "",
    codePostal: site.codePostal,
    ville: site.ville,
    surface: site.surface.toString(),
    effectif: site.effectif.toString(),
    typeBatiment: site.typeBatiment,
    typeOccupation: site.typeOccupation,
    commentaires: site.commentaires ?? "",
  };

  return (
    <main className="flex h-full w-full flex-col overflow-hidden md:border-x">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">
          Site : {site.nomSite}
        </h1>
        <p className="text-muted-foreground pb-2 text-center text-sm">
          Client : {client.nomEntreprise}
        </p>
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
            <AdminUpdateSiteForm
              defaultValues={defaultValues}
              userId={userId}
              clientId={clientIdNum}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default page;
