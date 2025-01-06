import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DevisDataContext } from "@/context/DevisDataProvider";
import useFetchProprete from "@/hooks/use-fetch-proprete";
import { useContext, useState } from "react";
import NextServiceButton from "../NextServiceButton";
import PreviousServiceButton from "../PreviousServiceButton";
import TabsContentTrilogie from "./TabsContentTrilogie";

type ConsommablesPropreteProps = {
  handleClickNext: () => void;
  handleClickPrevious: () => void;
  selectedServicesIds: number[];
};

const ConsommablesProprete = ({
  handleClickNext,
  handleClickPrevious,
  selectedServicesIds,
}: ConsommablesPropreteProps) => {
  const { devisData } = useContext(DevisDataContext);
  const [comment, setComment] = useState("");
  const [trilogieGammeSelected, setTrilogieGammeSelected] = useState(
    devisData.services.nettoyage.trilogieGammeSelected
  );
  const { distribQuantites, distribTarifs, distribInstalTarifs, consoTarifs } =
    useFetchProprete();

  return (
    <div className="flex flex-col gap-6 w-full mx-auto h-[600px] py-2" id="2">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-baseline">
          <p className="text-lg">Nettoyage et propreté :</p>
          <p className="text-base italic">sélectionnez vos consommables</p>
        </div>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>
      <Tabs defaultValue="trilogie" className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="trilogie"
            className="text-base"
            onClick={() =>
              setComment(
                "*le tarif comprend la location et l'installation des distributeurs"
              )
            }
          >
            EMP / Savon / PH
          </TabsTrigger>
          <TabsTrigger
            value="options"
            className="text-base"
            disabled={!trilogieGammeSelected}
            onClick={() => setComment("")}
          >
            Options
          </TabsTrigger>
        </TabsList>
        {distribQuantites && (
          <TabsContentTrilogie
            distribQuantites={distribQuantites}
            distribTarifs={distribTarifs}
            distribInstalTarifs={distribInstalTarifs}
            consoTarifs={consoTarifs}
            trilogieGammeSelected={trilogieGammeSelected}
            setTrilogieGammeSelected={setTrilogieGammeSelected}
          />
        )}
      </Tabs>

      {comment && <p className="text-sm italic text-end px-1">{comment}</p>}
      {selectedServicesIds[selectedServicesIds.length - 1] === 2 ? null : (
        <NextServiceButton handleClickNext={handleClickNext} />
      )}
    </div>
  );
};

export default ConsommablesProprete;
