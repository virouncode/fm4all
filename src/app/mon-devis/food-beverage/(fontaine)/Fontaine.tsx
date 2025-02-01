"use client";
import { ClientContext } from "@/context/ClientProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { Droplets } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import PropositionsFooter from "../../PropositionsFooter";
import PropositionsTitle from "../../PropositionsTitle";

const Fontaine = () => {
  const { client } = useContext(ClientContext);
  const { setFoodBeverage } = useContext(FoodBeverageContext);
  const { setDevisProgress } = useContext(DevisProgressContext);
  const router = useRouter();

  const handleClickNext = () => {
    setFoodBeverage((prev) => ({
      ...prev,
      currentFoodBeverageId: 1,
    }));
    const searchParams = new URLSearchParams();
    if (client.effectif)
      searchParams.set("effectif", client.effectif.toString());
    if (client.surface) searchParams.set("surface", client.surface.toString());
    setDevisProgress({ currentStep: 4, completedSteps: [1, 2, 3] });
    router.push(`/mon-devis/pilotage-prestations?${searchParams.toString()}`);
  };

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
      <PropositionsFooter handleClickNext={handleClickNext} comment="" />
    </div>
  );
};

export default Fontaine;
