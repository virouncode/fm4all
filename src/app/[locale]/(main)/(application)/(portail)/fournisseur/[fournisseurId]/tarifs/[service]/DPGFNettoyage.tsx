import { CalculatorDialog } from "@/components/calculator/CalculatorDialog";
import ServicePresentationCard from "@/components/cards/ServicePresentationCard";
import CDCNettoyage from "@/components/CDCNettoyage";
import {
  getNettoyageAllQuantites,
  getNettoyageTarifsFournisseur,
  getRepasseTarifsFournisseur,
  getVitrerieTarifsFournisseur,
} from "@/server/queries_a_classer/nettoyage/getNettoyage";
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
      <h1 className="mb-10 text-4xl">Mes tarifs</h1>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-[250px]">
            <ServicePresentationCard
              icons={[<SprayCan key="spray-can" />]}
              title="Nettoyage et propreté"
            />
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
