import {
  getCafeConsoTarifs,
  getCafeMachines,
  getCafeMachinesTarifs,
  getCafeQuantites,
  getChocoConsoTarifs,
  getLaitConsoTarifs,
  getTheConsoTarifs,
} from "@/lib/queries/boissons-chaudes/getBoissonsChaudes";
import Link from "next/link";
import Cafe from "./(cafe)/Cafe";
import Snacks from "./(snacks)/Snacks";
import The from "./(the)/The";

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
        effectif={effectif}
        cafeFournisseurId={cafeFournisseurId}
      />
      <The theConsoTarifs={theConsoTarifs} effectif={effectif} />
      <Snacks />
    </section>
  );
};

export default FoodBeverage;
