"use client";
import { Button } from "@/components/ui/button";
import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import useScrollIntoCafeEspace from "@/hooks/use-scroll-into-cafe-espace";
import useScrollIntoFood from "@/hooks/use-scroll-into-food";
import { SelectCafeConsoTarifsType } from "@/zod-schemas/cafeConsoTarifs";
import { SelectCafeMachinesType } from "@/zod-schemas/cafeMachine";
import { SelectCafeMachinesTarifsType } from "@/zod-schemas/cafeMachinesTarifs";
import { SelectChocolatConsoTarifsType } from "@/zod-schemas/chocolatConsoTarifs";
import { SelectLaitConsoTarifsType } from "@/zod-schemas/laitConsoTarifs";
import { SelectSucreConsoTarifsType } from "@/zod-schemas/sucreConsoTarifs";
import { SelectTheConsoTarifsType } from "@/zod-schemas/theConsoTarifs";
import { Coffee } from "lucide-react";
import { useContext } from "react";
import PropositionsFooter from "../../../PropositionsFooter";
import PropositionsTitle from "../../../PropositionsTitle";
import CafeEspace from "./CafeEspace";
import { MAX_NB_PERSONNES_PAR_ESPACE } from "./CafeEspacePropositions";

type CafeProps = {
  cafeMachines: SelectCafeMachinesType[];
  cafeMachinesTarifs: SelectCafeMachinesTarifsType[];
  cafeConsoTarifs: SelectCafeConsoTarifsType[];
  laitConsoTarifs: SelectLaitConsoTarifsType[];
  chocolatConsoTarifs: SelectChocolatConsoTarifsType[];
  theConsoTarifs: SelectTheConsoTarifsType[];
  sucreConsoTarifs: SelectSucreConsoTarifsType[];
};

const Cafe = ({
  cafeMachines,
  cafeMachinesTarifs,
  cafeConsoTarifs,
  laitConsoTarifs,
  chocolatConsoTarifs,
  theConsoTarifs,
  sucreConsoTarifs,
}: CafeProps) => {
  const { client } = useContext(ClientContext);
  const { setFoodBeverage } = useContext(FoodBeverageContext);
  const { cafe, setCafe } = useContext(CafeContext);
  const { setTotalCafe } = useContext(TotalCafeContext);
  const effectif = client.effectif ?? 0;
  useScrollIntoFood();
  useScrollIntoCafeEspace();

  const handleClickPrevious = () => {};

  const handleClickNext = () => {
    if (!cafe.infos.fournisseurId) {
      //pour skiper le the si pas de cafe
      setFoodBeverage((prev) => ({
        ...prev,
        currentFoodBeverageId: prev.currentFoodBeverageId + 2,
      }));
      return;
    }
    setFoodBeverage((prev) => ({
      ...prev,
      currentFoodBeverageId: prev.currentFoodBeverageId + 1,
    }));
  };

  const handleAddEspace = () => {
    setCafe((prev) => ({
      ...prev,
      nbEspaces: 1,
      espaces: [
        {
          infos: {
            espaceId: 1,
            typeBoissons: "cafe",
            typeLait: null,
            typeChocolat: null,
            gammeCafeSelected: null,
            marque: null,
            modele: null,
            reconditionne: false,
          },
          quantites: {
            nbPersonnes:
              effectif > MAX_NB_PERSONNES_PAR_ESPACE
                ? MAX_NB_PERSONNES_PAR_ESPACE
                : effectif,
            nbMachines: null,
            nbPassagesParAn: null,
          },
          prix: {
            prixLoc: null,
            prixInstal: null,
            prixMaintenance: null,
            prixUnitaireConsoCafe: null,
            prixUnitaireConsoLait: null,
            prixUnitaireConsoChocolat: null,
            prixUnitaireConsoSucre: null,
          },
        },
      ],
    }));
    setTotalCafe({
      totalEspaces: [{ espaceId: 1, total: 0, totalInstallation: 0 }],
    });
  };

  //Le container exterieur pour faire defiler les machines
  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="1">
      <PropositionsTitle
        icon={Coffee}
        title="Boissons chaudes"
        description="Café expresso, boissons lactées ou gourmandes, choisissez la gamme de machine qui vous convient le mieux. Forfait mensuel tout compris (machine, café, consommables)"
        handleClickPrevious={handleClickPrevious}
        previousButton={false}
      />
      <div className="w-full flex-1 overflow-auto">
        {cafe.nbEspaces && cafe.nbEspaces > 0 ? (
          cafe.espaces.map((espace) => (
            <CafeEspace
              key={espace.infos.espaceId}
              espace={espace}
              cafeMachines={cafeMachines}
              cafeMachinesTarifs={cafeMachinesTarifs}
              cafeConsoTarifs={cafeConsoTarifs}
              laitConsoTarifs={laitConsoTarifs}
              chocolatConsoTarifs={chocolatConsoTarifs}
              theConsoTarifs={theConsoTarifs}
              sucreConsoTarifs={sucreConsoTarifs}
            />
          ))
        ) : (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="lg"
              className="text-base"
              onClick={handleAddEspace}
            >
              Ajouter un espace café
            </Button>
          </div>
        )}
      </div>
      {!cafe.nbEspaces ? (
        <PropositionsFooter handleClickNext={handleClickNext} />
      ) : null}
    </div>
  );
};

export default Cafe;
