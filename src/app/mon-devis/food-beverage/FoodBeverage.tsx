import {
  getCafeConsoTarifs,
  getCafeMachines,
  getCafeMachinesTarifs,
  getCafeQuantites,
  getChocoConsoTarifs,
  getLaitConsoTarifs,
  getTheConsoTarifs,
} from "@/lib/queries/boissons-chaudes/getBoissonsChaudes";
import {
  getBoissonsQuantites,
  getBoissonsTarifs,
  getFoodLivraisonTarifs,
  getFruitsQuantites,
  getFruitsTarifs,
  getSnacksQuantites,
  getSnacksTarifs,
} from "@/lib/queries/boissons-chaudes/getSnacksFruits";
import Link from "next/link";
import Cafe from "./(cafe)/Cafe";
import SnacksFruits from "./(snacks)/SnacksFruits";
import The from "./(the)/The";

type FoodBeverageProps = {
  cafeFournisseurId?: string;
  effectif: string;
  nbPersonnesFood?: string;
};

const FoodBeverage = async ({
  cafeFournisseurId,
  effectif,
  nbPersonnesFood,
}: FoodBeverageProps) => {
  const [
    cafeMachines,
    cafeQuantites,
    cafeMachinesTarifs,
    cafeConsoTarifs,
    laitConsoTarifs,
    chocoConsoTarifs,
    theConsoTarifs,
    fruitsQuantites,
    fruitsTarifs,
    snacksQuantites,
    snacksTarifs,
    boissonsQuantites,
    boissonsTarifs,
    foodLivraisonTarifs,
  ] = await Promise.all([
    getCafeMachines(),
    getCafeQuantites(),
    getCafeMachinesTarifs(),
    getCafeConsoTarifs(),
    getLaitConsoTarifs(),
    getChocoConsoTarifs(),
    getTheConsoTarifs(cafeFournisseurId),
    getFruitsQuantites(nbPersonnesFood),
    getFruitsTarifs(nbPersonnesFood),
    getSnacksQuantites(nbPersonnesFood),
    getSnacksTarifs(nbPersonnesFood),
    getBoissonsQuantites(nbPersonnesFood),
    getBoissonsTarifs(nbPersonnesFood),
    getFoodLivraisonTarifs(),
  ]);

  if (
    !cafeMachines ||
    !cafeQuantites ||
    !cafeMachinesTarifs ||
    !cafeConsoTarifs ||
    !laitConsoTarifs ||
    !chocoConsoTarifs ||
    !theConsoTarifs
  ) {
    return (
      <section className="flex h-dvh items-center justify-center text-lg">
        <p>
          Nous n&apos;avons pas trouvé de tarifs de machines à cafés.{" "}
          <Link href="/mon-devis/mes-locaux" className="underline">
            Veuillez réessayer
          </Link>
          .
        </p>
      </section>
    );
  }

  return (
    <section className="flex-1 overflow-hidden">
      <Cafe
        cafeMachines={cafeMachines}
        cafeQuantites={cafeQuantites}
        cafeMachinesTarifs={cafeMachinesTarifs}
        cafeConsoTarifs={cafeConsoTarifs}
        laitConsoTarifs={laitConsoTarifs}
        chocoConsoTarifs={chocoConsoTarifs}
        theConsoTarifs={theConsoTarifs}
        effectif={effectif}
        cafeFournisseurId={cafeFournisseurId}
      />
      <The theConsoTarifs={theConsoTarifs} effectif={effectif} />
      <SnacksFruits
        fruitsQuantites={fruitsQuantites}
        fruitsTarifs={fruitsTarifs}
        snacksQuantites={snacksQuantites}
        snacksTarifs={snacksTarifs}
        boissonsQuantites={boissonsQuantites}
        boissonsTarifs={boissonsTarifs}
        foodLivraisonTarifs={foodLivraisonTarifs}
      />
    </section>
  );
};

export default FoodBeverage;
