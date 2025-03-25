"use client";
import PropositionsTitleMobile from "@/app/mon-devis/PropositionsTitleMobile";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { SelectBoissonsQuantitesType } from "@/zod-schemas/boissonsQuantites";
import { SelectBoissonsTarifsType } from "@/zod-schemas/boissonsTarifs";
import { SelectFoodLivraisonTarifsType } from "@/zod-schemas/foodLivraisonTarifs";
import { SelectFruitsQuantitesType } from "@/zod-schemas/fruitsQuantites";
import { SelectFruitsTarifsType } from "@/zod-schemas/fruitsTarifs";
import { SelectSnacksQuantitesType } from "@/zod-schemas/snacksQuantites";
import { SelectSnacksTarifsType } from "@/zod-schemas/snacksTarifs";
import { Banana, Cookie, CupSoda } from "lucide-react";
import { useContext, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import PropositionsFooter from "../../../PropositionsFooter";
import PropositionsTitle from "../../../PropositionsTitle";
import SnacksFruitsForm from "./SnacksFruitsForm";
import SnacksFruitsPropositions from "./SnacksFruitsPropositions";

type SnacksFruitsType = {
  fruitsQuantites: SelectFruitsQuantitesType[];
  fruitsTarifs: SelectFruitsTarifsType[];
  snacksQuantites: SelectSnacksQuantitesType[];
  snacksTarifs: SelectSnacksTarifsType[];
  boissonsQuantites: SelectBoissonsQuantitesType[];
  boissonsTarifs: SelectBoissonsTarifsType[];
  foodLivraisonTarifs: SelectFoodLivraisonTarifsType[];
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
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  const propositionsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="3">
      {isTabletOrMobile ? (
        <PropositionsTitleMobile
          icon={Cookie}
          icon2={Banana}
          icon3={CupSoda}
          title="Snacks & Fruits"
          description="Fruits locaux, bio, eco-responsables, snacks sains et gourmands, boissons fraiches, chaque semaine faites varier les plaisirs dans un panier qui ravira vos équipes. La gamme détermine les quantités par personne par semaine"
          propositionsRef={propositionsRef}
        />
      ) : (
        <PropositionsTitle
          icon={Cookie}
          icon2={Banana}
          icon3={CupSoda}
          title="Snacks & Fruits"
          description="Fruits locaux, bio, eco-responsables, snacks sains et gourmands, boissons fraiches, chaque semaine faites varier les plaisirs dans un panier qui ravira vos équipes. La gamme détermine les quantités par personne par semaine"
          handleClickPrevious={handleClickPrevious}
        />
      )}

      <div
        className="w-full flex-1 flex flex-col overflow-auto transition gap-4"
        ref={propositionsRef}
      >
        <SnacksFruitsForm
          fruitsQuantites={fruitsQuantites}
          fruitsTarifs={fruitsTarifs}
          snacksQuantites={snacksQuantites}
          snacksTarifs={snacksTarifs}
          boissonsQuantites={boissonsQuantites}
          boissonsTarifs={boissonsTarifs}
          foodLivraisonTarifs={foodLivraisonTarifs}
        />
        <SnacksFruitsPropositions
          fruitsQuantites={fruitsQuantites}
          fruitsTarifs={fruitsTarifs}
          snacksQuantites={snacksQuantites}
          snacksTarifs={snacksTarifs}
          boissonsQuantites={boissonsQuantites}
          boissonsTarifs={boissonsTarifs}
          foodLivraisonTarifs={foodLivraisonTarifs}
        />
      </div>
      {!isTabletOrMobile ? (
        <PropositionsFooter handleClickNext={handleClickNext} />
      ) : null}
    </div>
  );
};

export default SnacksFruits;
