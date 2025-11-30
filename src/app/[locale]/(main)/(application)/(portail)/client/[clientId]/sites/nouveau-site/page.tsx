import { LocaleType } from "@/i18n/routing";
import { InsertSiteFormType } from "@/zod-schemas/site";
import NouveauSiteForm from "./NouveauSiteForm";

const page = async ({
  params,
}: {
  params: Promise<{ clientId: string; locale: LocaleType }>;
}) => {
  const { clientId } = await params;

  const defaultValues: InsertSiteFormType = {
    nomSite: "",
    adresseLigne1: "",
    adresseLigne2: "",
    codePostal: "",
    ville: "",
    surface: "",
    effectif: "",
    typeBatiment: "bureaux",
    typeOccupation: "plateauComplet",
    commentaires: "",
  };
  return (
    <main className="flex h-full w-full flex-col overflow-hidden">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">Nouveau site</h1>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex justify-center p-6">
          <div className="w-full max-w-3xl pb-8">
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold tracking-tight">
                Ajoutez un nouveau site
              </h2>
              <p className="text-muted-foreground text-sm">
                Ajoutez les détails du nouveau site ci-dessous
              </p>
            </div>
            <NouveauSiteForm
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
