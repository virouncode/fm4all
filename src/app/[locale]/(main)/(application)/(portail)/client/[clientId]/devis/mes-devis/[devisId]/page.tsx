import { LocaleType } from "@/i18n/routing";
import { getDevisById } from "@/lib/queries/devis/getDevis";
import Link from "next/link";

const page = async ({
  params,
}: {
  params: Promise<{ clientId: string; devisId: string; locale: LocaleType }>;
}) => {
  const { clientId, devisId } = await params;

  if (!devisId) {
    return (
      <main className="flex h-full w-full flex-col overflow-hidden md:border-x">
        <div className="bg-background/95 shrink-0 border-b">
          <h1 className="py-2 text-center text-xl font-bold">Devis</h1>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          Vous devez fournir un numéro de devis valide.
        </div>
      </main>
    );
  }

  const devis = await getDevisById(parseInt(devisId));

  if (!devis || !devis.devisUrl) {
    return (
      <main className="flex h-full w-full flex-col overflow-hidden md:border-x">
        <div className="bg-background/95 shrink-0 border-b">
          <h1 className="py-2 text-center text-xl font-bold">Devis</h1>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">Devis introuvable</div>
      </main>
    );
  }

  return (
    <main className="flex h-full w-full flex-col overflow-hidden md:border-x">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">
          Devis n° {devisId} : &quot;{devis.titre}&quot;
        </h1>
      </div>
      <div className="mt-6 flex min-h-0 flex-col overflow-y-auto">
        <p className="mx-auto max-w-prose">
          Si le document ne s&apos;affiche pas correctement{" "}
          <Link href={devis.devisUrl} target="_blank" className="underline">
            cliquez ici
          </Link>
        </p>
        <div className="flex w-full justify-center p-4">
          <iframe src={devis.devisUrl} className="h-screen w-full rounded-xl" />
        </div>
      </div>
    </main>
  );
};

export default page;
