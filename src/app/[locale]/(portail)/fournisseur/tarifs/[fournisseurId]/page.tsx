import { Tarif } from "@/actions/getTarifsFournisseurAction";
import { CalculatorDialog } from "@/components/Calculator";
import NettoyageTarifsForm from "@/components/NettoyageTarifsForm";
import { getSession } from "@/lib/auth-session";
import {
  getNettoyageAllQuantites,
  getNettoyageTarifsFournisseur,
} from "@/lib/queries/nettoyage/getNettoyage";

const page = async ({
  params,
}: {
  params: Promise<{ fournisseurId: number }>;
}) => {
  const { fournisseurId } = await params;
  const session = await getSession();
  console.log(session?.user.fournisseurId);

  if (session?.user.fournisseurId !== Number(fournisseurId)) {
    return <div>Unauthorized</div>;
  }

  if (!fournisseurId) {
    return <div>Fournisseur ID not found</div>;
  }

  const tarifsData = await getNettoyageTarifsFournisseur(fournisseurId);
  const quantitesData = await getNettoyageAllQuantites();

  const tarifs: Tarif[] = tarifsData
    ? tarifsData.sort((a, b) => a.surface - b.surface)
    : [];

  const quantites = quantitesData
    ? quantitesData.sort((a, b) => a.surface - b.surface)
    : [];

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Décomposition des Prix Globale et Forfaitaire (DPGF)
        </h1>
        <CalculatorDialog />
      </div>
      <NettoyageTarifsForm initialTarifs={tarifs} quantites={quantites} />
    </div>
  );
};

export default page;
