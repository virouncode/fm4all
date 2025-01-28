import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { TheContext } from "@/context/TheProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import { TotalTheContext } from "@/context/TotalTheProvider";
import { toast } from "@/hooks/use-toast";
import { CafeLotType } from "@/zod-schemas/cafe";
import { SelectCafeConsoTarifsType } from "@/zod-schemas/cafeConsoTarifs";
import { SelectCafeMachinesType } from "@/zod-schemas/cafeMachine";
import { SelectCafeMachinesTarifsType } from "@/zod-schemas/cafeMachinesTarifs";
import { SelectCafeQuantitesType } from "@/zod-schemas/cafeQuantites";
import { SelectChocoConsoTarifsType } from "@/zod-schemas/chocoConsoTarifs";
import { SelectLaitConsoTarifsType } from "@/zod-schemas/laitConsoTarifs";
import { SelectTheConsoTarifsType } from "@/zod-schemas/theConsoTarifs";
import { useContext } from "react";
import CafeLotForm from "./CafeLotForm";
import CafeLotPropositions from "./CafeLotPropositions";
import PreviousLotButton from "./PreviousLotButton";
import { reinitialisationCafeThe } from "./reinitialisationCafeThe";
import RetirerLotButton from "./RetirerLotButton";

type CafeMachineProps = {
  lot: CafeLotType;
  cafeMachines: SelectCafeMachinesType[];
  cafeQuantites: SelectCafeQuantitesType[];
  cafeMachinesTarifs: SelectCafeMachinesTarifsType[];
  cafeConsoTarifs: SelectCafeConsoTarifsType[];
  laitConsoTarifs: SelectLaitConsoTarifsType[];
  chocoConsoTarifs: SelectChocoConsoTarifsType[];
  theConsoTarifs: SelectTheConsoTarifsType[];
};

const CafeLot = ({
  lot,
  cafeMachines,
  cafeQuantites,
  cafeMachinesTarifs,
  cafeConsoTarifs,
  laitConsoTarifs,
  chocoConsoTarifs,
  theConsoTarifs,
}: CafeMachineProps) => {
  const { client } = useContext(ClientContext);
  const { cafe, setCafe } = useContext(CafeContext);
  const { setThe } = useContext(TheContext);
  const { setTotalCafe } = useContext(TotalCafeContext);
  const { setTotalThe } = useContext(TotalTheContext);
  const cafeLotsMachinesIds = cafe.lotsMachines.map((lot) => lot.infos.lotId);

  const handleClickPreviousLot = () => {
    const currentLotIdIndex = cafeLotsMachinesIds.indexOf(lot.infos.lotId);
    setCafe((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        currentLotId: prev.lotsMachines[currentLotIdIndex - 1].infos.lotId,
      },
    }));
  };

  const handleClickRemove = () => {
    if (cafeLotsMachinesIds[0] === lot.infos.lotId) {
      //Je reinitialise tout
      reinitialisationCafeThe(
        setCafe,
        setThe,
        setTotalCafe,
        setTotalThe,
        client
      );
      return;
    }
    const indexOfCurrentLot = cafeLotsMachinesIds.indexOf(lot.infos.lotId);
    setCafe((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        currentLotId: cafeLotsMachinesIds[indexOfCurrentLot - 1],
      },
      lotsMachines: prev.lotsMachines.filter(
        (item) => item.infos.lotId !== lot.infos.lotId
      ),
    }));
    setTotalCafe((prev) => ({
      totalMachines: prev.totalMachines.filter(
        (item) => item.lotId !== lot.infos.lotId
      ),
    }));
  };

  const handleAlert = () => {
    if (cafeLotsMachinesIds.slice(-1)[0] !== lot.infos.lotId) {
      toast({
        description: "Veuillez d'abord retirer les machines suivantes",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="h-full flex flex-col" id={`lot_${lot.infos.lotId}`}>
      {/* <CafeLotSummary lot={lot} /> */}
      <div className="w-full flex justify-between items-start py-1">
        <CafeLotForm
          lot={lot}
          cafeMachines={cafeMachines}
          cafeQuantites={cafeQuantites}
          cafeMachinesTarifs={cafeMachinesTarifs}
          cafeConsoTarifs={cafeConsoTarifs}
          laitConsoTarifs={laitConsoTarifs}
          chocoConsoTarifs={chocoConsoTarifs}
        />
        <div className="flex gap-2 items-center">
          {cafeLotsMachinesIds[0] !== lot.infos.lotId && (
            <PreviousLotButton
              handleClickPreviousLot={handleClickPreviousLot}
            />
          )}
          <div onClick={handleAlert}>
            <RetirerLotButton
              handleClickRemove={handleClickRemove}
              disabled={
                cafeLotsMachinesIds[0] !== lot.infos.lotId &&
                cafeLotsMachinesIds.slice(-1)[0] !== lot.infos.lotId
              }
              all={cafeLotsMachinesIds[0] === lot.infos.lotId}
              lotId={lot.infos.lotId}
            />
          </div>
        </div>
      </div>
      <CafeLotPropositions
        cafeMachines={cafeMachines}
        cafeQuantites={cafeQuantites}
        cafeMachinesTarifs={cafeMachinesTarifs}
        cafeConsoTarifs={cafeConsoTarifs}
        laitConsoTarifs={laitConsoTarifs}
        chocoConsoTarifs={chocoConsoTarifs}
        theConsoTarifs={theConsoTarifs}
        lot={lot}
      />
    </div>
  );
};

export default CafeLot;
