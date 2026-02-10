import { LocaleType } from "@/i18n/routing";
import { getClient } from "@/server/queries_a_classer/clients/getClients";
import { notFound } from "next/navigation";
import AdminUpdateClientForm from "./AdminUpdateClientForm";

const page = async ({
  params,
}: {
  params: Promise<{ userId: string; clientId: string; locale: LocaleType }>;
}) => {
  const { clientId } = await params;
  const clientIdNum = parseInt(clientId, 10);

  if (isNaN(clientIdNum)) {
    notFound();
  }

  const client = await getClient(clientIdNum);

  if (!client) {
    notFound();
  }

  return (
    <main className="flex h-full w-full flex-col overflow-hidden md:border-x">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">
          Client : {client.nomEntreprise}
        </h1>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex justify-center p-6">
          <div className="w-full max-w-3xl pb-8">
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold tracking-tight">
                Modifiez le client
              </h2>
              <p className="text-muted-foreground text-sm">
                Modifiez les informations du client ci-dessous
              </p>
            </div>
            <AdminUpdateClientForm client={client} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default page;
