"use client";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { SelectTheConsoTarifsType } from "@/zod-schemas/theConsoTarifs";
import { Leaf } from "lucide-react";
import { useContext } from "react";
import NextServiceButton from "../../mes-services/NextServiceButton";
import PreviousServiceButton from "../../mes-services/PreviousServiceButton";
import ThePropositions from "./ThePropositions";
import { CafeContext } from "@/context/CafeProvider";

type TheProps = {
  theConsoTarifs?: SelectTheConsoTarifsType[];
  effectif: string;
};

const The = ({ theConsoTarifs, effectif }: TheProps) => {
  const { cafe } = useContext(CafeContext);
  const { setFoodBeverage } = useContext(FoodBeverageContext);
  const handleClickPrevious = () => {
    setFoodBeverage((prev) => ({
      ...prev,
      currentFoodBeverageId: prev.currentFoodBeverageId - 1,
    }));
  };
  const handleClickNext = () => {
    setFoodBeverage((prev) => ({
      ...prev,
      currentFoodBeverageId: prev.currentFoodBeverageId + 1,
    }));
  };
  if (!cafe.cafeFournisseurId) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 w-full mx-auto h-full py-2" id="2">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center p-4 border rounded-xl">
          <Leaf />
          <p>Thé variés</p>
        </div>
        <p className="text-base flex-1 text-center italic px-4">
          Parce que tout le monde ne boit pas forcément du Café, un choix de
          thés présentés en coffrets
        </p>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>
      <div className="w-full flex-1">
        <ThePropositions theConsoTarifs={theConsoTarifs} effectif={effectif} />
      </div>
      <NextServiceButton handleClickNext={handleClickNext} />
    </div>
  );
};

export default The;
