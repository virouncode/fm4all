"use client";
import { CafeContext } from "@/context/CafeProvider";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { SelectBoissonsQuantitesType } from "@/zod-schemas/boissonsQuantites";
import { SelectBoissonsTarifsType } from "@/zod-schemas/boissonsTarifs";
import { SelectFoodLivraisonTarifsType } from "@/zod-schemas/foodLivraisonTarifs";
import { SelectFruitsQuantitesType } from "@/zod-schemas/fruitsQuantites";
import { SelectFruitsTarifsType } from "@/zod-schemas/fruitsTarifs";
import { SelectSnacksQuantitesType } from "@/zod-schemas/snacksQuantites";
import { SelectSnacksTarifsType } from "@/zod-schemas/snacksTarifs";
import { Banana, Cookie, CupSoda } from "lucide-react";
import { useContext } from "react";
import PropositionsTitle from "../../mes-services/PropositionsTitle";
import SnacksFruitsUpdateForm from "./SnackFruitsUpdateForm";
import SnacksFruitsPropositions from "./SnacksFruitsPropositions";

type SnacksFruitsType = {
  fruitsQuantites?: SelectFruitsQuantitesType[];
  fruitsTarifs?: SelectFruitsTarifsType[];
  snacksQuantites?: SelectSnacksQuantitesType[];
  snacksTarifs?: SelectSnacksTarifsType[];
  boissonsQuantites?: SelectBoissonsQuantitesType[];
  boissonsTarifs?: SelectBoissonsTarifsType[];
  foodLivraisonTarifs?: SelectFoodLivraisonTarifsType[];
};

const SnacksFruits = ({
  fruitsQuantites,
  fruitsTarifs,
  snacksQuantites,
  snacksTarifs,
  boissonsQuantites,
  boissonsTarifs,
  foodLivraisonTarifs,
}: SnacksFruitsType) => {
  const { foodBeverage, setFoodBeverage } = useContext(FoodBeverageContext);
  const { cafe } = useContext(CafeContext);
  const handleClickPrevious = () => {
    setFoodBeverage((prev) => ({
      ...prev,
      currentFoodBeverageId: cafe.cafeFournisseurId
        ? prev.currentFoodBeverageId - 1
        : prev.currentFoodBeverageId - 2,
    }));
  };
  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="3">
      <PropositionsTitle
        icon={Cookie}
        icon2={Banana}
        icon3={CupSoda}
        title="Snacks & Fruits"
        description="Fruits locaux, bio, eco-responsables, snacks sains et gourmands, boissons fraiches, chaque semaine faites varier les plaisirs dans un panier qui ravira vos équipes"
        handleClickPrevious={handleClickPrevious}
      />
      <div className="w-full flex-1 flex flex-col gap-4">
        <SnacksFruitsUpdateForm />
        <SnacksFruitsPropositions />
      </div>
    </div>
  );
};

export default SnacksFruits;
