import { Tarif } from "@/actions/getTarifsFournisseurAction";
import { CalculatorDialog } from "@/components/Calculator";
import NettoyageTarifsForm from "@/components/NettoyageTarifsForm";
import {
  getNettoyageAllQuantites,
  getNettoyageTarifsFournisseur,
} from "@/lib/queries/nettoyage/getNettoyage";

type DPGFNettoyageProps = {
  fournisseurId: number;
};

const DPGFNettoyage = async ({ fournisseurId }: DPGFNettoyageProps) => {
  const tarifsData = await getNettoyageTarifsFournisseur(fournisseurId);
  const quantitesData = await getNettoyageAllQuantites();

  const tarifs: Tarif[] = tarifsData
    ? tarifsData.sort((a, b) => a.surface - b.surface)
    : [];

  const quantites = quantitesData
    ? quantitesData.sort((a, b) => a.surface - b.surface)
    : [];

  return (
    <main className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Décomposition des Prix Globale et Forfaitaire (DPGF)
        </h1>
        <CalculatorDialog />
      </div>
      <NettoyageTarifsForm initialTarifs={tarifs} quantites={quantites} />
    </main>
  );
};

export default DPGFNettoyage;
