"use client";

import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { Droplets } from "lucide-react";
import { useContext } from "react";
import PropositionsTitle from "../../mes-services/PropositionsTitle";

const Fontaine = () => {
  const { setFoodBeverage } = useContext(FoodBeverageContext);

  const handleClickPrevious = () => {
    setFoodBeverage((prev) => ({
      ...prev,
      currentFoodBeverageId: prev.currentFoodBeverageId - 1,
    }));
  };
  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="4">
      <PropositionsTitle
        icon={Droplets}
        title="Fontaines à eau"
        description="Eau fraîche ou pétillante, de l'eau pure filtrée pour tous. Adaptés à votre besoin, nos fontaines réseau sont à poser, sur pied ou sous comptoir"
        handleClickPrevious={handleClickPrevious}
      />

      {/* {selectedServicesIds[selectedServicesIds.length - 1] === 4 ? null : (
        <NextServiceButton handleClickNext={handleClickNext} />
      )} */}
    </div>
  );
};

export default Fontaine;
