import useFetchHygiene from "@/hooks/use-fetch-hygiene";
import { Toilet } from "lucide-react";
import NextServiceButton from "../NextServiceButton";
import PreviousServiceButton from "../PreviousServiceButton";
import HygienePropositions from "./HygienePropositions";

type HygieneProps = {
  handleClickNext: () => void;
  handleClickPrevious: () => void;
};

const Hygiene = ({ handleClickNext, handleClickPrevious }: HygieneProps) => {
  const { distribQuantites, distribTarifs, distribInstalTarifs, consoTarifs } =
    useFetchHygiene();

  return (
    <div className="flex flex-col gap-6 w-full mx-auto h-full py-2" id="3">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center flex-1">
          <div className="flex gap-4 items-center p-4 border-2 rounded-xl">
            <Toilet />
            <p>Hygiène sanitaire</p>
          </div>
          <p className="text-base italic w-2/3">
            Un tarif forfaitaire tout compris pour vos sanitaires avec
            distributeurs et consommables mis en place : essuie-main papier,
            savon & papier hygiénique. La gamme détermine la finition des
            distributeurs.
          </p>
        </div>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>
      <div className="w-full flex-1">
        {distribQuantites && (
          <HygienePropositions
            distribQuantites={distribQuantites}
            distribTarifs={distribTarifs}
            distribInstalTarifs={distribInstalTarifs}
            consoTarifs={consoTarifs}
          />

          // <TabsContentHygieneOptions
          //   distribQuantites={distribQuantites}
          //   distribTarifs={distribTarifs}
          //   consoTarifs={consoTarifs}
          // />
        )}
      </div>
      <p className="text-sm italic text-end px-1">*ma NB</p>
      <NextServiceButton handleClickNext={handleClickNext} />
    </div>
  );
};

export default Hygiene;
