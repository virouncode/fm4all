import {
  getCafeConsoTarifs,
  getCafeMachines,
  getCafeMachinesTarifs,
  getCafeQuantites,
  getChocoConsoTarifs,
  getLaitConsoTarifs,
  getTheConsoTarifs,
} from "@/lib/queries/boissons-chaudes/getBoissonsChaudes";
import Cafe from "./(cafe)/Cafe";
import The from "./(the)/The";
import Snacks from "./(snacks)/Snacks";

type FoodBeverageProps = {
  cafeFournisseurId?: string;
  effectif: string;
};

const FoodBeverage = async ({
  cafeFournisseurId,
  effectif,
}: FoodBeverageProps) => {
  const [
    cafeMachines,
    cafeQuantites,
    cafeMachinesTarifs,
    cafeConsoTarifs,
    laitConsoTarifs,
    chocoConsoTarifs,
    theConsoTarifs,
  ] = await Promise.all([
    getCafeMachines(),
    getCafeQuantites(),
    getCafeMachinesTarifs(),
    getCafeConsoTarifs(),
    getLaitConsoTarifs(),
    getChocoConsoTarifs(),
    getTheConsoTarifs(cafeFournisseurId),
  ]);

  return (
    <section className="flex-1 overflow-hidden">
      <Cafe
        cafeMachines={cafeMachines}
        cafeQuantites={cafeQuantites}
        cafeMachinesTarifs={cafeMachinesTarifs}
        cafeConsoTarifs={cafeConsoTarifs}
        laitConsoTarifs={laitConsoTarifs}
        chocoConsoTarifs={chocoConsoTarifs}
        effectif={effectif}
        cafeFournisseurId={cafeFournisseurId}
      />
      <The theConsoTarifs={theConsoTarifs} effectif={effectif} />
      <Snacks />
    </section>
  );
};

export default FoodBeverage;
