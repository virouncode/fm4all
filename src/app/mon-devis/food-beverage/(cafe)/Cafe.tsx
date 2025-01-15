"use client";
import { Button } from "@/components/ui/button";
import { TypesBoissonsType } from "@/constants/typesBoissons";
import { CafeContext } from "@/context/CafeProvider";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import useScrollIntoFood from "@/hooks/use-scroll-into-food";
import useScrollIntoMachine from "@/hooks/use-scroll-into-machine";
import { SelectCafeConsoTarifsType } from "@/zod-schemas/cafeConsoTarifs";
import { SelectCafeMachinesType } from "@/zod-schemas/cafeMachine";
import { SelectCafeMachinesTarifsType } from "@/zod-schemas/cafeMachinesTarifs";
import { SelectCafeQuantitesType } from "@/zod-schemas/cafeQuantites";
import { SelectChocoConsoTarifsType } from "@/zod-schemas/chocoConsoTarifs";
import { DureeLocationCafeType } from "@/zod-schemas/dureeLocation";
import { SelectLaitConsoTarifsType } from "@/zod-schemas/laitConsoTarifs";
import { Coffee } from "lucide-react";
import { useContext } from "react";
import PropositionsFooter from "../../mes-services/PropositionsFooter";
import PropositionsTitle from "../../mes-services/PropositionsTitle";
import CafeMachine from "./CafeMachine";

type CafeProps = {
  cafeMachines: SelectCafeMachinesType[];
  cafeQuantites: SelectCafeQuantitesType[];
  cafeMachinesTarifs: SelectCafeMachinesTarifsType[];
  cafeConsoTarifs: SelectCafeConsoTarifsType[];
  laitConsoTarifs: SelectLaitConsoTarifsType[];
  chocoConsoTarifs: SelectChocoConsoTarifsType[];
  effectif: string;
  cafeFournisseurId?: string;
};

const Cafe = ({
  cafeMachines,
  cafeQuantites,
  cafeMachinesTarifs,
  cafeConsoTarifs,
  laitConsoTarifs,
  chocoConsoTarifs,
  effectif,
  cafeFournisseurId,
}: CafeProps) => {
  const { setFoodBeverage } = useContext(FoodBeverageContext);
  const { cafe, setCafe } = useContext(CafeContext);
  const { setTotalCafe } = useContext(TotalCafeContext);
  useScrollIntoFood();
  useScrollIntoMachine();

  const handleClickPrevious = () => {};

  const handleClickNext = () => {
    if (!cafe.cafeFournisseurId) {
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

  const handleAddMachine = () => {
    setCafe((prev) => ({
      ...prev,
      currentMachineId: 1,
      machines: [
        {
          machineId: 1,
          typeBoissons: "cafe" as TypesBoissonsType,
          dureeLocation: "pa12M" as DureeLocationCafeType,
          nbPersonnes: parseInt(effectif),
          nbMachines: 0,
          propositionId: null,
        },
      ],
    }));
    setTotalCafe((prev) => ({
      ...prev,
      prixCafeMachines: [{ machineId: 1, prix: null }],
    }));
  };

  //Le container exterieur pour faire defiler les machines
  return (
    <div className="flex flex-col gap-6 w-full mx-auto h-full py-2" id="1">
      <PropositionsTitle
        icon={Coffee}
        title="Café et boissons chaudes"
        description="Café expresso, boisson lactée ou boisson gourmande, choisissez la gamme de machine qui vous convient le mieux. Forfait mensuel tout compris selon durée d'engagement"
        handleClickPrevious={handleClickPrevious}
        previousButton={false}
      />
      <div className="flex-1 overflow-hidden">
        {cafe.machines && cafe.machines.length > 0 ? (
          cafe.machines.map((machine) => (
            <CafeMachine
              key={machine.machineId}
              machine={machine}
              cafeMachines={cafeMachines}
              cafeQuantites={cafeQuantites}
              cafeMachinesTarifs={cafeMachinesTarifs}
              cafeConsoTarifs={cafeConsoTarifs}
              laitConsoTarifs={laitConsoTarifs}
              chocoConsoTarifs={chocoConsoTarifs}
              effectif={effectif}
              cafeFournisseurId={cafeFournisseurId}
            />
          ))
        ) : (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="lg"
              className="text-base"
              onClick={handleAddMachine}
            >
              Ajouter une/des machines
            </Button>
          </div>
        )}
      </div>
      <PropositionsFooter
        handleClickNext={handleClickNext}
        nextButton={cafe.machines.length === 0}
      />
    </div>
  );
};

export default Cafe;
