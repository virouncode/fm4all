import { CalculatorDialog } from "@/components/calculator/CalculatorDialog";
import ServicePresentationCard from "@/components/cards/ServicePresentationCard";
import CDCHygiene from "@/components/CDCHygiene";
import {
  getHygieneConsosTarifsFournisseur,
  getHygieneDistribTarifsFournisseur,
  getHygieneInstalDistribTarifsFournisseur,
  getHygieneMinFacturationFournisseur,
} from "@/server/queries_a_classer/hygiene/getHygiene";
import { SelectHygieneDistribTarifsFournisseurType } from "@/zod-schemas/hygieneDistribTarifs";
import { Toilet } from "lucide-react";
import CDCDialog from "./CDCDialog";
import HygieneMinFacturationForm from "./HygieneMinFacturationForm";
import HygieneTarifsConsosUpdateForm from "./HygieneTarifsConsosUpdateForm";
import HygieneTarifsDistribUpdateForm from "./HygieneTarifsDistribUpdateForm";
import HygieneTarifsInstalUpdateForm from "./HygieneTarifsInstalUpdateForm";

type DPGFHygieneProps = {
  fournisseurId: number;
};

const DPGFHygiene = async ({ fournisseurId }: DPGFHygieneProps) => {
  const [
    tarifsDistribData,
    tarifsInstalData,
    tarifsConsosData,
    tarifsMinFacturation,
  ] = await Promise.all([
    getHygieneDistribTarifsFournisseur(fournisseurId),
    getHygieneInstalDistribTarifsFournisseur(fournisseurId),
    getHygieneConsosTarifsFournisseur(fournisseurId),
    getHygieneMinFacturationFournisseur(fournisseurId),
  ]);

  // Define the order for type and gamme
  const typeOrder = [
    "emp",
    "poubelleEmp",
    "savon",
    "ph",
    "desinfectant",
    "parfum",
    "balai",
    "poubelle",
  ];
  const gammeOrder = ["essentiel", "confort", "excellence"];

  // Sort all tarifs by type and gamme
  const tarifsDistrib: SelectHygieneDistribTarifsFournisseurType[] =
    tarifsDistribData
      ? [...tarifsDistribData].sort((a, b) => {
          // First sort by type
          const typeIndexA = typeOrder.indexOf(a.type);
          const typeIndexB = typeOrder.indexOf(b.type);
          if (typeIndexA !== typeIndexB) {
            return typeIndexA - typeIndexB;
          }
          // Then sort by gamme
          const gammeIndexA = gammeOrder.indexOf(a.gamme);
          const gammeIndexB = gammeOrder.indexOf(b.gamme);
          return gammeIndexA - gammeIndexB;
        })
      : [];

  // Define which types should be in the main array vs options array
  // const mainTypes = ["emp", "poubelleEmp", "savon", "ph"];
  // const optionTypes = ["desinfectant", "parfum", "balai", "poubelle"];

  // Split into main tarifs and options

  const tarifsInstal = tarifsInstalData
    ? [...tarifsInstalData].sort((a, b) => a.effectif - b.effectif)
    : [];

  const tarifsConsos = tarifsConsosData
    ? [...tarifsConsosData].sort((a, b) => {
        // Sort by effectif if available
        if (a.effectif && b.effectif) {
          return a.effectif - b.effectif;
        }
        return 0;
      })
    : [];

  return (
    <main className="container mx-auto p-6">
      <h1 className="mb-10 text-4xl">Mes tarifs</h1>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-[250px]">
            <ServicePresentationCard
              icons={[<Toilet key="toilet" />]}
              title="Hygiène sanitaire"
            />
          </div>
          <CalculatorDialog />
        </div>
        <CDCDialog>
          <CDCHygiene />
        </CDCDialog>
      </div>
      {tarifsMinFacturation && (
        <HygieneMinFacturationForm
          title="Minimum annuel de facturation"
          initialTarif={tarifsMinFacturation}
        />
      )}
      <HygieneTarifsDistribUpdateForm
        initialTarifs={tarifsDistrib}
        title="Tarifs des distributeurs"
      />
      <HygieneTarifsInstalUpdateForm
        initialTarifs={tarifsInstal}
        title="Prix d'installation des distributeurs"
      />
      <HygieneTarifsConsosUpdateForm
        initialTarifs={tarifsConsos}
        title="Tarifs des consommables"
      />
    </main>
  );
};

export default DPGFHygiene;
