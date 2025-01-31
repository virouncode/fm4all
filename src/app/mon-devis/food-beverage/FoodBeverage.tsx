import {
  getCafeConsoTarifs,
  getCafeMachines,
  getCafeMachinesTarifs,
  getChocolatConsoTarifs,
  getLaitConsoTarifs,
  getSucreConsoTarifs,
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
import Fontaine from "./(fontaine)/Fontaine";
import SnacksFruits from "./(snacks)/SnacksFruits";
import The from "./(the)/The";

const FoodBeverage = async () => {
  const [
    cafeMachines,
    cafeMachinesTarifs,
    cafeConsoTarifs,
    laitConsoTarifs,
    chocolatConsoTarifs,
    theConsoTarifs,
    sucreConsoTarifs,
    fruitsQuantites,
    fruitsTarifs,
    snacksQuantites,
    snacksTarifs,
    boissonsQuantites,
    boissonsTarifs,
    foodLivraisonTarifs,
  ] = await Promise.all([
    getCafeMachines(),
    getCafeMachinesTarifs(),
    getCafeConsoTarifs(),
    getLaitConsoTarifs(),
    getChocolatConsoTarifs(),
    getTheConsoTarifs(),
    getSucreConsoTarifs(),
    getFruitsQuantites(),
    getFruitsTarifs(),
    getSnacksQuantites(),
    getSnacksTarifs(),
    getBoissonsQuantites(),
    getBoissonsTarifs(),
    getFoodLivraisonTarifs(),
  ]);

  if (
    !cafeMachines ||
    !cafeMachinesTarifs ||
    !cafeConsoTarifs ||
    !laitConsoTarifs ||
    !chocolatConsoTarifs ||
    !theConsoTarifs ||
    !sucreConsoTarifs ||
    !fruitsQuantites ||
    !fruitsTarifs ||
    !snacksQuantites ||
    !snacksTarifs ||
    !boissonsQuantites ||
    !boissonsTarifs ||
    !foodLivraisonTarifs
  ) {
    return (
      <section className="flex h-dvh items-center justify-center text-lg">
        <p>
          Nous n&apos;avons pas trouvé de tarifs pour ces informations.{" "}
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
        cafeMachinesTarifs={cafeMachinesTarifs}
        cafeConsoTarifs={cafeConsoTarifs}
        laitConsoTarifs={laitConsoTarifs}
        chocolatConsoTarifs={chocolatConsoTarifs}
        theConsoTarifs={theConsoTarifs}
        sucreConsoTarifs={sucreConsoTarifs}
      />
      <The theConsoTarifs={theConsoTarifs} />
      <SnacksFruits
        fruitsQuantites={fruitsQuantites}
        fruitsTarifs={fruitsTarifs}
        snacksQuantites={snacksQuantites}
        snacksTarifs={snacksTarifs}
        boissonsQuantites={boissonsQuantites}
        boissonsTarifs={boissonsTarifs}
        foodLivraisonTarifs={foodLivraisonTarifs}
      />
      <Fontaine />
    </section>
  );
};

export default FoodBeverage;
