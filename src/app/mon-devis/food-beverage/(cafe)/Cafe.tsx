"use client";
import { Button } from "@/components/ui/button";
import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import useScrollIntoCafeLot from "@/hooks/use-scroll-into-cafe-lot";
import useScrollIntoFood from "@/hooks/use-scroll-into-food";
import { SelectCafeConsoTarifsType } from "@/zod-schemas/cafeConsoTarifs";
import { SelectCafeMachinesType } from "@/zod-schemas/cafeMachine";
import { SelectCafeMachinesTarifsType } from "@/zod-schemas/cafeMachinesTarifs";
import { SelectCafeQuantitesType } from "@/zod-schemas/cafeQuantites";
import { SelectChocoConsoTarifsType } from "@/zod-schemas/chocoConsoTarifs";
import { SelectLaitConsoTarifsType } from "@/zod-schemas/laitConsoTarifs";
import { SelectTheConsoTarifsType } from "@/zod-schemas/theConsoTarifs";
import { Coffee } from "lucide-react";
import { useContext } from "react";
import PropositionsFooter from "../../PropositionsFooter";
import PropositionsTitle from "../../PropositionsTitle";
import CafeLot from "./CafeLot";

type CafeProps = {
  cafeMachines: SelectCafeMachinesType[];
  cafeQuantites: SelectCafeQuantitesType[];
  cafeMachinesTarifs: SelectCafeMachinesTarifsType[];
  cafeConsoTarifs: SelectCafeConsoTarifsType[];
  laitConsoTarifs: SelectLaitConsoTarifsType[];
  chocoConsoTarifs: SelectChocoConsoTarifsType[];
  theConsoTarifs: SelectTheConsoTarifsType[];
};

const Cafe = ({
  cafeMachines,
  cafeQuantites,
  cafeMachinesTarifs,
  cafeConsoTarifs,
  laitConsoTarifs,
  chocoConsoTarifs,
  theConsoTarifs,
}: CafeProps) => {
  const { client } = useContext(ClientContext);
  const { setFoodBeverage } = useContext(FoodBeverageContext);
  const { cafe, setCafe } = useContext(CafeContext);
  const { setTotalCafe } = useContext(TotalCafeContext);
  const effectif = client.effectif ?? 0;
  useScrollIntoFood();
  useScrollIntoCafeLot();

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

  const handleAddLot = () => {
    setCafe((prev) => ({
      ...prev,
      nbLotsMachines: 1,
      lotsMachines: [
        {
          infos: {
            lotId: 1,
            typeBoissons: "cafe",
            gammeCafeSelected: null,
            marque: null,
            modele: null,
            reconditionne: false,
          },
          quantites: {
            nbPersonnes: effectif,
            nbMachines: null,
          },
          prix: {
            prixUnitaireLoc: null,
            prixUnitaireInstal: null,
            prixUnitaireMaintenance: null,
            prixUnitaireConsoCafe: null,
            prixUnitaireConsoLait: null,
            prixUnitaireConsoChocolat: null,
          },
        },
      ],
    }));
    setTotalCafe({
      totalMachines: [{ lotId: 1, total: 0, totalInstallation: 0 }],
    });
  };

  //Le container exterieur pour faire defiler les machines
  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="1">
      <PropositionsTitle
        icon={Coffee}
        title="Boissons chaudes"
        description="Café expresso, boissons lactées ou gourmandes, choisissez la gamme de machines qui vous convient le mieux"
        handleClickPrevious={handleClickPrevious}
        previousButton={false}
      />
      <div className="w-full flex-1 overflow-auto">
        {cafe.nbLotsMachines && cafe.nbLotsMachines > 0 ? (
          cafe.lotsMachines.map((lot) => (
            <CafeLot
              key={lot.infos.lotId}
              lot={lot}
              cafeMachines={cafeMachines}
              cafeQuantites={cafeQuantites}
              cafeMachinesTarifs={cafeMachinesTarifs}
              cafeConsoTarifs={cafeConsoTarifs}
              laitConsoTarifs={laitConsoTarifs}
              chocoConsoTarifs={chocoConsoTarifs}
              theConsoTarifs={theConsoTarifs}
            />
          ))
        ) : (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="lg"
              className="text-base"
              onClick={handleAddLot}
            >
              Ajouter une/des machines
            </Button>
          </div>
        )}
      </div>
      {!cafe.nbLotsMachines ? (
        <PropositionsFooter handleClickNext={handleClickNext} />
      ) : null}
    </div>
  );
};

export default Cafe;
