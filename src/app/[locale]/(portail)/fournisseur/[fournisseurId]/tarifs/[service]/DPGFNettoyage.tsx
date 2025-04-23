import { CalculatorDialog } from "@/components/Calculator";
import ServicePresentationCard from "@/components/ServicePresentationCard";
import {
  getNettoyageAllQuantites,
  getNettoyageTarifsFournisseur,
  getNettoyageTarifsRepasseFournisseur,
} from "@/lib/queries/nettoyage/getNettoyage";
import { SelectNettoyageQuantitesType } from "@/zod-schemas/nettoyageQuantites";
import { NettoyageTarifsType } from "@/zod-schemas/nettoyageTarifs";
import { SprayCan } from "lucide-react";
import NettoyageTarifsUpdateForm from "./NettoyageTarifsUpdateForm";

type DPGFNettoyageProps = {
  fournisseurId: number;
};

const DPGFNettoyage = async ({ fournisseurId }: DPGFNettoyageProps) => {
  const [tarifsData, tarifsRepasseData, quantitesData] = await Promise.all([
    getNettoyageTarifsFournisseur(fournisseurId),
    getNettoyageTarifsRepasseFournisseur(fournisseurId),
    getNettoyageAllQuantites(),
  ]);

  const tarifs: NettoyageTarifsType[] = tarifsData
    ? tarifsData.sort((a, b) => a.surface - b.surface)
    : [];

  const tarifsRepasse: NettoyageTarifsType[] = tarifsRepasseData
    ? tarifsRepasseData.sort((a, b) => a.surface - b.surface)
    : [];

  const quantites: SelectNettoyageQuantitesType[] = quantitesData
    ? quantitesData.sort((a, b) => a.surface - b.surface)
    : [];

  return (
    <main className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-8 items-center">
          <div className="w-[250px]">
            <ServicePresentationCard icon={<SprayCan />} title="Nettoyage" />
          </div>
          <h1 className="text-2xl font-bold">DPGF</h1>
        </div>

        <CalculatorDialog />
      </div>
      <div className="border-l border-l-gray-500">
        <h2 className="ml-4 mb-2 text-xl font-bold">Tarifs de nettoyage</h2>
      </div>
      <NettoyageTarifsUpdateForm initialTarifs={tarifs} quantites={quantites} />
      <div className="border-l mt-10 border-l-gray-500">
        <h2 className="ml-4 mb-2  text-xl font-bold">
          Tarifs de repasse sanitaire
        </h2>
      </div>
      <NettoyageTarifsUpdateForm
        initialTarifs={tarifsRepasse}
        quantites={quantites}
      />
    </main>
  );
};

export default DPGFNettoyage;
