"use client";
import { CafeContext } from "@/context/CafeProvider";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { SelectTheConsoTarifsType } from "@/zod-schemas/theConsoTarifs";
import { Leaf } from "lucide-react";
import { useContext } from "react";
import NextServiceButton from "../../mes-services/NextServiceButton";
import PropositionsTitle from "../../mes-services/PropositionsTitle";
import ThePropositions from "./ThePropositions";

type TheProps = {
  theConsoTarifs: SelectTheConsoTarifsType[];
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
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="2">
      <PropositionsTitle
        title="Thés variés"
        icon={Leaf}
        description="Parce que tout le monde ne boit pas forcément du café, un choix de thés présentés en coffrets"
        handleClickPrevious={handleClickPrevious}
      />
      <div className="w-full flex-1">
        <ThePropositions theConsoTarifs={theConsoTarifs} />
      </div>
      <NextServiceButton handleClickNext={handleClickNext} />
    </div>
  );
};

export default The;
