"use client";
import { Button } from "@/components/ui/button";
import { TypesBoissonsType } from "@/constants/typesBoissons";
import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import useScrollIntoFood from "@/hooks/use-scroll-into-food";
import useScrollIntoMachine from "@/hooks/use-scroll-into-machine";
import { SelectCafeConsoTarifsType } from "@/zod-schemas/cafeConsoTarifs";
import { SelectCafeMachinesType } from "@/zod-schemas/cafeMachine";
import { SelectCafeMachinesTarifsType } from "@/zod-schemas/cafeMachinesTarifs";
import { SelectCafeQuantitesType } from "@/zod-schemas/cafeQuantites";
import { SelectChocoConsoTarifsType } from "@/zod-schemas/chocoConsoTarifs";
import { DureeLocationCafeType } from "@/zod-schemas/dureeLocation";
import { SelectLaitConsoTarifsType } from "@/zod-schemas/laitConsoTarifs";
import { Coffee } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import NextServiceButton from "../../mes-services/NextServiceButton";
import PreviousServiceButton from "../../mes-services/PreviousServiceButton";
import CafeMachine from "./CafeMachine";

type CafeProps = {
  cafeMachines?: SelectCafeMachinesType[];
  cafeQuantites?: SelectCafeQuantitesType[];
  cafeMachinesTarifs?: SelectCafeMachinesTarifsType[];
  cafeConsoTarifs?: SelectCafeConsoTarifsType[];
  laitConsoTarifs?: SelectLaitConsoTarifsType[];
  chocoConsoTarifs?: SelectChocoConsoTarifsType[];
  effectif: string;
  cafeFournisseurId?: string;
};

const Cafe = ({
  cafeMachines,
  cafeQuantites,
  cafeMachinesTarifs,
  cafeConsoTarifs,
  laitConsoTarifs,
  chocoConsoTarifs,
  effectif,
  cafeFournisseurId,
}: CafeProps) => {
  const { setDevisProgress } = useContext(DevisProgressContext);
  const { setFoodBeverage } = useContext(FoodBeverageContext);
  const { cafe, setCafe } = useContext(CafeContext);
  const { setTotalCafe } = useContext(TotalCafeContext);
  const { nettoyage } = useContext(NettoyageContext);
  const { client } = useContext(ClientContext);
  const router = useRouter();
  useScrollIntoFood();
  useScrollIntoMachine();

  const handleClickPrevious = () => {
    const searchParams = new URLSearchParams();
    if (client.effectif)
      searchParams.set("effectif", client.effectif.toString());
    if (client.surface) searchParams.set("surface", client.surface.toString());
    if (nettoyage.fournisseurId)
      searchParams.set("fournisseurId", nettoyage.fournisseurId.toString());
    if (nettoyage.gammeSelected)
      searchParams.set("nettoyageGamme", nettoyage.gammeSelected);
    router.push(`/mon-devis/mes-services?${searchParams.toString()}`);
    setDevisProgress((prev) => ({ ...prev, currentStep: 2 }));
  };
  const handleClickNext = () => {
    if (!cafe.cafeFournisseurId) {
      setFoodBeverage((prev) => ({
        ...prev,
        currentFoodBeverageId: prev.currentFoodBeverageId + 2,
      }));
      return;
    }
    setFoodBeverage((prev) => ({
      ...prev,
      currentFoodBeverageId: prev.currentFoodBeverageId + 1,
    }));
  };

  const handleAddMachine = () => {
    setCafe((prev) => ({
      ...prev,
      currentMachineId: 1,
      machines:
        prev.machines.length > 0
          ? [
              ...prev.machines,
              {
                machineId:
                  prev.machines[prev.machines.length - 1].machineId + 1,
                typeBoissons: "cafe" as TypesBoissonsType,
                dureeLocation: "pa12M" as DureeLocationCafeType,
                nbPersonnes: parseInt(effectif),
                nbMachines: 0,
                propositionId: null,
              },
            ].sort((a, b) => a.machineId - b.machineId)
          : [
              {
                machineId: 1,
                typeBoissons: "cafe" as TypesBoissonsType,
                dureeLocation: "pa12M" as DureeLocationCafeType,
                nbPersonnes: parseInt(effectif),
                nbMachines: 0,
                propositionId: null,
              },
            ],
    }));

    setTotalCafe((prev) => ({
      ...prev,
      prixCafeMachines: [{ machineId: 1, prix: null }],
    }));
  };

  return (
    <div className="flex flex-col gap-6 w-full mx-auto h-full py-2" id="1">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center p-4 border rounded-xl">
          <Coffee />
          <p>Café et boissons chaudes</p>
        </div>
        <p className="text-base flex-1 text-center italic px-4">
          Café expresso, boisson lactée ou boisson gourmande, choisissez la
          gamme de machine qui vous convient le mieux. Forfait mensuel tout
          compris selon durée d&apos;engagement
        </p>
        {cafe.currentMachineId ===
          cafe.machines.map(({ machineId }) => machineId)[0] && (
          <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        {cafe.machines && cafe.machines.length > 0 ? (
          cafe.machines.map((machine) => (
            <CafeMachine
              key={machine.machineId}
              machine={machine}
              cafeMachines={cafeMachines}
              cafeQuantites={cafeQuantites}
              cafeMachinesTarifs={cafeMachinesTarifs}
              cafeConsoTarifs={cafeConsoTarifs}
              laitConsoTarifs={laitConsoTarifs}
              chocoConsoTarifs={chocoConsoTarifs}
              effectif={effectif}
              cafeFournisseurId={cafeFournisseurId}
            />
          ))
        ) : (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="lg"
              className="text-base"
              onClick={handleAddMachine}
            >
              Ajouter une/des machines
            </Button>
          </div>
        )}
      </div>
      {cafe.machines.length === 0 && (
        <div>
          <NextServiceButton handleClickNext={handleClickNext} />
        </div>
      )}
    </div>
  );
};

export default Cafe;
