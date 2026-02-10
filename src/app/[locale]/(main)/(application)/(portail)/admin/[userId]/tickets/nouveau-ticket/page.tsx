import { LocaleType } from "@/i18n/routing";
import { getClients } from "@/server/queries_a_classer/clients/getClients";
import { getFournisseurs } from "@/server/queries_a_classer/fournisseurs/getFournisseurs";
import { InsertTicketFormType } from "@/zod-schemas/ticket";
import { ReactNode } from "react";
import AdminNouveauTicketForm from "./AdminNouveauTicketForm";

const page = async ({
  params,
}: {
  params: Promise<{ userId: string; locale: LocaleType }>;
}) => {
  await params;
  const [clients, fournisseurs] = await Promise.all([
    getClients(),
    getFournisseurs(),
  ]);

  const errorComponent: ReactNode = (
    <main className="flex h-full w-full flex-col overflow-hidden">
      <div className="bg-background/95 shrink-0 border-b p-2">
        <h1 className="text-center text-xl font-bold">Nouveau ticket</h1>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex justify-center p-6">
          <div className="w-full max-w-3xl pb-8">
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold tracking-tight">
                Ajoutez un nouveau ticket
              </h2>
              <p className="text-muted-foreground text-sm">
                Ajoutez les détails du nouveau ticket ci-dessous
              </p>
            </div>
            <div>Aucun client n&apos;a été trouvé dans la base de données.</div>
          </div>
        </div>
      </div>
    </main>
  );

  if (clients.length === 0) {
    return errorComponent;
  }

  const defaultValues: InsertTicketFormType = {
    titre: "",
    categorie: "autre",
    type: "demande_intervention",
    fournisseurId: "0",
    description: "",
    priorite: "normale",
    status: "nouveau",
    attachments: [],
    siteId: "0",
  };

  return (
    <main className="flex h-full w-full flex-col overflow-hidden">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">Nouveau ticket</h1>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex justify-center p-6">
          <div className="w-full max-w-3xl pb-8">
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold tracking-tight">
                Ajoutez un nouveau ticket
              </h2>
              <p className="text-muted-foreground text-sm">
                Ajoutez les détails du nouveau ticket ci-dessous
              </p>
            </div>
            <AdminNouveauTicketForm
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
