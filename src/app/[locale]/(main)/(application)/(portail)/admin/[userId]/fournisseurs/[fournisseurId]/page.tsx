import { LocaleType } from "@/i18n/routing";
import {
  getFournisseur,
  getFournisseurServices,
} from "@/lib/queries/fournisseurs/getFournisseurs";
import { getAllServices } from "@/lib/queries/services/getServices";
import { notFound } from "next/navigation";
import AdminUpdateFournisseurForm from "./AdminUpdateFournisseurForm";

type UpdateFournisseurPageProps = {
  params: Promise<{
    userId: string;
    fournisseurId: string;
    locale: LocaleType;
  }>;
};

const page = async ({ params }: UpdateFournisseurPageProps) => {
  const { userId, fournisseurId } = await params;
  const fournisseurIdNum = parseInt(fournisseurId, 10);

  if (isNaN(fournisseurIdNum)) {
    notFound();
  }

  const [fournisseur, fournisseurServices, services] = await Promise.all([
    getFournisseur(fournisseurIdNum),
    getFournisseurServices(fournisseurIdNum),
    getAllServices(),
  ]);

  if (!fournisseur) {
    notFound();
  }

  return (
    <main className="flex h-full w-full flex-col overflow-hidden md:border-x">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">
          Modifier le fournisseur
        </h1>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex justify-center p-6">
          <div className="w-full max-w-3xl pb-8">
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold tracking-tight">
                {fournisseur.nomFournisseur}
              </h2>
              <p className="text-muted-foreground text-sm">
                Modifiez les informations du fournisseur ci-dessous.
              </p>
            </div>
            <AdminUpdateFournisseurForm
              userId={userId}
              fournisseur={fournisseur}
              fournisseurServices={fournisseurServices}
              services={services}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default page;
