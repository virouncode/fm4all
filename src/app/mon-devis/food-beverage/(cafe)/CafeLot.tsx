import { Button } from "@/components/ui/button";
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
import { Trash2 } from "lucide-react";
import { useContext } from "react";
import LotPropositions from "./LotPropositions";
import LotUpdateForm from "./LotUpdateForm";
import { reinitialisationCafeThe } from "./reinitialisationCafeThe";

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

  const handleClikPreviousLot = () => {
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
      {/* <p className="font-bold text-center mb-4">
        Lot n°{lot.infos.lotId}
        {lot.infos.gammeCafeSelected && (
          <span className="font-normal">
            {" "}
            : {lot.quantites.nbMachines} machine(s) {lot.infos.marque}{" "}
            {lot.infos.modele}, café {lot.infos.gammeCafeSelected}
          </span>
        )}
      </p> */}
      <div className="w-full flex justify-between items-start">
        <LotUpdateForm
          lot={lot}
          cafeMachines={cafeMachines}
          cafeQuantites={cafeQuantites}
          cafeMachinesTarifs={cafeMachinesTarifs}
          cafeConsoTarifs={cafeConsoTarifs}
          laitConsoTarifs={laitConsoTarifs}
          chocoConsoTarifs={chocoConsoTarifs}
          theConsoTarifs={theConsoTarifs}
        />
        <div className="flex gap-2 items-center">
          {cafeLotsMachinesIds[0] !== lot.infos.lotId && (
            <Button
              variant="outline"
              size="sm"
              title="Machine précédente"
              type="button"
              onClick={handleClikPreviousLot}
            >
              Machine(s) précédente(s) ↑
            </Button>
          )}
          <div onClick={handleAlert}>
            <Button
              variant="destructive"
              size="sm"
              title="Retirer"
              onClick={handleClickRemove}
              type="button"
              disabled={
                cafeLotsMachinesIds[0] !== lot.infos.lotId &&
                cafeLotsMachinesIds.slice(-1)[0] !== lot.infos.lotId
              }
            >
              <Trash2 />
              {cafeLotsMachinesIds[0] === lot.infos.lotId
                ? "Retirer tous les lots"
                : `Retirer lot n°${lot.infos.lotId}`}
            </Button>
          </div>
        </div>
      </div>
      <LotPropositions
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
