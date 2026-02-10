import { LocaleType } from "@/i18n/routing";
import { getAllServices } from "@/server/queries_a_classer/services/getServices";
import NouveauFournisseurForm from "./NouveauFournisseurForm";

const page = async ({
  params,
}: {
  params: Promise<{ userId: string; locale: LocaleType }>;
}) => {
  const { userId } = await params;
  const services = await getAllServices();

  return (
    <main className="flex h-full w-full flex-col overflow-hidden md:border-x">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">
          Ajouter un fournisseur
        </h1>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex justify-center p-6">
          <div className="w-full max-w-3xl pb-8">
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold tracking-tight">
                Nouveau fournisseur
              </h2>
              <p className="text-muted-foreground text-sm">
                Remplissez les informations du fournisseur ci-dessous. Un compte
                utilisateur sera créé automatiquement et un email avec le mot de
                passe temporaire sera envoyé au contact.
              </p>
            </div>
            <NouveauFournisseurForm userId={userId} services={services} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default page;
