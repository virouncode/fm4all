import { CalculatorDialog } from "@/components/calculator/CalculatorDialog";
import ServicePresentationCard from "@/components/cards/ServicePresentationCard";
import CDCNettoyage from "@/components/CDCNettoyage";
import {
  getNettoyageAllQuantites,
  getNettoyageTarifsFournisseur,
  getRepasseTarifsFournisseur,
  getVitrerieTarifsFournisseur,
} from "@/lib/queries/nettoyage/getNettoyage";
import { SelectNettoyageQuantitesType } from "@/zod-schemas/nettoyageQuantites";
import { SelectNettoyageTarifFournisseurType } from "@/zod-schemas/nettoyageTarifs";
import { SprayCan } from "lucide-react";
import CDCDialog from "./CDCDialog";
import NettoyageTarifsUpdateForm from "./NettoyageTarifsUpdateForm";
import VitrerieTarifsUpdateForm from "./VitrerieTarifsUpdateForm";

type DPGFNettoyageProps = {
  fournisseurId: number;
};

const DPGFNettoyage = async ({ fournisseurId }: DPGFNettoyageProps) => {
  const [tarifsData, tarifsRepasseData, tarifsVitrerie, quantitesData] =
    await Promise.all([
      getNettoyageTarifsFournisseur(fournisseurId),
      getRepasseTarifsFournisseur(fournisseurId),
      getVitrerieTarifsFournisseur(fournisseurId),
      getNettoyageAllQuantites(),
    ]);

  const tarifs: SelectNettoyageTarifFournisseurType[] = tarifsData
    ? tarifsData.sort((a, b) => a.surface - b.surface)
    : [];

  const tarifsRepasse: SelectNettoyageTarifFournisseurType[] = tarifsRepasseData
    ? tarifsRepasseData.sort((a, b) => a.surface - b.surface)
    : [];

  const quantites: SelectNettoyageQuantitesType[] = quantitesData
    ? quantitesData.sort((a, b) => a.surface - b.surface)
    : [];

  return (
    <main className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4 items-center">
          <div className="w-[250px]">
            <ServicePresentationCard icon={<SprayCan />} title="Nettoyage" />
          </div>
          <CalculatorDialog />
        </div>
        <CDCDialog>
          <CDCNettoyage />
        </CDCDialog>
      </div>
      <NettoyageTarifsUpdateForm
        initialTarifs={tarifs}
        quantites={quantites}
        title="Tarifs de Nettoyage"
      />
      <NettoyageTarifsUpdateForm
        initialTarifs={tarifsRepasse}
        quantites={quantites}
        title="Tarifs de Repasse Sanitaire"
      />
      {tarifsVitrerie && (
        <VitrerieTarifsUpdateForm
          initialTarifs={tarifsVitrerie}
          title="Tarifs de nettoyage vitrerie"
        />
      )}
    </main>
  );
};

export default DPGFNettoyage;
