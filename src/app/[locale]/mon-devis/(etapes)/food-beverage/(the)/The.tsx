"use client";
import { CafeContext } from "@/context/CafeProvider";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { SelectTheConsoTarifsType } from "@/zod-schemas/theConsoTarifs";
import { Leaf } from "lucide-react";
import { useContext, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import PropositionsFooter from "../../../PropositionsFooter";
import PropositionsTitle from "../../../PropositionsTitle";
import PropositionsTitleMobile from "../../../PropositionsTitleMobile";
import ThePropositions from "./ThePropositions";

type TheProps = {
  theConsoTarifs: SelectTheConsoTarifsType[];
};

const The = ({ theConsoTarifs }: TheProps) => {
  const { cafe } = useContext(CafeContext);
  const { setFoodBeverage } = useContext(FoodBeverageContext);
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  const propositionsRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="2">
      {isTabletOrMobile ? (
        <PropositionsTitleMobile
          title="Thés variés"
          icon={Leaf}
          description="Parce que tout le monde ne boit pas forcément du café, un choix de thés présentés en boîtes et coffrets. La gamme détermine la qualité du thé"
          propositionsRef={propositionsRef}
        />
      ) : (
        <PropositionsTitle
          title="Thés variés"
          icon={Leaf}
          description="Parce que tout le monde ne boit pas forcément du café, un choix de thés présentés en boîtes et coffrets. La gamme détermine la qualité du thé"
          handleClickPrevious={handleClickPrevious}
        />
      )}
      <div
        className="w-full flex-1 overflow-auto transition"
        ref={propositionsRef}
      >
        {!cafe.infos.fournisseurId ? (
          <div className="flex h-full items-center justify-center text-base lg:text-lg">
            <p className="text-center text-fm4alldestructive">
              Veuillez d&apos;abord sélectionner une offre de Boissons chaudes.
            </p>
          </div>
        ) : (
          <ThePropositions theConsoTarifs={theConsoTarifs} />
        )}
      </div>
      {!isTabletOrMobile ? (
        <PropositionsFooter handleClickNext={handleClickNext} />
      ) : null}
    </div>
  );
};

export default The;
